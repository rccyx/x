import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "../client/query-client";
import { restClient } from "../client/client";

/**
 * Server‐side React Query client for prefetching data.
 *
 * Use this in `getServerSideProps`, `getStaticProps`, or any server‐side
 * context to prefetch queries before rendering. The fetched data is
 * dehydrated and sent to the client to avoid loading waterfalls.
 *
 * Example:
 * ```ts
 * // Prefetch queries on the server
 * await restServer.posts.getAll.prefetchQuery({
 *   queryKey: ['posts'],
 * });
 *
 * return {
 *   props: {
 *     dehydratedState: dehydrate(restServer),
 *   },
 * };
 * ```
 */
export const restServer = restClient.initQueryClient(makeQueryClient());

/**
 * Hydrates the React Query cache on the client with the state that was
 * dehydrated on the server.
 *
 * Wrap your application or page component with this provider to restore
 * server‐side fetched data on the client.
 *
 * Usage:
 * ```tsx
 * // In your _app.tsx or top-level component:
 * <HydrateRestClient>
 *   <App />
 * </HydrateRestClient>
 * ```
 */
export function HydrateRestClient({ children }: { children: React.ReactNode }) {
  // Dehydrate the server cache to pass into the client
  const dehydratedState = dehydrate(restServer);

  return (
    <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
  );
}
