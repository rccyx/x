import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

import { env } from "@rccyx/env";

export const withConfig = <NC extends NextConfig>({
  nextConfig,
}: {
  nextConfig: NC;
}): NC => {
  const nextConfigWithTranspile = {
    ...nextConfig,
    transpilePackages: ["@sentry/nextjs"],
    // Expose a rewrite for the tunnel route. The SDK determines the final ingest URL
    // from the DSN, so this destination acts like a placeholder.
    async rewrites() {
      const baseRewrites =
        typeof nextConfig.rewrites === "function"
          ? await nextConfig.rewrites()
          : nextConfig.rewrites;
      const extra = [
        {
          source: "/monitoring",
          destination: env.NEXT_PUBLIC_SENTRY_DSN,
        },
      ];
      // Merge rewrites regardless of whether user returns an array or object shape.
      if (Array.isArray(baseRewrites)) {
        return [...baseRewrites, ...extra];
      }
      return {
        beforeFiles: [...(baseRewrites?.beforeFiles ?? []), ...extra],
        afterFiles: baseRewrites?.afterFiles ?? [],
        fallback: baseRewrites?.fallback ?? [],
      };
    },
  } as NC;

  return withSentryConfig(nextConfigWithTranspile, _sentryConfig);
};

/**
 * Wraps a Next.js config with Sentry's build-time plugin.
 * This handles source maps upload, component annotations, and a tunnel route.
 */
const _sentryConfig: Parameters<typeof withSentryConfig>[1] = {
  org: env.SENTRY_ORG,
  project: env.SENTRY_PROJECT,
  authToken: env.SENTRY_AUTH_TOKEN,
  silent: env.NEXT_PUBLIC_CURRENT_ENV === "production",
  debug: env.NEXT_PUBLIC_CURRENT_ENV === "development",
  sentryUrl: "https://sentry.io/",
  telemetry: false,
  // Upload more sourcemaps for better stack traces. Costs a bit more build time.
  widenClientFileUpload: true,
  // Adds component names to Sentry replays (useful for searching in replays UI).
  reactComponentAnnotation: {
    enabled: false,
  },
  // Route client traffic through our app to dodge ad-blockers.
  // Tunneling is disabled by default; enable only when env flag is not "true".
  tunnelRoute:
    env.NEXT_PUBLIC_DISABLE_SENTRY_TUNNELING === "true"
      ? undefined
      : "/monitoring",
  // Keep client sourcemaps hidden in prod builds. Still upload to Sentry so traces are readable.
  sourcemaps: {
    disable: env.NEXT_PUBLIC_CURRENT_ENV === "development" ? true : false,
  },
  // Strip Sentry's own console logs from bundles.
  disableLogger: true,
};
