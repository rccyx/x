import { z } from "zod";

const _ossGetTextQuerySchemaRequest = z.object({
  revalidateSeconds: z
    .string()
    .regex(/^\d+$/)
    .transform((v) => Number(v))
    .pipe(z.number().int().min(60).max(86400))
    .optional()
    .describe("Override ISR revalidate in seconds, 60..86400"),
});

const _ossGetScriptQuerySchemaRequest = _ossGetTextQuerySchemaRequest
  .extend({
    script: z.object({
      repo: z.string().min(1).max(255),
      path: z.string().min(1).max(255),
    }),
  })
  .optional();

export const gpgQuerySchemaRequest = _ossGetTextQuerySchemaRequest;
export const debionQuerySchemaRequest = _ossGetTextQuerySchemaRequest;
export const whisperQuerySchemaRequest = _ossGetTextQuerySchemaRequest;
export const bootstrapQuerySchemaRequest = _ossGetTextQuerySchemaRequest;

export type GpgQueryRequest = z.infer<typeof gpgQuerySchemaRequest>;
export type DebionQueryRequest = z.infer<typeof debionQuerySchemaRequest>;
export type WhisperQueryRequest = z.infer<typeof whisperQuerySchemaRequest>;
export type BootstrapQueryRequest = z.infer<typeof bootstrapQuerySchemaRequest>;
