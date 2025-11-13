/**
 * Node runtime S3 implementation of BaseStorageService.
 *
 * Characteristics:
 * - Uses @aws-sdk/client-s3 v3 commands and getSignedUrl for presigning.
 * - Retries transient S3 errors with exponential backoff.
 * - Converts NotFound/NoSuchKey into clean errors or booleans where appropriate.
 * - getPublicUrl prefers a custom bucketUrl if provided, else uses virtual-hosted style.
 *
 * Runtime:
 * - Depends on Node timers, streams, and dns. Not suitable for Workers without a separate edge impl.
 *
 * Env contract (via @rccyx/env):
 * - S3_BUCKET_REGION
 * - S3_BUCKET_NAME
 * - S3_BUCKET_ACCESS_KEY_ID
 * - S3_BUCKET_SECRET_KEY
 * - S3_BUCKET_URL (optional CDN or static site origin, no trailing slash)
 */
import { setDefaultResultOrder } from "node:dns";
import {
  S3Client as AwsS3Client,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3ServiceException,
  HeadObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { setTimeout as setAbortTimeout } from "timers";
import { setTimeout as sleep } from "timers/promises";
import type { Readable } from "stream";
import type { MaybeUndefined } from "typyx";
import { env } from "@rccyx/env";
import { logger } from "@rccyx/logger";

import type {
  PutOptions,
  PresignGetOptions,
  PresignPutOptions,
  ListKeysPage,
} from "../base";
import { BaseStorageService } from "../base";

// Prefer IPv4 first to reduce connection issues when dual-stack DNS returns IPv6 before IPv4.
// Safe no-op on older Node versions where the API may not exist.
try {
  setDefaultResultOrder("ipv4first");
} catch {
  //
}

/** Max retry attempts for a single S3 operation inside _retry. */
const MAX_RETRIES = 3;
/** Per attempt deadline in milliseconds before aborting the underlying request. */
const DEFAULT_TIMEOUT_MS = 8000;

type PresignClient = Parameters<typeof getSignedUrl>[0];
type PresignCommand = Parameters<typeof getSignedUrl>[1];

/**
 * Thin wrapper around getSignedUrl to keep types local.
 * - expiresIn is in seconds.
 */
async function presign(
  client: AwsS3Client,
  command: PresignCommand,
  opts: { expiresIn: number },
): Promise<string> {
  return getSignedUrl(client as unknown as PresignClient, command, opts);
}

export class S3Service extends BaseStorageService {
  /** Low level AWS SDK client. */
  protected readonly client: AwsS3Client;
  /** Bucket name. */
  protected readonly bucket: string;
  /** AWS region string. */
  protected readonly region: string;
  /** Optional public base URL for building CDN or static site links. */
  protected readonly bucketUrl: string | undefined;

  /**
   * Create a new S3Service bound to env-configured credentials and bucket.
   *
   * Security:
   * - Ensure the provided IAM key has least privilege for the needed operations.
   * Observability:
   * - Logs each S3 op with op name, key, latency, and attempt count.
   */
  constructor() {
    super();
    this.region = env.S3_BUCKET_REGION;
    this.client = new AwsS3Client({
      region: this.region,
      credentials: {
        accessKeyId: env.S3_BUCKET_ACCESS_KEY_ID,
        secretAccessKey: env.S3_BUCKET_SECRET_KEY,
      },
      // SDK also has its own internal retry logic; we keep this modest and layer our own for timeouts.
      maxAttempts: 2,
    });
    this.bucket = env.S3_BUCKET_NAME;
    this.bucketUrl = env.S3_BUCKET_URL;

    logger.info("s3 client ready", {
      region: this.region,
      bucket: this.bucket,
      maxAttempts: 2,
    });
  }

  /**
   * Delete a single object.
   * Returns the key on success.
   * Errors:
   * - Non-existent keys are treated as success by S3 DeleteObject.
   */
  public override async deleteAnyFile({
    key,
  }: {
    key: string;
  }): Promise<string> {
    await this._retry(
      async () => {
        await this.client.send(
          new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
        );
      },
      key,
      "DeleteObject",
      DEFAULT_TIMEOUT_MS,
    );
    return key;
  }

  /**
   * Download an object body fully into memory.
   * Throws "file <key> not found" if the object does not exist.
   * For very large objects, prefer a streaming read in your app layer.
   */
  public override async fetchAnyFile({
    key,
  }: {
    key: string;
  }): Promise<Buffer> {
    const res = await this._retry(
      async (ac) => {
        const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
        return this.client.send(cmd, { abortSignal: ac.signal });
      },
      key,
      "GetObject",
      DEFAULT_TIMEOUT_MS,
    );

    if (!res.Body) {
      throw new Error(`file ${key} not found`);
    }
    return this._streamToBuffer(res.Body as Readable);
  }

  /**
   * Upload a complete object from a Buffer using PutObject.
   * Use multipart for files that may exceed timeouts or need resumability.
   * Returns the key on success.
   */
  public override async uploadAnyFile({
    key,
    body,
    options,
  }: {
    key: string;
    body: Buffer;
    options?: PutOptions;
  }): Promise<string> {
    await this._retry(
      async () => {
        const cmd = new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: options?.contentType,
          CacheControl: options?.cacheControl,
          ContentDisposition: options?.contentDisposition,
          Metadata: options?.metadata,
          ServerSideEncryption: options?.serverSideEncryption,
          SSEKMSKeyId: options?.sseKmsKeyId,
        });
        await this.client.send(cmd);
      },
      key,
      "PutObject",
      DEFAULT_TIMEOUT_MS,
    );
    return key;
  }

  /**
   * Retrieve metadata for an object without fetching the body.
   * Returns size in bytes, content type, ETag, last modified, and user metadata.
   */
  public override async head({ key }: { key: string }) {
    const res = await this._retry(
      async () => {
        const cmd = new HeadObjectCommand({ Bucket: this.bucket, Key: key });
        return this.client.send(cmd);
      },
      key,
      "HeadObject",
      DEFAULT_TIMEOUT_MS,
    );

    return {
      contentLength: res.ContentLength ?? 0,
      contentType: res.ContentType,
      etag: res.ETag,
      lastModified: res.LastModified,
      metadata: res.Metadata,
    };
  }

  /**
   * Check whether a key exists. Maps 404 and NoSuchKey to false.
   */
  public override async exists({ key }: { key: string }): Promise<boolean> {
    try {
      await this.head({ key });
      return true;
    } catch (err) {
      if (this._isNotFound(err)) return false;
      throw err;
    }
  }

  /**
   * List a page of keys under a prefix.
   * - maxKeys: up to 1000 on S3.
   * - token: pass NextContinuationToken from a previous page.
   */
  public override async listKeysPage({
    prefix,
    maxKeys,
    token,
  }: {
    prefix: string;
    maxKeys?: number;
    token?: string;
  }): Promise<ListKeysPage> {
    const res = await this._retry(
      async () => {
        const cmd = new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          MaxKeys: maxKeys,
          ContinuationToken: token,
        });
        return this.client.send(cmd);
      },
      prefix,
      "ListObjectsV2",
      DEFAULT_TIMEOUT_MS,
    );

    const keys = (res.Contents ?? [])
      .map((c) => c.Key)
      .filter((k): k is string => typeof k === "string");
    return { keys, nextToken: res.NextContinuationToken };
  }

  /**
   * List all keys for a prefix by paging until exhaustion.
   * For very large listings, consider consuming pages to avoid large arrays.
   */
  public override async listAllKeys({
    prefix,
  }: {
    prefix: string;
  }): Promise<string[]> {
    const out: string[] = [];
    let token: string | undefined;
    do {
      const page = await this.listKeysPage({ prefix, token, maxKeys: 1000 });
      out.push(...page.keys);
      token = page.nextToken;
    } while (token);
    return out;
  }

  /**
   * Server-side copy. Good for renames or intra-bucket moves.
   * Metadata behavior follows S3 defaults unless modified; here we do a basic copy.
   */
  public override async copyObject({
    sourceKey,
    targetKey,
  }: {
    sourceKey: string;
    targetKey: string;
  }): Promise<string> {
    await this._retry(
      async () => {
        const cmd = new CopyObjectCommand({
          Bucket: this.bucket,
          CopySource: `/${this.bucket}/${sourceKey}`,
          Key: targetKey,
        });
        await this.client.send(cmd);
      },
      `${sourceKey} -> ${targetKey}`,
      "CopyObject",
      DEFAULT_TIMEOUT_MS,
    );
    return targetKey;
  }

  /**
   * Move implemented as copy + delete. Partial failure can leave both objects; caller should handle that.
   */
  public override async moveObject({
    sourceKey,
    targetKey,
  }: {
    sourceKey: string;
    targetKey: string;
  }): Promise<string> {
    await this.copyObject({ sourceKey, targetKey });
    await this.deleteAnyFile({ key: sourceKey });
    return targetKey;
  }

  /**
   * Delete all objects under a prefix using paged List + batch DeleteObjects.
   * Returns the count deleted.
   */
  public override async deletePrefix({
    prefix,
  }: {
    prefix: string;
  }): Promise<number> {
    let deleted = 0;
    let token: string | undefined;
    do {
      const res = await this._retry(
        async () => {
          const list = await this.client.send(
            new ListObjectsV2Command({
              Bucket: this.bucket,
              Prefix: prefix,
              ContinuationToken: token,
              MaxKeys: 1000,
            }),
          );
          const keys = (list.Contents ?? [])
            .map((o) => o.Key)
            .filter((k): k is string => typeof k === "string");
          if (keys.length > 0) {
            await this.client.send(
              new DeleteObjectsCommand({
                Bucket: this.bucket,
                Delete: { Objects: keys.map((k) => ({ Key: k })), Quiet: true },
              }),
            );
            deleted += keys.length;
          }
          return list;
        },
        prefix,
        "List+DeleteObjects",
        DEFAULT_TIMEOUT_MS,
      );
      token = res.NextContinuationToken;
    } while (token);
    return deleted;
  }

  /**
   * Create a presigned GET URL.
   * - Use responseContentDisposition to force attachment download with a filename.
   * - Default expiry is 900 seconds if not provided.
   */
  public override async getPresignedGetUrl({
    key,
    options,
  }: {
    key: string;
    options?: PresignGetOptions;
  }): Promise<string> {
    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseContentType: options?.responseContentType,
      ResponseContentDisposition: options?.responseContentDisposition,
    });
    return presign(this.client, cmd as unknown as PresignCommand, {
      expiresIn: options?.expiresIn ?? 900,
    });
  }

  /**
   * Create a presigned PUT URL for direct upload.
   * - Sign the headers you expect the client to send.
   * - Ensure CORS on the bucket allows PUT with these headers if uploading from browsers.
   */
  public override async getPresignedPutUrl({
    key,
    options,
  }: {
    key: string;
    options?: PresignPutOptions;
  }): Promise<string> {
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: options?.contentType,
      CacheControl: options?.cacheControl,
      ContentDisposition: options?.contentDisposition,
      Metadata: options?.metadata,
      ServerSideEncryption: options?.serverSideEncryption,
      SSEKMSKeyId: options?.sseKmsKeyId,
    });
    return presign(this.client, cmd as unknown as PresignCommand, {
      expiresIn: options?.expiresIn ?? 900,
    });
  }

  /**
   * Build a public URL for an object.
   * - If bucketUrl is set, it is treated as the origin (CDN or static site).
   * - Else fall back to AWS virtual-hosted style URL using region and bucket.
   * Private buckets will still require presigned URLs for access.
   */
  public override getPublicUrl({ key }: { key: string }): string {
    if (this.bucketUrl) {
      const base = this.bucketUrl.endsWith("/")
        ? this.bucketUrl.slice(0, -1)
        : this.bucketUrl;
      return `${base}/${encodeURI(key)}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${encodeURI(key)}`;
  }

  /**
   * Start a multipart upload. Returns { uploadId }.
   * Use when uploading large files or when you need resumability.
   */
  public override async createMultipartUpload({
    key,
    options,
  }: {
    key: string;
    options?: PutOptions;
  }): Promise<{ uploadId: string }> {
    const res = await this._retry(
      async () => {
        const cmd = new CreateMultipartUploadCommand({
          Bucket: this.bucket,
          Key: key,
          ContentType: options?.contentType,
          CacheControl: options?.cacheControl,
          ContentDisposition: options?.contentDisposition,
          Metadata: options?.metadata,
          ServerSideEncryption: options?.serverSideEncryption,
          SSEKMSKeyId: options?.sseKmsKeyId,
        });
        return this.client.send(cmd);
      },
      key,
      "CreateMultipartUpload",
      DEFAULT_TIMEOUT_MS,
    );

    const uploadId = res.UploadId;
    if (!uploadId) {
      throw new Error("missing upload id");
    }
    return { uploadId };
  }

  /**
   * Create a presigned URL to upload one part of a multipart upload.
   * - partNumber starts at 1.
   * - Keep expiry short and rotate if the client is slow.
   */
  public override async getPresignedUploadPartUrl({
    key,
    uploadId,
    partNumber,
    expiresIn,
  }: {
    key: string;
    uploadId: string;
    partNumber: number;
    expiresIn?: number;
  }): Promise<string> {
    const cmd = new UploadPartCommand({
      Bucket: this.bucket,
      Key: key,
      PartNumber: partNumber,
      UploadId: uploadId,
    });
    return presign(this.client, cmd as unknown as PresignCommand, {
      expiresIn: expiresIn ?? 900,
    });
  }

  /**
   * Complete a multipart upload by providing an ordered list of parts with their ETags.
   * Returns the key on success.
   */
  public override async completeMultipartUpload({
    key,
    uploadId,
    parts,
  }: {
    key: string;
    uploadId: string;
    parts: { etag: string; partNumber: number }[];
  }): Promise<string> {
    await this._retry(
      async () => {
        const cmd = new CompleteMultipartUploadCommand({
          Bucket: this.bucket,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: {
            Parts: parts.map((p) => ({
              ETag: p.etag,
              PartNumber: p.partNumber,
            })),
          },
        });
        await this.client.send(cmd);
      },
      key,
      "CompleteMultipartUpload",
      DEFAULT_TIMEOUT_MS,
    );
    return key;
  }

  /**
   * Abort a multipart upload to free storage used by uploaded parts.
   */
  public override async abortMultipartUpload({
    key,
    uploadId,
  }: {
    key: string;
    uploadId: string;
  }): Promise<void> {
    await this._retry(
      async () => {
        const cmd = new AbortMultipartUploadCommand({
          Bucket: this.bucket,
          Key: key,
          UploadId: uploadId,
        });
        await this.client.send(cmd);
      },
      key,
      "AbortMultipartUpload",
      DEFAULT_TIMEOUT_MS,
    );
  }

  /**
   * Internal retry wrapper with exponential backoff.
   * - Aborts the underlying request if it exceeds timeoutMs.
   * - Retries on server-side and throttling signals.
   * - Logs attempt count and latency.
   */
  private async _retry<T>(
    fn: (ac: AbortController) => Promise<T> | T,
    key: string,
    op: string,
    timeoutMs: number,
  ): Promise<T> {
    let attempts = 0;
    let lastErr: unknown;
    while (attempts < MAX_RETRIES) {
      const ac = new AbortController();
      const timer = setAbortTimeout(() => ac.abort(), timeoutMs);
      const t0 = Date.now();
      try {
        const res = await Promise.resolve(fn(ac));
        const ms = Date.now() - t0;
        clearTimeout(timer);
        logger.info("s3 op", { op, key, ms, attempts });
        return res as T;
      } catch (err) {
        clearTimeout(timer);
        lastErr = err;
        attempts++;
        if (this._isRetryable(err) && attempts < MAX_RETRIES) {
          await sleep(Math.pow(2, attempts) * 100);
          continue;
        }
        this._throwFormatted(err, key, op);
      }
    }
    this._throwFormatted(lastErr, key, op);
  }

  /**
   * True if an error represents missing object.
   * Maps common S3 classifications: 404 status, NotFound, NoSuchKey.
   */
  private _isNotFound(err: unknown): boolean {
    if (err instanceof S3ServiceException) {
      const code = err.$metadata.httpStatusCode ?? 0;
      if (code === 404 || err.name === "NotFound" || err.name === "NoSuchKey")
        return true;
    }
    return false;
  }

  /**
   * True if the error is transient or indicates throttling.
   * Includes 5xx, SlowDown, RequestTimeout, and 429-like signals from some backends.
   */
  private _isRetryable(err: unknown): boolean {
    if (err instanceof S3ServiceException) {
      const code = err.$metadata.httpStatusCode ?? 0;
      if (code >= 500) return true;
      if (
        err.name === "SlowDown" ||
        err.name === "RequestTimeout" ||
        code === 429
      )
        return true;
    }
    return false;
  }

  /**
   * Normalize errors into clear messages for callers.
   * NotFound conditions become "file <key> not found". Others include op and key.
   */
  private _throwFormatted(err: unknown, key: string, op: string): never {
    if (this._isNotFound(err)) {
      throw new Error(`file ${key} not found`);
    }
    throw new Error(`s3 ${op} failed for key "${key}"`);
  }

  /**
   * Convert a Node Readable stream to a Buffer.
   * For large objects, consider a streaming API at the application level.
   */
  private async _streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(
        typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Uint8Array),
      );
    }
    return Buffer.concat(chunks);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var _s3Client: MaybeUndefined<S3Service>;
}

/**
 * Singleton S3 client for the current process.
 * - Reused across hot reload in dev to avoid multiple clients.
 */
export const s3Client = global._s3Client ?? new S3Service();
/** Public type alias for consumers. */
export type S3Client = typeof s3Client;

if (env.NODE_ENV !== "production") global._s3Client = s3Client;
