import { z } from "zod";
import { c } from "../../../../ts-rest/root";
import { createSchemaResponses, httpErrorSchema } from "ts-rest-kit/core";
import { internalErrorSchemaResponse } from "../_shared/responses";
import type { InferResponses } from "ts-rest-kit/core";

// ========== Schemas ==========

const _githubErrorSchemaResponses = createSchemaResponses({
  424: httpErrorSchema
    .upstream()
    .describe("GitHub failed to serve content (Raw URL error)"),
  ...internalErrorSchemaResponse, // REMOVE THIS
});

const _getScriptSchemaResponses = createSchemaResponses({
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

export const debionSchemaResponses = _getScriptSchemaResponses;

export const whisperSchemaResponses = _getScriptSchemaResponses;

export const bootstrapSchemaResponses = _getScriptSchemaResponses;

// ========== Types ==========

export type DebionResponses = InferResponses<typeof _getScriptSchemaResponses>;
export type WhisperResponses = InferResponses<typeof _getScriptSchemaResponses>;
export type BootstrapResponses = InferResponses<
  typeof _getScriptSchemaResponses
>;

export type GpgResponses = InferResponses<typeof gpgSchemaResponses>;
