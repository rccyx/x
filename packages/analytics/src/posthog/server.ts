import "server-only";

import { PostHog } from "posthog-node";

import { env } from "@rccyx/env";

export const posthogNode = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
  host: env.NEXT_PUBLIC_POSTHOG_HOST,
  // Don't batch events and flush immediately
  flushAt: 1,
  captureMode: "json",
  fetchRetryCount: 2,
  flushInterval: 0,
});
