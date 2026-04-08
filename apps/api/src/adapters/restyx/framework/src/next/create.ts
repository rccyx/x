import { tsr } from "@ts-rest/serverless/next";

import type { AppRoute } from "@ts-rest/core";
import type { GlobalContext } from "../core/ctx";
import type { MiddlewareFn } from "../core";
import type { MergeTsrContextWith } from "../core/middleware/types";

/**
 * @internal
 *
 * Binds one contract route to one composed middleware function. We call this
 *  through the sequential builder internally.
 *
 * The returned function takes a handler with the usual ts-rest signature and
 * returns a Next.js route handler that enforces your types at compile time.
 */
export function createnRouteMiddleware<
  R extends AppRoute,
  Gtx extends GlobalContext,
  LocalCtx extends object,
>({
  route,
  middlewareFn,
}: {
  route: R;
  middlewareFn: MiddlewareFn<Gtx, LocalCtx>;
}) {
  const build = tsr.routeWithMiddleware(route)<
    Gtx,
    MergeTsrContextWith<Gtx, LocalCtx>
  >;

  type BuildOpts = Parameters<typeof build>[0];

  return (handler: BuildOpts["handler"]) => {
    return build({
      handler,
      middleware: [middlewareFn],
    });
  };
}

/**
 * Re-export helpers from @ts-rest/serverless/next so apps can:
 * - create a router bound to a global context
 * - register a single global request middleware
 */
export const createRouterWithContext = tsr.routerWithMiddleware;
export const createGlobalRequestMiddleware = tsr.middleware;
