import type { z } from "zod";
import type { InferResponses } from "ts-rest-kit/core";
import { createSchemaResponses } from "ts-rest-kit/core";
import {
  tokenAuthMiddlewareSchemaResponse,
  internalErrorSchemaResponse,
  rateLimiterMiddlewareSchemaResponse,
  noContentSchemaResponse,
} from "../shared/responses";
import { tokenAuthMiddlewareHeaderSchemaRequest } from "../shared";

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
  ...internalErrorSchemaResponse, // TODO: remove this annoying ass error reposne when erryx is done
});

export const postsPurgeTrashBinSchemaResponses = createSchemaResponses({
  ...mws,
  ...postsPurgeTrashBinHandlerSchemaResponses,
});

// == Types ===

export type PostsPurgeTrashBinResponses = InferResponses<
  typeof postsPurgeTrashBinSchemaResponses
>;
