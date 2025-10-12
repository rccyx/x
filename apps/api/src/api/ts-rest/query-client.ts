import type { Optional } from "ts-roids";
import { defaultShouldDehydrateQuery } from "@tanstack/react-query";
import superjson from "superjson";
import { QueryClient } from "@ts-rest/react-query/tanstack"; // PREFER @ts-rest for compatabilty

// Create a v5 QueryClient with SSR-friendly (de)hydration using superjson
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        shouldRedactErrors: () => {
          return false;
        },
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}

let clientQueryClientSingleton: Optional<QueryClient> = null;

// keep a stable client on the client; always fresh on the server
const isServer = typeof window === "undefined";

export function getOptimizedQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient());
}
