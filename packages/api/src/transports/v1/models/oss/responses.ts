import { z } from "zod";
import { c } from "~/ts-rest/root";
import { createSchemaResponses, httpErrorSchema } from "ts-rest-kit/core";
import { internalErrorSchemaResponse } from "../shared/responses";
import type { InferResponses } from "ts-rest-kit/core";

// ========== Schemas ==========

const upstreamErrorSchemaResponses = createSchemaResponses({
  424: httpErrorSchema
    .upstream()
    .describe("Upstream failed to serve content (e.g. GitHub raw URL error)"),
  ...internalErrorSchemaResponse,
});

export const ossGetTextSchemaResponses = createSchemaResponses({
  200: c.otherResponse({
    contentType: "text/plain",
    body: z.string().min(1).describe("Raw text body returned by upstream"),
  }),
  ...upstreamErrorSchemaResponses,
});

export const ossGetGpgSchemaResponses = createSchemaResponses({
  200: c.otherResponse({
    contentType: "application/pgp-keys",
    body: z
      .string()
      .min(1)
      .describe("Armored PGP public key block in text format"),
  }),
  ...upstreamErrorSchemaResponses,
});

// ========== Types ==========

export type OssGetTextResponses = InferResponses<
  typeof ossGetTextSchemaResponses
>;

export type OssGetGpgResponses = InferResponses<
  typeof ossGetGpgSchemaResponses
>;
