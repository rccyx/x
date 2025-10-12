import { z } from "zod";

export const ossGetTextQuerySchemaRequest = z
  .object({
    revalidateSeconds: z
      .string()
      .regex(/^\d+$/)
      .transform((v) => Number(v))
      .pipe(z.number().int().min(60).max(86400))
      .optional()
      .describe("Override ISR revalidate in seconds, 60..86400"),
  })
  .passthrough();

export type OssGetTextQueryRequest = z.infer<
  typeof ossGetTextQuerySchemaRequest
>;
