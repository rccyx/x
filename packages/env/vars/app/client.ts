import { z } from "zod";

export const clientVars = {
  CURRENT_ENV: z
    .enum(["development", "preview", "production"])
    .describe(
      "The actual environment we're running/deploying the app in/to, since NODE_ENV can be misleading since it only checks if NextJS is built or dev really, this is manually set",
    ),
  SENTRY_DSN: z.string().url(),
  WWW_URL: z.string().url(),
  API_URL: z.string().url(),
  CONTINUUM_URL: z.string().url(),
  POSTHOG_KEY: z.string().min(20).startsWith("phc_"),
  POSTHOG_HOST: z.string().url(),
  LOGTAIL_INGESTION_TOKEN: z.string().min(20).max(255),
  // Disable Sentry tunneling by default. Optional so builds don't break.
  // When omitted, consumers should assume tunneling is disabled.
  DISABLE_SENTRY_TUNNELING: z.enum(["true", "false"]).optional(),
} as const;
