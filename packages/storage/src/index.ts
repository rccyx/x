/**
 * Public entrypoint for the storage client.
 *
 * Usage:
 *   import { storage } from "@rccyx/storage";
 *   await storage.uploadAnyFile({ key: "a/b.png", body: buf, options: { contentType: "image/png" } });
 *
 * The exported type alias lets you annotate dependencies without importing internal classes.
 */
import type { S3Client } from "./s3";
import { s3Client } from "./s3";

export const storage = s3Client;
export type StorageClient = S3Client;
