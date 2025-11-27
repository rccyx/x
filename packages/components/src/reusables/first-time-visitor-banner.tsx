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

type KeyboardNavigator = Navigator & {
  keyboard?: {
    getLayoutMap?: () => Promise<unknown>;
  };
};

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
  const [hasKeyboard, setHasKeyboard] = useState<boolean | null>(null);

  // Detect whether this looks like a real keyboard device
  useEffect(() => {
    if (typeof window === "undefined") return;

    const nav = navigator as KeyboardNavigator;

    const detectKeyboard = async (): Promise<void> => {
      try {
        if (nav.keyboard?.getLayoutMap) {
          await nav.keyboard.getLayoutMap();
          setHasKeyboard(true);
          return;
        }

        const isSmallViewport = window.innerWidth < 900;
        const isTouchDevice =
          "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          /Mobi|Android|iPad|Tablet|Touch/i.test(navigator.userAgent);

        const looksLikeMobileOrTablet = isSmallViewport || isTouchDevice;

        setHasKeyboard(!looksLikeMobileOrTablet);
      } catch {
        setHasKeyboard(false);
      }
    };

    void detectKeyboard();
  }, []);

  // On mount: read consent, rehydrate analytics, then resolve stage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasKeyboard !== true) return;

    const cookie = localStorage.getItem(LS_COOKIE);
    if (!cookie) {
      setStage("cookie");
      return;
    }

    if (cookie === "accepted") {
      analytics.opt_in_capturing();
    } else if (cookie === "rejected") {
      analytics.opt_out_capturing();
    }

    const flow = localStorage.getItem(LS_FLOW);
    const legacy = localStorage.getItem(LS_THEME_INFO);

    if (flow === "completed" || legacy === "done") {
      setStage("done");
    } else {
      setStage("kWait");
    }
  }, [analytics, hasKeyboard]);

  // Keep consent in sync across tabs
  useEffect(() => {
    if (hasKeyboard !== true) return;

    function onStorage(event: StorageEvent) {
      if (event.key !== LS_COOKIE) return;
      const value = event.newValue;
      if (value === "accepted") {
        analytics.opt_in_capturing();
      } else if (value === "rejected") {
        analytics.opt_out_capturing();
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [analytics, hasKeyboard]);

  // Keyboard flow: K, L, D
  useEffect(() => {
    if (hasKeyboard !== true) return;
    if (stage === "done" || stage === "init" || stage === "cookie") return;

    function handleKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      if (stage === "kWait" && key === "k") {
        setStage("lWait");
      } else if (stage === "lWait" && key === "l") {
        setStage("dWait");
      } else if (stage === "dWait" && key === "d") {
        setStage("final");
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [stage, hasKeyboard]);

  // Persist completion for theme flow
  useEffect(() => {
    if (hasKeyboard !== true) return;
    if (stage !== "final") return;

    const timeoutId = window.setTimeout(() => {
      localStorage.setItem(LS_FLOW, "completed");
      localStorage.setItem(LS_THEME_INFO, "done");
      setStage("closing");
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [stage, hasKeyboard]);

  // After closing, mark done
  useEffect(() => {
    if (hasKeyboard !== true) return;
    if (stage !== "closing") return;

    const timeoutId = window.setTimeout(() => setStage("done"), 320);
    return () => window.clearTimeout(timeoutId);
  }, [stage, hasKeyboard]);

  // Do not render on devices that do not look like keyboard PCs
  if (hasKeyboard !== true) return null;

  const show =
    stage === "cookie" ||
    stage === "kWait" ||
    stage === "lWait" ||
    stage === "dWait" ||
    stage === "final" ||
    stage === "closing";

  if (!show) return null;

  function handleAcceptCookies() {
    analytics.opt_in_capturing();
    localStorage.setItem(LS_COOKIE, "accepted");
    setStage("kWait");
  }

  function handleRejectCookies() {
    analytics.opt_out_capturing();
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
            I do not believe we met before. Just so you know, I would like to
            use cookies to improve your experience.
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
                Suit your eyes, press <Kbd>K</Kbd> to cycle dark themes.
              </>
            ) : stage === "lWait" ? (
              <>
                Prefer light? Press <Kbd>L</Kbd>.
              </>
            ) : stage === "dWait" ? (
              <>
                Press <Kbd>D</Kbd> to return to default.
              </>
            ) : (
              <>All set. Enjoy your reading.</>
            )}
          </div>
          <div className="mt-3 flex items-center justify-end gap-2" />
        </>
      )}
    </Banner>
  );
}
