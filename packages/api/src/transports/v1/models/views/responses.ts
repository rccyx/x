import type { InferResponses } from "ts-rest-kit/core";
import { createSchemaResponses } from "ts-rest-kit/core";
import {
  tokenAuthMiddlewareSchemaResponse,
  internalErrorSchemaResponse,
  rateLimiterMiddlewareSchemaResponse,
  noContentSchemaResponse,
} from "../shared/responses";

export const viewWindowDeleteMiddlewaresSchemaResponses = createSchemaResponses(
  {
    ...rateLimiterMiddlewareSchemaResponse,
    ...tokenAuthMiddlewareSchemaResponse,
  },
);

export const viewWindowDeleteHandlerSchemaResponses = createSchemaResponses({
  ...noContentSchemaResponse,
  ...internalErrorSchemaResponse,
});

export const viewWindowDeleteContractSchemaResponses = createSchemaResponses({
  ...viewWindowDeleteMiddlewaresSchemaResponses,
  ...viewWindowDeleteHandlerSchemaResponses,
});

export type ViewWindowDeleteHandlerResponses = InferResponses<
  typeof viewWindowDeleteHandlerSchemaResponses
>;
