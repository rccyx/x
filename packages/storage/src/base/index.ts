/**
 * Common option bag for object PUT operations.
 *
 * Most fields map 1:1 to S3 PutObject headers and are widely supported by S3-compatible backends.
 * - contentType: sets Content-Type on the object.
 * - cacheControl: HTTP Cache-Control.
 * - contentDisposition: influences filename on download.
 * - metadata: user metadata key/value pairs. Keys are usually case-insensitive on S3.
 * - serverSideEncryption: "AES256" or "aws:kms".
 * - sseKmsKeyId: required if serverSideEncryption is "aws:kms".
 *
 * Notes:
 * - For large uploads prefer multipart to avoid timeouts and to enable resumability.
 * - Some providers validate metadata key formats more strictly than S3.
 */
export interface PutOptions {
  contentType?: string;
  cacheControl?: string;
  contentDisposition?: string;
  metadata?: Record<string, string>;
  serverSideEncryption?: "AES256" | "aws:kms";
  sseKmsKeyId?: string;
}

/**
 * Options for presigned GET URLs.
 *
 * - expiresIn: link TTL in seconds. Default is typically 900.
 * - responseContentType: override Content-Type in the response.
 * - responseContentDisposition: e.g. "attachment; filename=\"report.pdf\"".
 *
 * Security:
 * - Anyone with the URL can access until it expires or is revoked by credentials rotation.
 */
export interface PresignGetOptions {
  expiresIn?: number;
  responseContentType?: string;
  responseContentDisposition?: string;
}

/**
 * Options for presigned PUT URLs.
 *
 * - expiresIn: link TTL in seconds. Default is typically 900.
 * - contentType, cacheControl, contentDisposition, metadata, encryption: pre-baked into the signature.
 *
 * Browser uploads:
 * - Use this for direct-to-bucket uploads from clients. Ensure your bucket CORS allows PUT with these headers.
 */
export interface PresignPutOptions {
  expiresIn?: number;
  contentType?: string;
  cacheControl?: string;
  contentDisposition?: string;
  metadata?: Record<string, string>;
  serverSideEncryption?: "AES256" | "aws:kms";
  sseKmsKeyId?: string;
}

/**
 * One page of object keys returned by a list operation.
 *
 * - keys: up to 1000 keys per page on S3 ListObjectsV2.
 * - nextToken: pass to the next call to continue listing.
 */
export interface ListKeysPage {
  keys: string[];
  nextToken?: string;
}

/**
 * A minimal, runtime-agnostic storage contract that mirrors common S3 operations.
 *
 * Implementations:
 * - S3Service (Node runtime using @aws-sdk/client-s3).
 * - Future edge variants can implement the same contract with fetch-based signing.
 *
 * Error semantics:
 * - Not found conditions should resolve to `exists=false` or throw a clear "file <key> not found" error.
 * - Retryable conditions should be handled inside the implementation, not by callers.
 *
 * Keys:
 * - Pass keys without leading slash. Use UTF-8 safe segments. getPublicUrl will URL-encode as needed.
 */
export abstract class BaseStorageService {
  /**
   * Delete a single object by key.
   * @returns the deleted key for convenience.
   *
   * Idempotency: deleting a non-existent key should be treated as success by most providers.
   */
  public abstract deleteAnyFile(params: { key: string }): Promise<string>;

  /**
   * Fetch an entire object into memory as a Buffer.
   *
   * Use cases:
   * - Small to medium objects where buffering is acceptable.
   * - For streaming large responses, add a streaming variant in your app layer.
   *
   * Throws if the object does not exist.
   */
  public abstract fetchAnyFile(params: { key: string }): Promise<Buffer>;

  /**
   * Upload a full object from a Buffer.
   *
   * For objects larger than your API timeout, prefer the multipart flow:
   * createMultipartUpload -> presigned part URLs -> completeMultipartUpload.
   * @returns the written key.
   */
  public abstract uploadAnyFile(params: {
    key: string;
    body: Buffer;
    options?: PutOptions;
  }): Promise<string>;

  /**
   * Read object metadata without downloading the body.
   *
   * Returns contentLength, contentType, ETag, lastModified, and user metadata if present.
   * Requires read permissions on the object.
   */
  public abstract head(params: { key: string }): Promise<{
    contentLength: number;
    contentType: string | undefined;
    etag: string | undefined;
    lastModified: Date | undefined;
    metadata: Record<string, string> | undefined;
  }>;

  /**
   * Check if an object exists.
   *
   * Implementation typically wraps head() and maps 404/NoSuchKey to false.
   */
  public abstract exists(params: { key: string }): Promise<boolean>;

  /**
   * List a single page of keys for a prefix.
   *
   * - maxKeys: hint for page size. On S3, max 1000.
   * - token: pass the NextContinuationToken from the previous page.
   */
  public abstract listKeysPage(params: {
    prefix: string;
    maxKeys?: number;
    token?: string;
  }): Promise<ListKeysPage>;

  /**
   * List all keys for a prefix by paging under the hood.
   * Returns a materialized array; for very large listings prefer listKeysPage.
   */
  public abstract listAllKeys(params: { prefix: string }): Promise<string[]>;

  /**
   * Server-side copy within the same bucket or between buckets if permitted.
   * Metadata and ACL behavior depend on provider defaults unless specified by the implementation.
   * @returns targetKey
   */
  public abstract copyObject(params: {
    sourceKey: string;
    targetKey: string;
  }): Promise<string>;

  /**
   * Move implemented as copy + delete source.
   * Atomicity is not guaranteed; callers should handle partial failure.
   * @returns targetKey
   */
  public abstract moveObject(params: {
    sourceKey: string;
    targetKey: string;
  }): Promise<string>;

  /**
   * Bulk delete all objects under a prefix.
   * @returns number of deleted objects.
   *
   * On S3, this typically pages with ListObjectsV2 and uses batch DeleteObjects.
   */
  public abstract deletePrefix(params: { prefix: string }): Promise<number>;

  /**
   * Create a time-limited GET URL for downloading an object without changing bucket policy.
   *
   * Security:
   * - Anyone with the URL can GET until expiry or credential rotation.
   * - Avoid embedding in logs or HTML where it can leak.
   */
  public abstract getPresignedGetUrl(params: {
    key: string;
    options?: PresignGetOptions;
  }): Promise<string>;

  /**
   * Create a time-limited PUT URL for direct uploads.
   *
   * Client uploads:
   * - Ensure bucket CORS allows PUT with the headers you signed.
   * - Validate the key on your server before issuing presigns.
   */
  public abstract getPresignedPutUrl(params: {
    key: string;
    options?: PresignPutOptions;
  }): Promise<string>;

  /**
   * Build a public URL for an object.
   *
   * If your bucket is private, use presign instead. If you front with a CDN, set a bucketUrl so this returns CDN URLs.
   */
  public abstract getPublicUrl(params: { key: string }): string;

  /**
   * Start a multipart upload. Returns an uploadId to identify the session.
   *
   * Multipart is ideal for large files and unstable networks. Parts can be retried independently.
   */
  public abstract createMultipartUpload(params: {
    key: string;
    options?: PutOptions;
  }): Promise<{ uploadId: string }>;

  /**
   * Create a presigned URL for uploading a single part in a multipart session.
   *
   * - partNumber: 1-based index.
   * - expiresIn: seconds to live. Keep short for security.
   */
  public abstract getPresignedUploadPartUrl(params: {
    key: string;
    uploadId: string;
    partNumber: number;
    expiresIn?: number;
  }): Promise<string>;

  /**
   * Finalize a multipart upload by providing the list of parts and their ETags.
   *
   * Ordering:
   * - Parts are concatenated in ascending PartNumber by the provider.
   * @returns the object key on success.
   */
  public abstract completeMultipartUpload(params: {
    key: string;
    uploadId: string;
    parts: { etag: string; partNumber: number }[];
  }): Promise<string>;

  /**
   * Abort a multipart upload to release storage consumed by uploaded parts.
   * Call this when a multipart session is canceled or fails irrecoverably.
   */
  public abstract abortMultipartUpload(params: {
    key: string;
    uploadId: string;
  }): Promise<void>;
}
