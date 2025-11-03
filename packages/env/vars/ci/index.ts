import { z } from "zod";

const ci = <T extends z.ZodTypeAny>(schema: T) =>
  process.env.VALIDATE_CI === "true" ? schema : schema.optional();

export const ciVars = {
  // github
  GITHUB_TOKEN: ci(
    z.string().min(1).max(64).describe("GitHub token (classic)"),
  ).describe("CI runs already got it"),
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
  VERCEL_TOKEN: ci(z.string().min(1).max(64)).describe(
    "Dashboard -> Settings -> API Tokens -> Project Tokens -> Create Token",
  ),
  VERCEL_ORG_ID: ci(z.string().min(1).max(64)).describe(
    "Dashboard -> Settings -> General -> Organization ID or the method below",
  ),
  VERCEL_WWW_PROJECT_ID: ci(z.string().min(1).max(64).startsWith("prj_"))
    .describe(
      "just hit: pnpm --filter @rccyx/www build:vercel-preview, this will automatically set this inside .vercel/project.json",
    )
    .describe(
      "this will auto create VERCEL_ORG_ID  & VERCEL_PROJECT_ID, paste them in your CI env tool e.g. GitHub Actions or Doppler or etc",
    )
    .describe("the CI will take care of reset")
    .describe(
      "the only manual thing you have to do is set the root directory to apps/www on the www project on Vercel dashboard",
    ),
  VERCEL_BLOG_PROJECT_ID: ci(
    z
      .string()
      .min(1)
      .max(64)
      .startsWith("prj_")
      .describe(
        "simply run: pnpm --filter @rccyx/blog build:vercel-preview, and fetch the project id from the output",
      )
      .describe("same"),
  ),
  VERCEL_API_PROJECT_ID: ci(
    z
      .string()
      .min(1)
      .max(64)
      .startsWith("prj_")
      .describe("API as in the API app, nothing major here chief")
      .describe("simply run: pnpm --filter @rccyx/api build:vercel-preview"),
  ),
  TURBO_TOKEN: ci(z.string().min(1).max(64))
    .describe("inject these two for automatic caches")
    .describe("just run: npx turbo login, they'll guide through"),
  TURBO_TEAM: ci(z.string().min(1).max(64)),

  OPENAI_PR_SUMMARIZER_TOKEN: ci(
    z
      .string()
      .min(1)
      .max(255)
      .startsWith("sk-")
      .describe(
        "Used to summarize PRs @see https://github.com/rccyx/pr-summarizer",
      ),
  ).describe(
    "this is just for the pr-summarizer action, @see https://github.com/rccyx/pr-summarizer",
  ),
  CONTAINER_SERVICE_TOKEN: ci(
    z
      .string()
      .min(1)
      .max(64)
      .describe("Token used to auth with the container service"),
  ).describe(
    "this is the token youll use for deploying to whatever container service, e.g Koyeb or AWS ECS or etc",
  ),
} as const;
