"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";

import {
  getOptimizedQueryClient,
  getTrpcUrl,
  trpcClientSide,
} from "./callers/client";
import { transformer } from "./transformer";

// // we need to send the CSRF token cookie with every request
// const getCsrfTokenCookie = (): string => {
//   if (isBrowser)
//     return (
//       document.cookie
//         .split("; ")
//         .find((row) => row.startsWith(COOKIE_NAMES.CSRF_TOKEN))
//         ?.split("=")[1] ?? ""
//     );
//   return "";
// };

export function TRPCProvider(
  props: Readonly<{
    children: React.ReactNode;
    siteBaseUrl: string;
  }>,
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there ais no boundary
  const queryClientInstance = getOptimizedQueryClient();
  const [trpcClientInstance] = useState(() =>
    trpcClientSide.createClient({
      links: [
        httpBatchLink({
          url: getTrpcUrl({ siteBaseUrl: props.siteBaseUrl }),
          transformer,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              // CORS & cookies included
              credentials: "include",
              headers: {
                ...options?.headers,
                // [HEADER_NAMES.CSRF_TOKEN]: getCsrfTokenCookie(),
              },
            });
          },
        }),
      ],
    }),
  );

  return (
    <trpcClientSide.Provider
      client={trpcClientInstance}
      queryClient={queryClientInstance}
    >
      <QueryClientProvider client={queryClientInstance}>
        {props.children}
      </QueryClientProvider>
    </trpcClientSide.Provider>
  );
}
