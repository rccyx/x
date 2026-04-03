"use client";

import type { GlobalErrorProperties } from "@rccyx/components";
import { ErrorBoundary } from "@rccyx/components";

export default function GlobalError({ error, reset }: GlobalErrorProperties) {
  return (
    <div className="-pt-20 flex h-screen items-start justify-center">
      <ErrorBoundary error={error} reset={reset} />
    </div>
  );
}
