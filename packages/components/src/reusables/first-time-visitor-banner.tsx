"use client";

import { useEffect, useState } from "react";
import { Banner, cn, Button } from "@rccyx/design/ui";
import { useAnalytics } from "@rccyx/analytics/client";

type Stage =
  | "init"
  | "cookie"
  | "kWait"
  | "lWait"
  | "dWait"
  | "final"
  | "closing"
  | "done";

interface Props {
  className?: string;
}

const LS_FLOW = "onboard:theme-flow";
const LS_THEME_INFO = "onboard:theme-info";
const LS_COOKIE = "onboard:cookie-consent";

function Kbd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "relative -top-0.5 inline-flex items-center justify-center rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-xs font-medium shadow-sm",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export function FirstTimeVisitorBanner({ className }: Props) {
  const analytics = useAnalytics();
  const [stage, setStage] = useState<Stage>("init");

  // On mount: read consent, rehydrate PostHog, then resolve stage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const cookie = localStorage.getItem(LS_COOKIE);
    if (!cookie) {
      setStage("cookie");
      return;
    }

    // Rehydrate analytics consent for returning visitors
    if (cookie === "accepted") analytics.opt_in_capturing();
    else if (cookie === "rejected") {
      // fully opt out if they had previously rejected
      analytics.opt_out_capturing();
      // optional: if you ever identified this user, also clear IDs
      // analytics.reset?.(true);
    }

    const flow = localStorage.getItem(LS_FLOW);
    const legacy = localStorage.getItem(LS_THEME_INFO);
    if (flow === "completed" || legacy === "done") {
      setStage("done");
    } else {
      setStage("kWait");
    }
  }, [analytics]);

  // Keep consent in sync across tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== LS_COOKIE) return;
      const v = e.newValue;
      if (v === "accepted") analytics.opt_in_capturing();
      else if (v === "rejected") analytics.opt_out_capturing();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [analytics]);

  // Key handling for theme flow
  useEffect(() => {
    if (stage === "done" || stage === "init" || stage === "cookie") return;

    function handleKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (stage === "kWait" && key === "k") setStage("lWait");
      else if (stage === "lWait" && key === "l") setStage("dWait");
      else if (stage === "dWait" && key === "d") setStage("final");
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [stage]);

  // Persist completion for theme flow
  useEffect(() => {
    if (stage !== "final") return;
    localStorage.setItem(LS_FLOW, "completed");
    localStorage.setItem(LS_THEME_INFO, "done");
    const t = setTimeout(() => setStage("closing"), 3000);
    return () => clearTimeout(t);
  }, [stage]);

  // After closing, mark done
  useEffect(() => {
    if (stage !== "closing") return;
    const t = setTimeout(() => setStage("done"), 320);
    return () => clearTimeout(t);
  }, [stage]);

  const show =
    stage === "cookie" ||
    stage === "kWait" ||
    stage === "lWait" ||
    stage === "dWait" ||
    stage === "final" ||
    stage === "closing";
  if (!show) return null;

  // Cookie consent handlers
  function handleAcceptCookies() {
    analytics.opt_in_capturing();
    localStorage.setItem(LS_COOKIE, "accepted");
    setStage("kWait");
  }

  function handleRejectCookies() {
    analytics.opt_out_capturing();
    // optional: if you identify users elsewhere, consider clearing IDs too
    // analytics.reset?.(true);
    localStorage.setItem(LS_COOKIE, "rejected");
    setStage("kWait");
  }

  return (
    <Banner
      open={stage !== "closing"}
      position="bottom-right"
      instanceKey={stage}
      className={className}
      durationMs={320}
      role="dialog"
      ariaLabel={stage === "cookie" ? "Cookie consent" : "Theme onboarding"}
    >
      {stage === "cookie" ? (
        <>
          <div className="text-semibold text-dim-400">
            New here? I use cookies to improve your experience.
          </div>
          <div className="-mt-3 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={handleRejectCookies}>
              Reject
            </Button>
            <Button variant="default" onClick={handleAcceptCookies}>
              Accept
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="text-semibold text-dim-400">
            {stage === "kWait" ? (
              <>
                Press <Kbd>K</Kbd> to cycle through dark themes.
              </>
            ) : stage === "lWait" ? (
              <>
                Prefer light? Press <Kbd>L</Kbd> to switch.
              </>
            ) : stage === "dWait" ? (
              <>
                Press <Kbd>D</Kbd> to return to dark.
              </>
            ) : (
              <>All set. Enjoy!</>
            )}
          </div>
          <div className="mt-3 flex items-center justify-end gap-2" />
        </>
      )}
    </Banner>
  );
}
