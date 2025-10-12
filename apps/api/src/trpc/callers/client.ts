import type { QueryClient } from "@tanstack/react-query";
import type { Optional } from "ts-roids";
import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "~/api/router";
import { trpcUri } from "../endpoint";
import { makeQueryClient } from "./query-client";

let clientQueryClientSingleton: Optional<QueryClient> = null;

const isServer = typeof window === "undefined";
const isBrowser = !isServer;

export function getOptimizedQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient());
}

export function getTrpcUrl({ siteBaseUrl }: { siteBaseUrl: string }) {
  return isBrowser ? trpcUri : `${siteBaseUrl}${trpcUri}`;
}

export const trpcClientSide = createTRPCReact<AppRouter>();
