"use client";

import { QueryClientProvider } from "@ts-rest/react-query/tanstack";
import { getOptimizedQueryClient } from "./query-client";
import { tsrQueryClientSide } from "./client";

// Provides React Query context + ts-rest hook context in one place
// - QueryClientProvider: TanStack Query v5
// - tsrQueryClientSideClient.ReactQueryProvider: binds contract-aware hooks
export function TsrProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  return (
    <QueryClientProvider client={getOptimizedQueryClient()}>
      <tsrQueryClientSide.ReactQueryProvider>
        {props.children}
      </tsrQueryClientSide.ReactQueryProvider>
    </QueryClientProvider>
  );
}
