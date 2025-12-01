"use client";

import { restClient } from "./client";

export function RestProvider({ children }: { children: React.ReactNode }) {
  return (
    <restClient.ReactQueryProvider>{children}</restClient.ReactQueryProvider>
  );
}
