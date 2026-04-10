import { PostHogProvider, usePostHog, PostHogFeature } from "./posthog/client";
import type { AnalyticsEventBus } from "./posthog/events";

export const AnalyticsProvider = PostHogProvider;
export const AnalyticsFeature = PostHogFeature;
export const analytics = usePostHog();

// TODO: add typed client here that makes sense

export const analyticsTyped = () => {
  return {
    capture: <T extends keyof AnalyticsEventBus>(
      eventName: T,
      properties: AnalyticsEventBus[T],
    ) => {
      analytics.capture(eventName, properties);
    },
    identify: (id: string, traits?: Record<string, unknown>) => {
      analytics.identify(id, traits);
    },
    // ... add more if needed
  };
};
