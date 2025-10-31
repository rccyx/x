"use client";

import type { GlobalErrorProperties } from "@rccyx/components";
import { ErrorBoundary, Footer } from "@rccyx/components";
import { DesignSystemProvider } from "@rccyx/design/provider";

export default function GlobalError({ ...props }: GlobalErrorProperties) {
  return (
    <DesignSystemProvider>
      <div className="flex h-screen items-start justify-center pt-20">
        <ErrorBoundary {...props} />
      </div>
      <Footer />
    </DesignSystemProvider>
  );
}
