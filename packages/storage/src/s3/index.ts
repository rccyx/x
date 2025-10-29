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
import type { MaybeUndefined } from "ts-roids";
import { env } from "@ashgw/env";
import { logger } from "@ashgw/logger";

import type {
  Folder,
  PutOptions,
  PresignGetOptions,
  PresignPutOptions,
  ListKeysPage,
} from "../base";
import { BaseStorageService } from "../base";

try {
  setDefaultResultOrder("ipv4first");
} catch {
  //
}

const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 8000;

export class S3Service extends BaseStorageService {
  protected readonly client: AwsS3Client;
  protected readonly bucket: string;
  protected readonly region: string;
  protected readonly bucketUrl: string | undefined;

  constructor() {
    super();
    this.region = env.S3_BUCKET_REGION;
    this.client = new AwsS3Client({
      region: this.region,
      credentials: {
        accessKeyId: env.S3_BUCKET_ACCESS_KEY_ID,
        secretAccessKey: env.S3_BUCKET_SECRET_KEY,
      },
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

  public override async fetchFile<F extends Folder>({
    folder,
    filename,
  }: {
    folder: F;
    filename: string;
  }): Promise<Buffer> {
    return this.fetchAnyFile({ key: `${folder}/${filename}` });
  }

  public override async uploadFile({
    folder,
    filename,
    body,
    options,
  }: {
    folder: Folder;
    filename: string;
    body: Buffer;
    options?: PutOptions;
  }): Promise<string> {
    const key = `${folder}/${filename}`;
    await this.uploadAnyFile({ key, body, options });
    return key;
  }

  public override async deleteFile<F extends Folder>({
    folder,
    filename,
  }: {
    folder: F;
    filename: string;
  }): Promise<string> {
    const key = `${folder}/${filename}`;
    await this.deleteAnyFile({ key });
    return key;
  }

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

  public override async exists({ key }: { key: string }): Promise<boolean> {
    try {
      await this.head({ key });
      return true;
    } catch (err) {
      if (this._isNotFound(err)) return false;
      throw err;
    }
  }

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
    const clientForPresign = this.client as unknown as Parameters<
      typeof getSignedUrl
    >[0];
    const url = await getSignedUrl(clientForPresign, cmd, {
      expiresIn: options?.expiresIn ?? 900,
    });
    return url;
  }

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
    const clientForPresign = this.client as unknown as Parameters<
      typeof getSignedUrl
    >[0];
    const url = await getSignedUrl(clientForPresign, cmd, {
      expiresIn: options?.expiresIn ?? 900,
    });
    return url;
  }

  public override getPublicUrl({ key }: { key: string }): string {
    if (this.bucketUrl) {
      const base = this.bucketUrl.endsWith("/")
        ? this.bucketUrl.slice(0, -1)
        : this.bucketUrl;
      return `${base}/${encodeURI(key)}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${encodeURI(key)}`;
  }

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
    const clientForPresign = this.client as unknown as Parameters<
      typeof getSignedUrl
    >[0];
    const url = await getSignedUrl(clientForPresign, cmd, {
      expiresIn: expiresIn ?? 900,
    });
    return url;
  }

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

  private _isNotFound(err: unknown): boolean {
    if (err instanceof S3ServiceException) {
      const code = err.$metadata?.httpStatusCode ?? 0;
      if (code === 404 || err.name === "NotFound" || err.name === "NoSuchKey")
        return true;
    }
    return false;
  }

  private _isRetryable(err: unknown): boolean {
    if (err instanceof S3ServiceException) {
      const code = err.$metadata?.httpStatusCode ?? 0;
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

  private _throwFormatted(err: unknown, key: string, op: string): never {
    if (this._isNotFound(err)) {
      throw new Error(`file ${key} not found`);
    }
    throw new Error(`s3 ${op} failed for key "${key}"`);
  }

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

export const s3Client = global._s3Client ?? new S3Service();
export type S3Client = typeof s3Client;

if (env.NODE_ENV !== "production") global._s3Client = s3Client;
