"use client";

import type { Optional } from "ts-roids";
import { useEffect, useRef } from "react";
import { logger } from "@ashgw/logger";
import { rpcClient } from "@ashgw/api/rpc-client";
import { useStore } from "~/app/stores";

interface UseViewTrackerProps {
  postSlug: string;
  enabled?: boolean;
  delay: number;
}

export function useViewTracker({
  postSlug,
  enabled = true,
  delay,
}: UseViewTrackerProps) {
  const firedRef = useRef(false);
  const timeoutRef = useRef<Optional<ReturnType<typeof setTimeout>>>(null);
  const { store } = useStore();
  const trackView = rpcClient.view.trackView.useMutation({
    onMutate: () => logger.debug("trackView start", { postSlug }),
    onError: (error) =>
      logger.error("trackView error", { postSlug, error: error.message }),
    onSuccess: (data) => {
      store.view.setConfirmed(postSlug, data.total);
    },
  });

  useEffect(() => {
    if (!enabled || !postSlug || firedRef.current) return;

    timeoutRef.current = setTimeout(() => {
      if (firedRef.current) return;
      firedRef.current = true;
      trackView.mutate({ slug: postSlug });
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [postSlug, enabled, trackView, delay]);

  return {
    isTracking: trackView.isPending,
    hasError: trackView.isError,
    error: trackView.error,
  };
}
