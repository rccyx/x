"use client";

import { QueryClientProvider } from "@ts-rest/react-query/tanstack";
import { getOptimizedQueryClient } from "./query-client";
import { restClient } from "./client";

export function RestProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  return (
    <QueryClientProvider client={getOptimizedQueryClient()}>
      <restClient.ReactQueryProvider>
        {props.children}
      </restClient.ReactQueryProvider>
    </QueryClientProvider>
  );
}
