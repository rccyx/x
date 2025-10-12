import { UserRoleEnum } from "~/api/models";
import { authMiddleware } from "./middlewares/auth";
import { timingMiddleware } from "./middlewares/timing";
import { procedure } from "./root";
import type { RlWindow } from "limico";
import { rateLimiterMiddleware } from "./middlewares/rl";

const timedProcedure = procedure.use(timingMiddleware);

export interface RateLimitOptions {
  limiter: {
    every: RlWindow;
    hits: number;
  };
}

export function publicProcedure(opts?: RateLimitOptions) {
  let proc = timedProcedure;
  if (opts) {
    proc = proc.use(
      rateLimiterMiddleware({
        hits: opts.limiter.hits,
        every: opts.limiter.every,
      }),
    );
  }
  return proc;
}

export function authenticatedProcedure(opts?: RateLimitOptions) {
  return publicProcedure(opts).use(authMiddleware({}));
}

function authorizedProcedure({
  requiredRole,
  limiter,
}: {
  requiredRole: UserRoleEnum;
  limiter?: RateLimitOptions;
}) {
  return publicProcedure(limiter).use(
    authMiddleware({
      withAuthorization: {
        requiredRole,
      },
    }),
  );
}

export function adminProcedure(limiter?: RateLimitOptions) {
  return authorizedProcedure({
    requiredRole: UserRoleEnum.ADMIN,
    limiter,
  });
}
