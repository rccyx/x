import "server-only"; // Security: Prevents this logic (and its DB secrets) from ever leaking to the client bundle.
import { cache } from "react";
import { headers, cookies } from "next/headers";
import { createTRPCClient, loggerLink } from "@trpc/client";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import type { AppRouter } from "../../../../boundary/rpc/router";
import { env } from "@rccyx/env";
import type { TRPCRequestInfo } from "@trpc/server/unstable-core-do-not-import";
import type { NextRequest, NextResponse } from "next/server";
import { createHydrationHelpers } from "@trpc/react-query/rsc";

import { db } from "@rccyx/db";

import { appRouter } from "../../../../boundary/rpc/router";
import { createCallerFactory } from "../../root";
import { createTRPCContext } from "../../context";
import { makeQueryClient } from "../client/query-client";
import { transformer } from "../../transformer";
import { getTrpcUrl } from "../trpc-url";

/**
 * BARE CONTEXT:
 * This is a "mock" context. It’s useful for quick internal utilities or
 * procedures that don't require user session/auth headers.
 */
const bareCtx = createTRPCContext({
  db,
  req: {} as NextRequest,
  res: {} as NextResponse,
  trpcInfo: {} as TRPCRequestInfo,
});

/**
 * SERVER SIDE CALLER:
 * This creates a high-performance "Internal" caller.
 * Instead of making a network request to an API endpoint, it calls the
 * TypeScript functions directly: zero network latency.
 */
const serverSideCaller = createCallerFactory(appRouter)(bareCtx);

/**
 * STABLE QUERY CLIENT:
 * React `cache()` ensures that for the duration of ONE single page request,
 * we reuse the same QueryClient instance. This prevents memory leaks and
 * data inconsistency across multiple components in the same render tree.
 */
const getQueryClient = cache(makeQueryClient);

/**
 * PRIMARY RSC EXPORT:
 * -> rpcBareServer: Use this in your Server Components (Page.tsx). It uses
 * the direct caller above for maximum speed.
 * -> HydrateRpcClient: Wrap your client components in this. It takes the data
 * fetched by rpcBareServer and "injects" it into the client-side TanStack
 * cache so your UI doesn't flicker or show spinners.
 */
export const { trpc: rpcBareServer, HydrateClient: HydrateRpcClient } =
  createHydrationHelpers<AppRouter>(serverSideCaller, getQueryClient);

/**
 * HTTP CLIENT GENERATOR:
 * This is for the edge case where you actually DO want a network hop,
 * usually to ensure that headers() and cookies() are forwarded exactly
 * as they would be in a browser request.
 */
const getHttpClient = cache(() =>
  createTRPCClient<AppRouter>({
    links: [
      ...(env.NEXT_PUBLIC_CURRENT_ENV === "development" ? [loggerLink()] : []),
      httpBatchLink({
        url: getTrpcUrl(),
        transformer,
        headers() {
          const h = headers();
          const out: Record<string, string> = {};
          h.forEach((v, k) => {
            out[k] = v;
          });

          const cookie = cookies().toString();
          if (cookie) out.cookie = cookie;

          out["x-trpc-source"] = "rsc-http";
          return out;
        },
      }),
    ],
  }),
);

/**
 * HTTP RSC CLIENT:
 * Use this ONLY if your procedure relies on complex middleware that
 * explicitly checks for raw HTTP headers that bareCtx (above) doesn't provide.
 * In 95% of cases, rpcBareServer is your winner.
 */
export const rpcHttpServer = getHttpClient();
