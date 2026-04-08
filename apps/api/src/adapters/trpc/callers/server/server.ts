import "server-only"; // absolute shield. if a someone tries to import this on the client, the build fails.
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

// this is the empty/fake/stubbeds context.
// used when we don't care about the user's session or specific headers.
// we just want to talk to the database through trpc logic.
const _bareCtx = createTRPCContext({
  db,
  req: {} as NextRequest,
  res: {} as NextResponse,
  trpcInfo: {} as TRPCRequestInfo,
});

// this is the direct plug/caller, it calls your router functions directly
// without doing a network fetch (no localhost:3000/api/trpc).
// it's significantly faster than a network call.
// no cookies, nothing. Good for testing or bridging directly etc.
const _serverBridge = createCallerFactory(appRouter)(_bareCtx);

// request-scoped cache
// react's cache() ensures that for one single page load,
// we only ever create ONE query client. no memory leaks.
const _getQueryClient = cache(makeQueryClient);

// the main fast export (hydration helpers)
// rpcBare: use this inside your async Server Components.
// HydrateRpcClient: a wrapper to pass server data to the client-side cache.
export const { trpc: rpcBare, HydrateClient: HydrateRpcClient } =
  createHydrationHelpers<AppRouter>(_serverBridge, _getQueryClient);

// the "slow" highway (http client)
// sometimes you NEED to pass cookies or headers exactly as the browser would.
// this forces a network hop via httpBatchLink.
// only use this if your server-side code needs to act exactly
// like a browser (e.g., checking for specific cookies in middleware).
const _getHttpClient = cache(() =>
  createTRPCClient<AppRouter>({
    links: [
      ...(env.NEXT_PUBLIC_CURRENT_ENV === "development" ? [loggerLink()] : []),
      httpBatchLink({
        url: getTrpcUrl(),
        transformer,
        headers() {
          // this is a hack for cookies, since it's annoying in tRPC as of v11.
          // we have to manually run through every header.
          const h = headers();
          const out: Record<string, string> = {};
          h.forEach((v, k) => {
            out[k] = v;
          });

          const cookie = cookies().toString();
          if (cookie) out.cookie = cookie;

          // we tag the request as 'rsc-http' so when you're looking at network
          // logs or server traces, you can tell this call came from
          // your own server logic and not a user's browser.
          out["x-trpc-source"] = "rsc-http";
          return out;
        },
      }),
    ],
  }),
);

// no need to re-init a thousand times. Use this export
export const rpcHttp = _getHttpClient();
