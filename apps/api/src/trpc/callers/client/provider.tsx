"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";

import { getOptimizedQueryClient, getTrpcUrl, trpcClientSide } from "./client";
import { transformer } from "../../transformer";

export function TRPCProvider(
  props: Readonly<{
    children: React.ReactNode;
    siteBaseUrl: string;
  }>,
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there ais no boundary
  const queryClientInstance = getOptimizedQueryClient();
  const [trpcClientInstance] = useState(() =>
    trpcClientSide.createClient({
      links: [
        httpBatchLink({
          url: getTrpcUrl({ siteBaseUrl: props.siteBaseUrl }),
          transformer,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              // CORS & cookies included
              credentials: "include",
            });
          },
        }),
      ],
    }),
  );

  return (
    <trpcClientSide.Provider
      client={trpcClientInstance}
      queryClient={queryClientInstance}
    >
      <QueryClientProvider client={queryClientInstance}>
        {props.children}
      </QueryClientProvider>
    </trpcClientSide.Provider>
  );
}
