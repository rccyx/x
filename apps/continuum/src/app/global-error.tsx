"use client";

import type { GlobalErrorProperties } from "@rccyx/components";
import { ErrorBoundary, Footer } from "@rccyx/components";
import { DesignSystemProvider } from "@rccyx/design/provider";
import { GoBack } from "./components/pages/root";

export default function GlobalError({ ...props }: GlobalErrorProperties) {
  return (
    <DesignSystemProvider>
      <GoBack />
      <main className="flex h-screen items-start justify-center pt-20">
        <ErrorBoundary {...props} />
      </main>
      <Footer />
    </DesignSystemProvider>
  );
}
