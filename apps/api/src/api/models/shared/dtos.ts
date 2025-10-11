import { z } from "zod";

export const tokenAuthMiddlewareHeaderSchemaDto = z
  .object({
    "x-api-token": z
      .string()
      .length(32)
      .describe("Secret API authorization token."),
  })
  .describe("Header required for any API-authenticated request");

export type TokenAuthMiddlewareHeaderDto = z.infer<
  typeof tokenAuthMiddlewareHeaderSchemaDto
>;
