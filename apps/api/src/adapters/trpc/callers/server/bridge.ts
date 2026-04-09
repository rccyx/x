import "server-only"; // absolute shield.
import { cache } from "react";
import type { TRPCRequestInfo } from "@trpc/server/unstable-core-do-not-import"; // but of course
import type { NextRequest, NextResponse } from "next/server";
import { createHydrationHelpers } from "@trpc/react-query/rsc";

// WARNING: These imports are HEAVY. They pull in the database, and all the core services directly
// and your entire logic layer.
import { db } from "@rccyx/db";
import { appRouter } from "../../../../boundary/rpc/router";
import type { AppRouter } from "../../../../boundary/rpc/router";

import { createCallerFactory } from "../../root";
import { createTRPCContext } from "../../context";
import { makeQueryClient } from "../client/query-client";

// the empty/stubbed context.
// we talk directly to the database here, bypassing network logic.
const _bridgeCtx = createTRPCContext({
  db,
  req: {} as NextRequest,
  res: {} as NextResponse,
  trpcInfo: {} as TRPCRequestInfo,
});

// the direct plug/caller.
// no localhost:3000/api/trpc calls. It's fast at runtime but heavy in the bundle.
const _bridge = createCallerFactory(appRouter)(_bridgeCtx);

// ensure we only create ONE query client per page load to prevent memory leaks.
const _getQueryClient = cache(makeQueryClient);

// main bridge export.
// rpc: use inside async Server Components for direct DB access.
// HydrateRpcClient: passes that direct data to the client-side cache.
export const { trpc: rpc, HydrateClient: HydrateRpcClient } =
  createHydrationHelpers<AppRouter>(_bridge, _getQueryClient);
