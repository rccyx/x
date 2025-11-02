import { createEnv, tuple } from "envyx";
import { colors } from "./colors";
import { serverVars } from "./vars";
import { ciVars } from "./vars";
import { clientVars } from "./vars";

export const env = createEnv({
  vars: {
    ...serverVars,
    ...ciVars,
    ...clientVars,
  },
  disablePrefix: [...tuple(serverVars), ...tuple(ciVars)],
  prefix: "NEXT_PUBLIC",
  runtimeEnv: {
    // server vars
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    X_API_TOKEN: process.env.X_API_TOKEN,
    IP_HASH_SALT: process.env.IP_HASH_SALT,
    KIT_API_KEY: process.env.KIT_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_BUCKET_REGION: process.env.S3_BUCKET_REGION,
    S3_BUCKET_ACCESS_KEY_ID: process.env.S3_BUCKET_ACCESS_KEY_ID,
    S3_BUCKET_SECRET_KEY: process.env.S3_BUCKET_SECRET_KEY,
    S3_BUCKET_URL: process.env.S3_BUCKET_URL,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    AUTH_ENCRYPTION_KEY: process.env.AUTH_ENCRYPTION_KEY,
    // ci vars
    VERCEL_TOKEN: process.env.VERCEL_TOKEN,
    VERCEL_ORG_ID: process.env.VERCEL_ORG_ID,
    INTERNAL_NOTIFICATION_TOKEN: process.env.INTERNAL_NOTIFICATION_TOKEN,
    TURBO_TEAM: process.env.TURBO_TEAM,
    TURBO_TOKEN: process.env.TURBO_TOKEN,
    VERCEL_WWW_PROJECT_ID: process.env.VERCEL_WWW_PROJECT_ID,
    VERCEL_BLOG_PROJECT_ID: process.env.VERCEL_BLOG_PROJECT_ID,
    VERCEL_API_PROJECT_ID: process.env.VERCEL_API_PROJECT_ID,
    OPENAI_PR_SUMMARIZER_TOKEN: process.env.OPENAI_PR_SUMMARIZER_TOKEN,
    ENV_SERVICE_TOKEN: process.env.ENV_SERVICE_TOKEN,
    SUBMODULE_SYNC_PAT: process.env.SUBMODULE_SYNC_PAT,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    CONTAINER_SERVICE_TOKEN: process.env.CONTAINER_SERVICE_TOKEN,
    // client vars
    NEXT_PUBLIC_CURRENT_ENV: process.env.NEXT_PUBLIC_CURRENT_ENV,
    NEXT_PUBLIC_WWW_URL: process.env.NEXT_PUBLIC_WWW_URL,
    NEXT_PUBLIC_BLOG_URL: process.env.NEXT_PUBLIC_BLOG_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_DISABLE_SENTRY_TUNNELING:
      process.env.NEXT_PUBLIC_DISABLE_SENTRY_TUNNELING,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_LOGTAIL_INGESTION_TOKEN:
      process.env.NEXT_PUBLIC_LOGTAIL_INGESTION_TOKEN,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
  skipValidation: typeof window !== "undefined", // don't validate on the client, we validate at build time
});

// eslint-disable-next-line no-restricted-syntax
console.log(
  `${colors.magenta("ENV")} → loaded ${colors.green(
    String(Object.keys(env).length),
  )} vars successfully.`,
);
