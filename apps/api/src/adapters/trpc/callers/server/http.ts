import "server-only"; // absolute shield. if someone tries to import this on the client, the build fails.
import { cache } from "react";
import { headers, cookies } from "next/headers";
import { createTRPCClient, loggerLink } from "@trpc/client";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { env } from "@rccyx/env";

// CRITICAL: We only import the TYPE.
// When this transpiles to JS, the router code is completely GONE.
import type { AppRouter } from "../../../../boundary/rpc/router";

import { transformer } from "../../transformer";
import { getTrpcUrl } from "../trpc-url";

// the slower highway (http client)
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
          // hack for cookies - manually passing them through for tRPC v11
          const h = headers();
          const out: Record<string, string> = {};
          h.forEach((v, k) => {
            out[k] = v;
          });

          const cookie = cookies().toString();
          if (cookie) out.cookie = cookie;

          // tagging the request so server traces show this came from
          // our own logic, not a random user's browser.
          out["x-trpc-source"] = "rsc-http";
          return out;
        },
      }),
    ],
  }),
);

// The lightweight export. No DB, no Core, just a network caller.
export const rpcHttp = _getHttpClient();
