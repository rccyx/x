// Follow this naming convention for zod schemas and types
// <entity><action>SchemaDto for zod schemas
// <entity><action>Dto for the types of the dtos

import { z } from "zod";

import { category, mdxText, summary, tags, title } from "./shared";
import { slug } from "../shared";

// ========== Schemas ==========
export const postGetSchemaDto = z.object({
  slug,
});

export const postDeleteSchemaDto = z.object({
  slug,
});

export const postEditorSchemaDto = z.object({
  title,
  summary,
  category,
  tags,
  mdxText,
  isReleased: z.boolean(),
});

export const postUpdateSchemaDto = z.object({
  slug,
  data: postEditorSchemaDto,
});

// ========== Types ==========
export type PostGetDto = z.infer<typeof postGetSchemaDto>;
export type PostEditorDto = z.infer<typeof postEditorSchemaDto>;
export type PostUpdateDto = z.infer<typeof postUpdateSchemaDto>;
export type PostDeleteDto = z.infer<typeof postDeleteSchemaDto>;
