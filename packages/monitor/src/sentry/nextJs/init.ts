// @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
import { env } from "@ashgw/env";
import { logger } from "@ashgw/logger";
import { init as SentryInit, replayIntegration } from "@sentry/nextjs";

/**
 * Initializes Sentry for Next.js. One initializer serves both server and browser.
 * Next auto-loads this via sentry.server.config.ts and sentry.client.config.ts,
 * so we avoid manual init calls in app code and prevent double initialization.
 */
export const init = ({
  runtime,
}: {
  runtime: "server" | "browser";
}): ReturnType<typeof SentryInit> => {
  const currentEnv = env.NEXT_PUBLIC_CURRENT_ENV;
  const isDevelopment = currentEnv === "development";
  const isProduction = currentEnv === "production";

  // Keep prod sampling modest to control cost; open the firehose in non-prod for debugging.
  const tracesSampleRate = isProduction ? 0.1 : 1.0;
  const profilesSampleRate = isProduction ? 0.1 : 1.0;
  // Replays: small background sample; always capture a replay when an error happens.
  const replaysSessionSampleRate = isProduction ? 0.1 : 0.2;
  const replaysOnErrorSampleRate = 1.0;

  logger.info(`sentry:init:${runtime}`);

  return SentryInit({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    // Mark events with our actual deploy environment and keep Sentry off in local dev.
    environment: currentEnv,
    debug: isDevelopment,
    enabled: currentEnv !== "development",

    // Performance & Profiling
    tracesSampleRate,
    profilesSampleRate,

    // Replays (browser only)
    replaysSessionSampleRate,
    replaysOnErrorSampleRate,

    // Quick hygiene: strip sensitive headers if they sneak in.
    beforeSend(event) {
      const headers = event.request?.headers as
        | Record<string, string>
        | undefined;
      if (headers) {
        delete headers.cookie;
        delete headers.authorization;
      }
      return event;
    },

    // Reduce noise from common benign client-side errors.
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
      /network\s?error/i,
    ],

    integrations: [
      // Only include Replay in the browser runtime
      ...(runtime === "browser"
        ? [
            replayIntegration({
              flushMaxDelay: 1000,
              maxReplayDuration: 45 * 60 * 1000,
              minReplayDuration: 7 * 1000,
              onError: (error) => {
                logger.error("Sentry replay error", error, {
                  service: "Sentry Replay",
                  runtime,
                  currentEnv,
                });
              },
            }),
          ]
        : []),
    ],
  });
};
