"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";

import { getOptimizedQueryClient, rpcClient } from "./client";
import { transformer } from "../../transformer";
import { getTrpcUrl } from "../trpc-url";
import {} from "@ashgw/env";

export function RPCProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there ais no boundary
  const queryClientInstance = getOptimizedQueryClient();
  const [trpcClientInstance] = useState(() =>
    rpcClient.createClient({
      links: [
        httpBatchLink({
          url: getTrpcUrl(),
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
    <rpcClient.Provider
      client={trpcClientInstance}
      queryClient={queryClientInstance}
    >
      <QueryClientProvider client={queryClientInstance}>
        {props.children}
      </QueryClientProvider>
    </rpcClient.Provider>
  );
}
