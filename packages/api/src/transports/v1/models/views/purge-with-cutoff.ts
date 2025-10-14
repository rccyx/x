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

export const viewPurgeWithCutoffHandlerSchemaResponses = createSchemaResponses({
  ...noContentSchemaResponse,
  ...internalErrorSchemaResponse,
});

export const viewPurgeWithCutoffContractSchemaResponses = createSchemaResponses(
  {
    ...mw,
    ...viewPurgeWithCutoffHandlerSchemaResponses,
  },
);

export type ViewPurgeWithCutoffHandlerResponses = InferResponses<
  typeof viewPurgeWithCutoffHandlerSchemaResponses
>;
