"use client";
import type { QueryClient } from "@tanstack/react-query";
import type { Optional } from "typyx";
import { createTRPCReact } from "@trpc/react-query";

import { makeQueryClient } from "./query-client";
import type { AppRouter } from "../../../transports/rpc/router";

let clientQueryClientSingleton: Optional<QueryClient> = null;

const isServer = typeof window === "undefined";

export function getOptimizedQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient());
}

export const rpcClient = createTRPCReact<AppRouter>();
