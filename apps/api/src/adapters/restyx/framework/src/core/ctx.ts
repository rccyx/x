/**
 * GlobalTsrContext is the structural contract for per-request context that
 * the middleware chain and handlers rely on.
 *
 * You can extend it in your app:
 *
 *   import type { GlobalTsrContext } from "@restyx/next";
 *
 *   export interface GlobalContext extends GlobalTsrContext {
 *     ctx: {
 *       db: DatabaseClient;
 *     };
 *   }
x */
export interface GlobalContext {
  ctx: object;
}
