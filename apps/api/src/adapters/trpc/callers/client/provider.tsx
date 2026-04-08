"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";

import { getOptimizedQueryClient, rpc } from "./client";
import { transformer } from "../../transformer";
import { getTrpcUrl } from "../trpc-url";

export function RPCProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  // we grab the query client (the cache).
  // no usestate here because if the app hits a loading state (suspense),
  // react might throw away the client and reset your whole cache.
  const queryClientInstance = getOptimizedQueryClient();

  // we initialize the trpc messenger once and keep it in state.
  const [trpcClientInstance] = useState(() =>
    rpc.createClient({
      links: [
        // batchlink takes multiple api calls and squashes them into one
        // single request so you don't murder your network tab.
        httpBatchLink({
          url: getTrpcUrl(), // from env, re-usable
          transformer, // superjson
          fetch(url, options) {
            return fetch(url, {
              ...options,
              // sends your cookies and session info with every request
              // otherwise you'd be logged out on every api call.
              credentials: "include",
            });
          },
        }),
      ],
    }),
  );

  return (
    // wraps the app so you can use trpc hooks like useQuery everywhere.
    <rpc.Provider client={trpcClientInstance} queryClient={queryClientInstance}>
      {/* wraps the app so the cache manager actually has a place to live. */}
      <QueryClientProvider client={queryClientInstance}>
        {props.children}
      </QueryClientProvider>
    </rpc.Provider>
  );
}
