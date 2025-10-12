import { z } from "zod";
// Enums
export enum PostCategoryEnum {
  SOFTWARE = "SOFTWARE",
  HEALTH = "HEALTH",
  PHILOSOPHY = "PHILOSOPHY",
}

// Schemas
export const mdxText = z.string().min(10).max(30000);
export const summary = z.string().min(10).max(90);
export const tags = z.array(z.string().min(1).max(15));
export const category = z.nativeEnum(PostCategoryEnum);
export const title = z.string().min(2).max(30);
