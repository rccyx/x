import { z } from "zod";
// Enums
export enum PostCategoryEnum {
  SOFTWARE = "SOFTWARE",
  HEALTH = "HEALTH",
  PHILOSOPHY = "PHILOSOPHY",
}

// Schemas
export const mdxText = z.string().min(10);
export const summary = z
  .string()
  .min(10)
  .max(90)
  .describe(
    "should not exceed 90 characters, otherwise it would look ugly on the card",
  );
export const tags = z.array(z.string().min(1).max(15));
export const category = z.nativeEnum(PostCategoryEnum);
export const title = z
  .string()
  .min(2)
  .max(30)
  .describe("should fit correctly in the card");
