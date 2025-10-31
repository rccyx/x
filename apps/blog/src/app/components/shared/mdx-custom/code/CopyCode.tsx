"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "@rccyx/design/icons";
import { useCopyToClipboard } from "react-use";
import { cn } from "@rccyx/design/ui";

interface CopyButtonProps {
  code: string;
  className?: string;
  timeoutMs?: number; // how long the green check stays
  size?: number; // icon size in px
}

export function CopyButton({
  code,
  className,
  timeoutMs = 1200,
  size = 18,
}: CopyButtonProps) {
  const [, copyToClipboard] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const onClick = () => {
    copyToClipboard(code);
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), timeoutMs);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? "Copied" : "Copy code"}
      className={cn(
        "relative inline-flex items-center justify-center p-2",
        "focus:outline-none",
        className,
      )}
    >
      {/* copy icon */}
      <Copy
        size={size}
        className={cn(
          "transition-opacity duration-250 ease-out text-dim-300",
          copied && "opacity-0",
        )}
      />
      {/* green check on top */}
      <Check
        size={size}
        className={cn(
          "absolute text-green-400 transition-opacity duration-250 ease-out",
          copied ? "opacity-100" : "opacity-0",
        )}
      />
      <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
