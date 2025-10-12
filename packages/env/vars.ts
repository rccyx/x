import { z } from "zod";
import { databaseUrlSchema } from "./schemas";

//  validate only if the CI validation flag is set (job in CI)
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
      .startsWith("github_pat_")
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
        "Hit my endpoints to notify me @see https://github.com/ashgw/notify/",
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
};

export const serverVars = {
  NODE_ENV: z
    .enum(["production", "development", "test"])
    .optional()
    .describe("NextJS is taking care of this basically"),
  SENTRY_ORG: z.string().min(2).max(255),
  X_API_TOKEN: z.string().length(32).max(255),
  SENTRY_PROJECT: z.string().min(2).max(255),
  SENTRY_AUTH_TOKEN: z.string().min(20).max(255),
  IP_HASH_SALT: z
    .string()
    .min(32, "IP hash salt must be at least 32 characters long")
    .describe(
      "This is used to has the IP with other fingerprinting info to see if the user is spamming my blog or nah",
    ),
  DATABASE_URL: databaseUrlSchema,
  DIRECT_URL: databaseUrlSchema,
  S3_BUCKET_NAME: z
    .string()
    .min(3, "Bucket name too short")
    .max(63, "Bucket name too long")
    .regex(/^[a-z0-9.-]+$/, "Invalid S3 bucket name"),
  S3_BUCKET_REGION: z
    .enum(["us-east-1", "us-west-1", "us-west-2", "eu-west-1"], {
      errorMap: () => ({ message: "Invalid AWS region" }),
    })
    .describe("I dont deploy anywhere else really"),
  S3_BUCKET_ACCESS_KEY_ID: z
    .string()
    .length(20, { message: "Access Key ID must be 20 chars" }),
  S3_BUCKET_SECRET_KEY: z.string().min(20, "Secret access key too short"),
  S3_BUCKET_URL: z
    .string()
    .url("Must be a valid S3 bucket URL")
    .refine(
      (url) => url.includes("amazonaws.com") || url.includes("cloudfront.net"),
      { message: "Must be a valid S3 or CloudFront URL" },
    ),
  KIT_API_KEY: z.string().min(20).startsWith("kit_").max(255),
  RESEND_API_KEY: z.string().min(20).startsWith("re_").max(255),
  PERSONAL_EMAIL: z.string().email().max(255),
  QSTASH_TOKEN: z.string().endsWith("=").min(20).max(255),
  AUTH_ENCRYPTION_KEY: z
    .string()
    .length(32, "Auth encryption key must be 32 characters long"),
};

export const clientVars = {
  CURRENT_ENV: z
    .enum(["development", "preview", "production"])
    .describe(
      "The actual environment we're running/deploying the app in/to, since NODE_ENV can be misleading since it only checks if NextJS is built or dev really, this is manually set",
    ),
  SENTRY_DSN: z.string().url(),
  WWW_URL: z.string().url(),
  API_URL: z.string().url(),
  BLOG_URL: z.string().url(),
  POSTHOG_KEY: z.string().min(20).startsWith("phc_"),
  POSTHOG_HOST: z.string().url(),
  LOGTAIL_INGESTION_TOKEN: z.string().min(20).max(255),
  // Disable Sentry tunneling by default. Optional so builds don't break.
  // When omitted, consumers should assume tunneling is disabled.
  DISABLE_SENTRY_TUNNELING: z.enum(["true", "false"]).optional(),
};
