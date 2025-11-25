import type { z } from "zod";
import type { InferResponses } from "@restyx/next/core";
import { createSchemaResponses } from "@restyx/next/core";
import {
  tokenAuthMiddlewareSchemaResponse,
  internalErrorSchemaResponse,
  rateLimiterMiddlewareSchemaResponse,
  noContentSchemaResponse,
} from "../_shared/responses";
import { tokenAuthMiddlewareHeaderSchemaRequest } from "../_shared";

// ========== Requests ====

export const postPurgeTrashBinHeadersSchemaRequest =
  tokenAuthMiddlewareHeaderSchemaRequest.extend({});

// == Types ===

export type PostPurgeTrashBinHeadersRequest = z.infer<
  typeof postPurgeTrashBinHeadersSchemaRequest
>;

// == Responses ==
const mws = createSchemaResponses({
  ...rateLimiterMiddlewareSchemaResponse,
  ...tokenAuthMiddlewareSchemaResponse,
});

const postsPurgeTrashBinHandlerSchemaResponses = createSchemaResponses({
  ...noContentSchemaResponse,
  ...internalErrorSchemaResponse,
});

export const postsPurgeTrashBinSchemaResponses = createSchemaResponses({
  ...mws,
  ...postsPurgeTrashBinHandlerSchemaResponses,
});

// == Types ===

export type PostsPurgeTrashBinHandlerResponses = InferResponses<
  typeof postsPurgeTrashBinHandlerSchemaResponses
>;
