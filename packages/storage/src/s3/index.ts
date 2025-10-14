import { setDefaultResultOrder } from "node:dns";
import { setTimeout as sleep } from "timers/promises";
import {
  setTimeout as setAbortTimeout,
  clearTimeout as clearAbortTimeout,
} from "timers";
import type { Readable } from "stream";
import type { MaybeUndefined } from "ts-roids";
import {
  S3Client as AwsS3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { AppError } from "@ashgw/runner";
import { env } from "@ashgw/env";

import { logger } from "@ashgw/logger";

import type { Folder } from "../base";
import { BaseStorageService } from "../base";

try {
  setDefaultResultOrder("ipv4first");
} catch {
  // Node < 18 – ignore
}

const MAX_RETRIES = 3;

export class S3Service extends BaseStorageService {
  /**
   * In-memory cache for S3 objects with timestamp for TTL tracking.
   * @private
   */
  protected readonly cache = new Map<
    string,
    { data: Buffer; timestamp: number }
  >();

  /**
   * Cache time-to-live in milliseconds (5 minutes).
   * @private
   */
  protected static readonly CACHE_TTL = 5 * 60 * 1000;

  /**
   * Maximum number of items to keep in cache to prevent memory leaks.
   * @private
   */
  protected static readonly MAX_CACHE_SIZE = 100;

  protected readonly client: AwsS3Client;
  protected readonly bucket: string;

  constructor() {
    super();
    this.client = new AwsS3Client({
      region: env.S3_BUCKET_REGION,
      credentials: {
        accessKeyId: env.S3_BUCKET_ACCESS_KEY_ID,
        secretAccessKey: env.S3_BUCKET_SECRET_KEY,
      },
      // Use SDK's default Node handler. Node's global http/https agents will still
      // provide keep-alive behavior as configured at the process level.
      maxAttempts: 2,
    });
    this.bucket = env.S3_BUCKET_NAME;

    logger.info("S3 client initialized", {
      region: env.S3_BUCKET_REGION,
      bucket: this.bucket,
      keepAlive: true,
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
    contentType,
  }: {
    folder: Folder;
    filename: string;
    body: Buffer;
    contentType?: string;
  }): Promise<string> {
    const key = `${folder}/${filename}`;
    return this.uploadAnyFile({ key, body, contentType });
  }

  /**
   * Deletes a file from the specified S3 folder
   * @param params Delete parameters object
   * @param params.folder The folder containing the file to delete
   * @param params.filename The name of the file to delete
   * @returns The key of the deleted file
   */
  public async deleteFile<F extends Folder>({
    folder,
    filename,
  }: {
    folder: F;
    filename: string;
  }): Promise<string> {
    const key = `${folder}/${filename}`;
    return this.deleteAnyFile({ key });
  }

  public override async deleteAnyFile({
    key,
  }: {
    key: string;
  }): Promise<string> {
    let attempts = 0;
    let lastError: unknown;

    while (attempts < MAX_RETRIES) {
      const t0 = Date.now();
      try {
        await this.client.send(
          new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
        );
        const ms = Date.now() - t0;
        logger.info("S3 DeleteObject", { key, ms });
        // Remove from cache if exists
        this.cache.delete(key);
        return key;
      } catch (err) {
        lastError = err;
        attempts++;

        if (
          err instanceof S3ServiceException &&
          (err.name === "SlowDown" || err.name === "RequestTimeout")
        ) {
          await sleep(Math.pow(2, attempts) * 100);
          continue;
        }

        throw this._formatError(err, key);
      }
    }

    throw this._formatError(lastError, key);
  }

  public override async fetchAnyFile({
    key,
  }: {
    key: string;
  }): Promise<Buffer> {
    // check cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < S3Service.CACHE_TTL) {
      return cached.data;
    }

    let attempts = 0;
    let lastError: unknown;

    while (attempts < MAX_RETRIES) {
      const t0 = Date.now();
      const ac = new AbortController();
      const abortTimer = setAbortTimeout(() => ac.abort(), 6000);

      try {
        const res = await this.client.send(
          new GetObjectCommand({ Bucket: this.bucket, Key: key }),
          { abortSignal: ac.signal },
        );

        if (!res.Body) {
          throw new AppError({
            code: "NOT_FOUND",
            message: `File ${key} not found`,
            meta: {
              upstream: {
                service: "S3",
                operation: "GetObject",
              },
            },
          });
        }

        const buffer = await this._streamToBuffer(res.Body as Readable);
        const ms = Date.now() - t0;

        const meta = res.$metadata;
        const bytes = res.ContentLength ?? buffer.byteLength;

        logger.info("S3 GetObject", {
          key,
          bytes,
          ms,
          attempts: meta.attempts,
          requestId: meta.requestId,
          extendedRequestId: meta.extendedRequestId,
        });

        this.cache.set(key, { data: buffer, timestamp: Date.now() });
        this._pruneCache();

        clearAbortTimeout(abortTimer);
        return buffer;
      } catch (err) {
        clearAbortTimeout(abortTimer);
        lastError = err;
        attempts++;

        if (
          err instanceof S3ServiceException &&
          (err.name === "SlowDown" || err.name === "RequestTimeout")
        ) {
          await sleep(Math.pow(2, attempts) * 100);
          continue;
        }

        throw this._formatError(err, key);
      }
    }

    throw this._formatError(lastError, key);
  }

  public override async uploadAnyFile({
    key,
    body,
    contentType,
  }: {
    key: string;
    body: Buffer;
    contentType?: string;
  }): Promise<string> {
    let attempts = 0;
    let lastError: unknown;

    while (attempts < MAX_RETRIES) {
      const t0 = Date.now();
      try {
        await this.client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
          }),
        );
        const ms = Date.now() - t0;
        logger.info("S3 PutObject", { key, bytes: body.byteLength, ms });

        // Update cache
        this.cache.set(key, { data: body, timestamp: Date.now() });
        this._pruneCache();

        return key;
      } catch (err) {
        lastError = err;
        attempts++;

        if (
          err instanceof S3ServiceException &&
          (err.name === "SlowDown" || err.name === "RequestTimeout")
        ) {
          await sleep(Math.pow(2, attempts) * 100);
          continue;
        }

        throw this._formatError(err, key);
      }
    }

    throw this._formatError(lastError, key);
  }

  private _formatError(err: unknown, key: string): Error {
    if (err instanceof S3ServiceException && err.name === "NoSuchKey") {
      return new AppError({
        code: "NOT_FOUND",
        message: `File ${key} not found`,
        cause: err,
      });
    }

    return new AppError({
      code: "INTERNAL",
      message: `S3 operation failed for key "${key}"`,
      cause: err,
    });
  }

  /** Convert a Node stream returned by AWS SDK v3 into a Buffer. */
  private async _streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(
        typeof chunk === "string" ? Buffer.from(chunk) : (chunk as Uint8Array),
      );
    }
    return Buffer.concat(chunks);
  }

  /**
   * Prunes the cache by removing oldest entries when size exceeds the maximum limit.
   * @private
   */
  private _pruneCache(): void {
    if (this.cache.size > S3Service.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const entriesToRemove = entries.slice(
        0,
        entries.length - S3Service.MAX_CACHE_SIZE,
      );
      for (const [entryKey] of entriesToRemove) {
        this.cache.delete(entryKey);
      }
    }
  }
}

declare global {
  // eslint-disable-next-line no-var
  var _s3Client: MaybeUndefined<S3Service>;
}

export const s3Client = global._s3Client ?? new S3Service();
export type S3Client = typeof s3Client;

// hot reloads in next dev
if (env.NODE_ENV !== "production") global._s3Client = s3Client;
