import { z } from "zod";

const ci = <T extends z.ZodTypeAny>(schema: T) =>
  process.env.VALIDATE_CI === "true" ? schema : schema.optional();

export const ciVars = {
  // github
  GITHUB_TOKEN: ci(
    z.string().min(1).max(64).describe("GitHub token (classic)"),
  ),
  SUBMODULE_SYNC_PAT: ci(
    z
      .string()
      .min(1)
      .max(128)
      .refine((val) => val.startsWith("github_pat") || val.startsWith("ghp"), {
        message: 'GitHub PAT must start with "github_pat_" or "ghp"',
      })
      .describe("GitHub PAT SOLELY for submodule sync")
      .describe(
        "GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)",
      )
      .describe("Choose contents readonly"),
  ),
  ENV_SERVICE_TOKEN: ci(
    z
      .string()
      .min(1)
      .max(64)
      .describe(
        "Token used to auth with the env service, in this case doppler, doppler is used for app vars, while GH actions are used for CI",
      )
      .describe(
        "Depending on the environment (development, production, etc), thou shall not fuckup with this one",
      ),
  ),
  INTERNAL_NOTIFICATION_TOKEN: ci(
    z
      .string()
      .min(1)
      .max(64)
      .describe(
        "Hit my endpoints to notify me @see https://github.com/rccyx/notify/",
      ),
  ),
  // doppler
  VERCEL_TOKEN: ci(z.string().min(1).max(64)),
  VERCEL_ORG_ID: ci(z.string().min(1).max(64)),
  TURBO_TOKEN: ci(z.string().min(1).max(64)).describe(
    "inject these two for automatic caches",
  ),
  TURBO_TEAM: ci(z.string().min(1).max(64)),
  VERCEL_WWW_PROJECT_ID: ci(z.string().min(1).max(64).startsWith("prj_")),
  VERCEL_BLOG_PROJECT_ID: ci(z.string().min(1).max(64).startsWith("prj_")),
  OPENAI_PR_SUMMARIZER_TOKEN: ci(
    z
      .string()
      .min(1)
      .max(255)
      .startsWith("sk-")
      .describe(
        "Used to summarize PRs @see https://github.com/ashgw/pr-summarizer",
      ),
  ),
  CONTAINER_SERVICE_TOKEN: ci(
    z
      .string()
      .min(1)
      .max(64)
      .describe("Token used to auth with the container service"),
  ),
} as const;
