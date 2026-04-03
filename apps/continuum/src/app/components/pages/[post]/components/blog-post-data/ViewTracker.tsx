"use client";

import { memo } from "react";

import { useViewTracker } from "../../hooks/useViewTracker";

interface ViewTrackerProps {
  postSlug: string;
}

export const ViewTracker = memo(function ViewTracker({
  postSlug,
}: ViewTrackerProps) {
  useViewTracker({
    postSlug,
    enabled: true,
    delay: 2500,
  });

  return null;
});
