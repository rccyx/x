import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "./query-client";
import { tsrQueryClientSide } from "./client";

/**
 * Use this in `getServerSideProps`, `getStaticProps`, or any server-side
 * environment to prefetch data before rendering. Data is then dehydrated
 * and passed down to the client to avoid waterfalls.
 *
 * Example:
 * ```ts
 * // Prefetch queries on the server
 * await tsrQueryServerSideClient.posts.getAll.prefetchQuery({
 *   queryKey: ['POSTS'],
 * });
 *
 */
export const tsrQueryServerSideClient =
  tsrQueryClientSide.initQueryClient(makeQueryClient());

/**
 * A thin wrapper that hydrates React Query’s cache on the client
 * with state that was dehydrated on the server.
 *
 * Usage:
 * ```tsx
 * // In your layout or page:
 * <HydrateClient>
 *   <Posts />
 * </HydrateClient>
 * ```
 */
export function HydrateTsrClient(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  // Keep consistent with how @ts-rest/react-query expects dehydration
  const dehydratedState = dehydrate(tsrQueryServerSideClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      {props.children}
    </HydrationBoundary>
  );
}
