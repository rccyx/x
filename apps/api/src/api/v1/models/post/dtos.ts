import type { z } from "zod";
import { tokenAuthMiddlewareHeaderSchemaDto } from "../shared";

// ========== Schemas ==========

export const postViewWindowDeleteHeadersSchemaDto =
  tokenAuthMiddlewareHeaderSchemaDto.extend({});

export const postTrashDeleteHeadersSchemaDto =
  tokenAuthMiddlewareHeaderSchemaDto.extend({});

// ========== Types ==========

export type PostTrashDeleteHeadersDto = z.infer<
  typeof postTrashDeleteHeadersSchemaDto
>;

export type PostViewWindowDeleteHeadersDto = z.infer<
  typeof postViewWindowDeleteHeadersSchemaDto
>;
