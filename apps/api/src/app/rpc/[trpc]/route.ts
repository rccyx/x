import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { db } from "@ashgw/db";
import { monitor } from "@ashgw/monitor";
import { logger } from "@ashgw/logger";

import { appRouter } from "~/api/router";
import { createTRPCContext } from "~/trpc/context";
import { trpcUri } from "~/trpc/endpoint";

export const runtime = "nodejs";

const handler = async (req: NextRequest) => {
  const res = new NextResponse();

  const response = await fetchRequestHandler({
    endpoint: trpcUri,
    req,
    router: appRouter,
    createContext: ({ info: trpcInfo }) =>
      createTRPCContext({
        res,
        req,
        trpcInfo,
        db,
      }),
    onError({ error, path }) {
      monitor.next.captureException({
        error,
        hint: {
          extra: {
            path,
          },
        },
      });
      logger.error(`>>> tRPC Error on '${path}'`, error);
    },
  });

  // walk around since tRPC doesn't support cookies in the response
  // Copy any cookies set during the request handling to the final response
  const finalResponse = NextResponse.json(await response.json());

  // Copy headers from the original response
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      finalResponse.headers.append(key, value);
    }
  });

  // Also copy cookies that might have been set on our context response
  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      finalResponse.headers.append(key, value);
    }
  });

  return finalResponse;
};

export { handler as GET, handler as POST };
