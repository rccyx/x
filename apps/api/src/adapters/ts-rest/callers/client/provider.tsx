"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { restClient } from "./client";

const client = new QueryClient();

export function RestProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      <restClient.ReactQueryProvider>{children}</restClient.ReactQueryProvider>
    </QueryClientProvider>
  );
}
