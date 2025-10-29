export const folders = ["mdx", "voice", "image", "other"] as const;
export type Folder = (typeof folders)[number];

export interface PutOptions {
  contentType?: string;
  cacheControl?: string;
  contentDisposition?: string;
  metadata?: Record<string, string>;
  serverSideEncryption?: "AES256" | "aws:kms";
  sseKmsKeyId?: string;
}

export interface PresignGetOptions {
  expiresIn?: number;
  responseContentType?: string;
  responseContentDisposition?: string;
}

export interface PresignPutOptions {
  expiresIn?: number;
  contentType?: string;
  cacheControl?: string;
  contentDisposition?: string;
  metadata?: Record<string, string>;
  serverSideEncryption?: "AES256" | "aws:kms";
  sseKmsKeyId?: string;
}

export interface ListKeysPage {
  keys: string[];
  nextToken?: string;
}

export abstract class BaseStorageService {
  public abstract fetchFile<F extends Folder>(params: {
    folder: F;
    filename: string;
  }): Promise<Buffer>;

  public abstract uploadFile(params: {
    folder: Folder;
    filename: string;
    body: Buffer;
    options?: PutOptions;
  }): Promise<string>;

  public abstract deleteFile<F extends Folder>(params: {
    folder: F;
    filename: string;
  }): Promise<string>;

  public abstract deleteAnyFile(params: { key: string }): Promise<string>;
  public abstract fetchAnyFile(params: { key: string }): Promise<Buffer>;
  public abstract uploadAnyFile(params: {
    key: string;
    body: Buffer;
    options?: PutOptions;
  }): Promise<string>;

  public abstract head(params: { key: string }): Promise<{
    contentLength: number;
    contentType: string | undefined;
    etag: string | undefined;
    lastModified: Date | undefined;
    metadata: Record<string, string> | undefined;
  }>;

  public abstract exists(params: { key: string }): Promise<boolean>;

  public abstract listKeysPage(params: {
    prefix: string;
    maxKeys?: number;
    token?: string;
  }): Promise<ListKeysPage>;

  public abstract listAllKeys(params: { prefix: string }): Promise<string[]>;

  public abstract copyObject(params: {
    sourceKey: string;
    targetKey: string;
  }): Promise<string>;

  public abstract moveObject(params: {
    sourceKey: string;
    targetKey: string;
  }): Promise<string>;

  public abstract deletePrefix(params: { prefix: string }): Promise<number>;

  public abstract getPresignedGetUrl(params: {
    key: string;
    options?: PresignGetOptions;
  }): Promise<string>;

  public abstract getPresignedPutUrl(params: {
    key: string;
    options?: PresignPutOptions;
  }): Promise<string>;

  public abstract getPublicUrl(params: { key: string }): string;

  public abstract createMultipartUpload(params: {
    key: string;
    options?: PutOptions;
  }): Promise<{ uploadId: string }>;

  public abstract getPresignedUploadPartUrl(params: {
    key: string;
    uploadId: string;
    partNumber: number;
    expiresIn?: number;
  }): Promise<string>;

  public abstract completeMultipartUpload(params: {
    key: string;
    uploadId: string;
    parts: { etag: string; partNumber: number }[];
  }): Promise<string>;

  public abstract abortMultipartUpload(params: {
    key: string;
    uploadId: string;
  }): Promise<void>;
}
