import { z } from "zod";

export const ossGetTextQuerySchemaRequest = z.object({
  revalidateSeconds: z
    .string()
    .regex(/^\d+$/)
    .transform((v) => Number(v))
    .pipe(z.number().int().min(60).max(86400))
    .optional()
    .describe("Override ISR revalidate in seconds, 60..86400"),
});

export const ossGetScriptQuerySchemaRequest =
  ossGetTextQuerySchemaRequest.extend({
    script: z.object({
      repo: z.string().min(1).max(255),
      path: z.string().min(1).max(255),
    }),
  });

export const ossGetGpgQuerySchemaRequest = ossGetTextQuerySchemaRequest;

export type OssGetScriptQueryRequest = z.infer<
  typeof ossGetScriptQuerySchemaRequest
>;

export type OssGetGpgQueryRequest = z.infer<typeof ossGetGpgQuerySchemaRequest>;
