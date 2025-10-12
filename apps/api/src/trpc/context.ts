import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { NextRequest, NextResponse } from "next/server";

import { db } from "@ashgw/db";
import type { DatabaseClient } from "@ashgw/db";
import type { UserRo } from "~/api/models";

export function createTRPCContext(opts: {
  req: NextRequest;
  res: NextResponse;
  trpcInfo: FetchCreateContextFnOptions["info"];
  db: DatabaseClient;
}) {
  return {
    req: opts.req,
    res: opts.res,
    trpcInfo: opts.trpcInfo,
    db: db,
  };
}

export type TrpcContext = Awaited<ReturnType<typeof createTRPCContext>>;

export type TrpcAuthedContext = TrpcContext & { user: UserRo };
