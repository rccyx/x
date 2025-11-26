import { z } from "zod";
import { c } from "../../../../adapters/restyx/root";
import { createSchemaResponses, httpErrorSchema } from "@restyx/next/core";
import type { InferResponses } from "@restyx/next/core";
import { internalErrorSchemaResponse } from "../_shared";

// ========== Schemas ==========

const _githubErrorSchemaResponses = createSchemaResponses({
  424: httpErrorSchema
    .upstream()
    .describe("GitHub failed to serve content (Raw URL error)"),
});

const _getScriptSchemaResponses = createSchemaResponses({
  200: c.otherResponse({
    contentType: "text/plain",
    body: z.string().min(1).describe("Raw text body returned by upstream"),
  }),
  ..._githubErrorSchemaResponses,
  ...internalErrorSchemaResponse,
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
  ...internalErrorSchemaResponse,
});

export const thyxSchemaResponses = _getScriptSchemaResponses;

export const whisperSchemaResponses = _getScriptSchemaResponses;

export const bootstrapSchemaResponses = _getScriptSchemaResponses;

// ========== Types ==========

export type ThyxResponses = InferResponses<typeof _getScriptSchemaResponses>;
export type WhisperResponses = InferResponses<typeof _getScriptSchemaResponses>;
export type BootstrapResponses = InferResponses<
  typeof _getScriptSchemaResponses
>;

export type GpgResponses = InferResponses<typeof gpgSchemaResponses>;
