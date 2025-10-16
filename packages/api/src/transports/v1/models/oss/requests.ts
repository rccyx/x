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

export const gpgQuerySchemaRequest = _ossGetTextQuerySchemaRequest;
export const thyxQuerySchemaRequest = _ossGetTextQuerySchemaRequest;
export const whisperQuerySchemaRequest = _ossGetTextQuerySchemaRequest;
export const bootstrapQuerySchemaRequest = _ossGetTextQuerySchemaRequest;

export type GpgQueryRequest = z.infer<typeof gpgQuerySchemaRequest>;
export type ThyxQueryRequest = z.infer<typeof thyxQuerySchemaRequest>;
export type WhisperQueryRequest = z.infer<typeof whisperQuerySchemaRequest>;
export type BootstrapQueryRequest = z.infer<typeof bootstrapQuerySchemaRequest>;
