import { c } from "../../../../adapters/ts-rest/root";
import { createSchemaResponses, httpErrorSchema } from "restyx/core";

export const okSchemaResponse = createSchemaResponses({
  200: c.noBody(),
});

export const noContentSchemaResponse = createSchemaResponses({
  204: c.noBody(),
});

export const tokenAuthMiddlewareSchemaResponse = createSchemaResponses({
  401: httpErrorSchema
    .unauthorized()
    .describe("Missing or invalid x-api-token"),
});

export const rateLimiterMiddlewareSchemaResponse = createSchemaResponses({
  429: httpErrorSchema
    .tooManyRequests()
    .describe("Exceeded the allowed window to make requests"),
});

export const internalErrorSchemaResponse = createSchemaResponses({
  500: httpErrorSchema.internal().describe("Internal failure"),
});

// ========== Types ==========
// none for these
