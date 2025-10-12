import { z } from "zod";

export const ossGetGithubTextSchemaDto = z.object({
  revalidateSeconds: z.number().int().min(60).max(86400).optional(),
  cacheControl: z.string().min(1).max(255).optional(),
  fetchUrl: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("github"),
      repo: z.string().min(1).max(255),
      scriptPath: z.string().min(1).max(255),
    }),
    z.object({
      type: z.literal("direct"),
      url: z.string().min(1).max(255),
    }),
  ]),
});

export type OssGetGithubTextSchemaDto = z.infer<
  typeof ossGetGithubTextSchemaDto
>;

export const ossGetDirectTextSchemaRo = z.object({
  text: z.string().min(1),
});

export type OssGetDirectTextSchemaRo = z.infer<typeof ossGetDirectTextSchemaRo>;
