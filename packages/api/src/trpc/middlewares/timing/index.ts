import { logger } from "@ashgw/logger";

import { middleware, t } from "~/trpc/root";

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * It can help catch unwanted waterfalls by simulating network latency that would
 * occur in production but not in local development.
 */

export const timingMiddleware = middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev 100-500ms
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  const result = await next();
  const end = Date.now();
  logger.debug(`[TRPC] ${path} took ${end - start}ms to execute`);
  return result;
});
