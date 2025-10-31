"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import posthog from "posthog-js";
import {
  PostHogFeature,
  PostHogProvider as PostHogProviderRaw,
  usePostHog,
} from "posthog-js/react";

import { env } from "@rccyx/env";

export const PostHogProvider = (
  properties: Omit<PropsWithChildren<NonNullable<unknown>>, "client">,
) => {
  useEffect(() => {
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
      ui_host: env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      capture_pageleave: true, // Overrides the `capture_pageview` setting
      loaded: (ph) => {
        if (env.NEXT_PUBLIC_CURRENT_ENV === "development") {
          ph.debug();
        }
      },
    });
  }, []);

  return <PostHogProviderRaw client={posthog} {...properties} />;
};

export { usePostHog };
export { PostHogFeature };
