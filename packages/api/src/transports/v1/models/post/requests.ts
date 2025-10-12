import type { z } from "zod";
import { tokenAuthMiddlewareHeaderSchemaRequest } from "../shared";

// ========== Schemas ==========

export const postViewWindowDeleteHeadersSchemaRequest =
  tokenAuthMiddlewareHeaderSchemaRequest.extend({});

export const postTrashDeleteHeadersSchemaRequest =
  tokenAuthMiddlewareHeaderSchemaRequest.extend({});

// ========== Types ==========

export type PostTrashDeleteHeadersRequest = z.infer<
  typeof postTrashDeleteHeadersSchemaRequest
>;

export type PostViewWindowDeleteHeadersRequest = z.infer<
  typeof postViewWindowDeleteHeadersSchemaRequest
>;
