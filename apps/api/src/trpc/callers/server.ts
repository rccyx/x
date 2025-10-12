import "server-only"; // ensures this file can only be imported in a server context (next.js feature)
import { cache } from "react";
import { headers, cookies } from "next/headers";
import { createTRPCClient, loggerLink } from "@trpc/client";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import type { AppRouter } from "~/api/router";
import { env } from "@ashgw/env";
import type { TRPCRequestInfo } from "@trpc/server/unstable-core-do-not-import";
import type { NextRequest, NextResponse } from "next/server";
import { createHydrationHelpers } from "@trpc/react-query/rsc";

import { db } from "@ashgw/db";

import { appRouter } from "~/api/router";
import { createCallerFactory } from "~/trpc/root";
import { createTRPCContext } from "~/trpc/context";
import { makeQueryClient } from "~/trpc/callers/query-client";
import { getTrpcUrl } from "./client";
import { transformer } from "../transformer";

/**
 * create a "naked" trpc context for direct server-side calls.
 * - used for testing or internal utils
 * - not tied to a real req/res cycle (mocked)
 */
const nakedCtx = createTRPCContext({
  db,
  req: {} as NextRequest,
  res: {} as NextResponse,
  trpcInfo: {} as TRPCRequestInfo,
});

/**
 * build a "server-side caller" to invoke trpc procs directly (no http roundtrip).
 * good for tests & playgrounds. no headers/cookies. naked ctx.
 * don’t use this in rsc — use `trpcHttpServerSideClient` instead.
 */
const serverSideCaller = createCallerFactory(appRouter)(nakedCtx);

/**
 * create a query client that stays stable for a single rsc request.
 * React `cache` makes sure we don’t recreate it on each render.
 */
const getQueryClient = cache(makeQueryClient);

/**
 * rsc hydration helpers:
 * - `trpcRpcServerSideClient`: direct caller client (no http)
 * - `HydrateClient`: react component that hydrates dehydrated queries into client cache
 */
export const { trpc: trpcRpcServerSideClient, HydrateClient } =
  createHydrationHelpers<AppRouter>(serverSideCaller, getQueryClient);

const getTrpcBaseUrl = (): string => {
  if (env.NEXT_PUBLIC_CURRENT_ENV === "development") {
    return env.NODE_ENV === "development"
      ? "http://localhost:3001"
      : "http://localhost:3000";
  } else {
    return env.NEXT_PUBLIC_BLOG_URL;
  }
};

/**
 * http-based trpc client for rsc.
 * in rsc we can’t call procs directly, nakedCtx not available.
 * so we go through http using `httpBatchLink`, forwarding cookies/headers for auth/session.
 * `cache()` ensures stable instance per rsc request.
 */
const getHttpClient = cache(() =>
  createTRPCClient<AppRouter>({
    links: [
      // add logger in dev
      ...(env.NEXT_PUBLIC_CURRENT_ENV === "development" ? [loggerLink()] : []),
      httpBatchLink({
        url: getTrpcUrl({ siteBaseUrl: getTrpcBaseUrl() }),
        transformer,
        headers() {
          // forward incoming headers
          const h = headers();
          const out: Record<string, string> = {};
          h.forEach((v, k) => {
            out[k] = v;
          });

          // forward cookies for auth/session
          const cookie = cookies().toString();
          if (cookie) out.cookie = cookie;

          // mark this as rsc-http
          out["x-trpc-source"] = "rsc-http";
          return out;
        },
      }),
    ],
  }),
);

/**
 * main trpc client for rsc.
 * use this when you need headers/cookies (auth, csrf, etc),
 * and want to bridge to the http api instead of direct calls.
 */
export const trpcHttpServerSideClient = getHttpClient();
