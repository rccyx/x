import { z } from "zod";
import { c } from "../../../../ts-rest/root";
import { createSchemaResponses, httpErrorSchema } from "ts-rest-kit/core";
import { internalErrorSchemaResponse } from "../shared/responses";
import type { InferResponses } from "ts-rest-kit/core";

// ========== Schemas ==========

const _githubErrorSchemaResponses = createSchemaResponses({
  424: httpErrorSchema
    .upstream()
    .describe("GitHub failed to serve content (Raw URL error)"),
  ...internalErrorSchemaResponse,
});

const _ossGetTextSchemaResponses = createSchemaResponses({
  200: c.otherResponse({
    contentType: "text/plain",
    body: z.string().min(1).describe("Raw text body returned by upstream"),
  }),
  ..._githubErrorSchemaResponses,
});

export const gpgSchemaResponses = createSchemaResponses({
  200: c.otherResponse({
    contentType: "application/pgp-keys",
    body: z
      .string()
      .min(1)
      .describe("Armored PGP public key block in text format"),
  }),
  ..._githubErrorSchemaResponses,
});

export const debionSchemaResponses = _ossGetTextSchemaResponses;

export const whisperSchemaResponses = _ossGetTextSchemaResponses;

export const bootstrapSchemaResponses = _ossGetTextSchemaResponses;

// ========== Types ==========

export type DebionResponses = InferResponses<typeof _ossGetTextSchemaResponses>;
export type WhisperResponses = InferResponses<
  typeof _ossGetTextSchemaResponses
>;
export type BootstrapResponses = InferResponses<
  typeof _ossGetTextSchemaResponses
>;

export type GpgResponses = InferResponses<typeof gpgSchemaResponses>;
