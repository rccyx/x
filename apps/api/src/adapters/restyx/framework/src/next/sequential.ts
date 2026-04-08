import type { EmptyObject } from "typyx";
import type { GlobalContext } from "../core/ctx";
import type {
  MiddlewareRequest,
  MiddlewareResponse,
  SequentialItem,
  SequentialMiddleware,
} from "../core/middleware/types";
import type { AppRoute } from "@ts-rest/core";
import { createnRouteMiddleware } from "./create";
import { middlewareFn } from "../core/middleware";

// shallow-merge helper for LocalCtx objects, keep LocalCtx flat for speed */
function mergeCtx<A extends object, B extends object>(a: A, b: B): A & B {
  return Object.assign({}, a, b);
}

type AnySequentialMiddlewares = SequentialItem<GlobalContext, unknown>[];

/**
 * Immutable builder. Each `.use(...)` returns a fresh builder that accumulates:
 * - a LocalCtx fragment to be merged into `req.ctx`
 * - a middleware function that can short-circuit with a Response
 *
 * Execution model:
 * - At `.route(route)` time we pre-merge LocalCtx fragments once
 * - At request time we augment `req.ctx` with that merged locals object
 * - We then call each middleware in FIFO order until one returns a Response
 */
export function middleware<
  Gtx extends GlobalContext,
  AccCtx extends object = EmptyObject,
>(initial?: AnySequentialMiddlewares) {
  // keep an immutable chain so every .use returns a fresh builder
  const chain: AnySequentialMiddlewares = initial ? initial.slice() : [];

  return {
    /** Add one middleware that contributes LocalCtx and may short-circuit with a Response. */
    use<G extends GlobalContext, C extends object>(m: SequentialItem<G, C>) {
      const nextChain: AnySequentialMiddlewares = chain.concat(
        m as unknown as SequentialItem<GlobalContext, unknown>,
      );
      // widen global context requirements as middlewares are added
      return middleware<Gtx & G, AccCtx & C>(nextChain);
    },

    // bind the accumulataed chain to a specific contract route.
    route<Route extends AppRoute>(route: Route) {
      // compute final merged LocalCtx once, then assign into req.ctx per request
      const finalCtx = chain.reduce<Record<string, unknown>>(
        (acc, item) => {
          if (typeof item === "function") return acc;
          const local = (
            item as SequentialMiddleware<GlobalContext, Record<string, unknown>>
          ).ctx;
          return mergeCtx(acc, local);
        },
        {} as Record<string, unknown>,
      );

      return createnRouteMiddleware<Route, Gtx, AccCtx>({
        route,
        // IMPORTANT: make the executor async and await each middleware result
        middlewareFn: middlewareFn<Gtx, AccCtx>(async (req, res) => {
          // augment existing ctx with our merged locals
          Object.assign(req.ctx, finalCtx);

          // run in FIFO. If any returns a Response, bubble it up immediately.
          for (const item of chain) {
            type AnyFn = (
              rq: MiddlewareRequest<Gtx, unknown>,
              rs: MiddlewareResponse,
            ) => unknown;

            const fn: AnyFn =
              typeof item === "function"
                ? (item as AnyFn)
                : (
                    item as unknown as {
                      mw: AnyFn;
                    }
                  ).mw;

            // Coerce sync or async using Promise.resolve so both work
            const out = await Promise.resolve(fn(req, res));

            if (out instanceof Response) return out;

            if (out && typeof out === "object" && "ctx" in out) {
              Object.assign(req.ctx as object, (out as { ctx: object }).ctx);
            }
          }
        }),
      });
    },
  };
}
