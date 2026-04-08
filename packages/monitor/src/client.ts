import { init as sentryInit, replayIntegration } from "@sentry/nextjs";
import { env } from "@rccyx/env";

export const initializeClient = () => {
  return sentryInit({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    environment: env.NEXT_PUBLIC_CURRENT_ENV,
    enabled: env.NEXT_PUBLIC_CURRENT_ENV !== "development",
    tracesSampleRate: env.NEXT_PUBLIC_CURRENT_ENV === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
};

export { captureException } from "./shared/capture";
