import type { InferResponses } from "ts-rest-kit/core";
import { createSchemaResponses } from "ts-rest-kit/core";
import {
  tokenAuthMiddlewareSchemaResponse,
  internalErrorSchemaResponse,
  rateLimiterMiddlewareSchemaResponse,
  noContentSchemaResponse,
} from "../shared/responses";

export const viewWindowDeleteSchemaResponses = createSchemaResponses({
  ...rateLimiterMiddlewareSchemaResponse,
  ...tokenAuthMiddlewareSchemaResponse,
  ...noContentSchemaResponse,
  ...internalErrorSchemaResponse,
});

export type ViewWindowDeleteResponses = InferResponses<
  typeof viewWindowDeleteSchemaResponses
>;
