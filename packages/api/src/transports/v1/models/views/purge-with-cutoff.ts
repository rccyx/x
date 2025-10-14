import type { z } from "zod";
import type { InferResponses } from "ts-rest-kit/core";
import { createSchemaResponses } from "ts-rest-kit/core";
import {
  tokenAuthMiddlewareSchemaResponse,
  internalErrorSchemaResponse,
  rateLimiterMiddlewareSchemaResponse,
  noContentSchemaResponse,
} from "../_shared/responses";

import { tokenAuthMiddlewareHeaderSchemaRequest } from "../_shared";

/* ------------------------- Request Schemas ------------------------- */

export const viewsPurgeWithCutoffHeadersSchemaRequest =
  tokenAuthMiddlewareHeaderSchemaRequest.extend({});

export type ViewsPurgeWithCutoffHeadersRequest = z.infer<
  typeof viewsPurgeWithCutoffHeadersSchemaRequest
>;

/* ------------------------- Response Schemas ------------------------- */

const mw = createSchemaResponses({
  ...rateLimiterMiddlewareSchemaResponse,
  ...tokenAuthMiddlewareSchemaResponse,
});

const __viewPurgeWithCutoffHandlerSchemaResponses = createSchemaResponses({
  ...noContentSchemaResponse,
  ...internalErrorSchemaResponse,
});

export const viewsPurgeWithCutoffSchemaResponses = createSchemaResponses({
  ...mw,
  ...__viewPurgeWithCutoffHandlerSchemaResponses,
});

// the handler type is always exported while it's schema isnt
export type ViewsPurgeWithCutoffHandlerResponses = InferResponses<
  typeof __viewPurgeWithCutoffHandlerSchemaResponses
>;
