import { z } from "zod";

export const tokenAuthMiddlewareHeaderSchemaRequest = z
  .object({
    "x-api-token": z
      .string()
      .length(32)
      .describe("Secret API authorization token."),
  })
  .describe("Header required for any API-authenticated request");

export type TokenAuthMiddlewareHeaderRequest = z.infer<
  typeof tokenAuthMiddlewareHeaderSchemaRequest
>;
