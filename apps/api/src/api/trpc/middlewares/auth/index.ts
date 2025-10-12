import type { UserRoleEnum } from "~/api/core/models";
import { middleware } from "~/api/trpc/root";
import { isAuthenticated } from "./authentication";
import { isAuthorized } from "./authorization";

export const authMiddleware = (input: {
  withAuthorization?: {
    requiredRole: UserRoleEnum;
  };
}) =>
  middleware(async ({ ctx, next }) => {
    const user = await isAuthenticated({ ctx });

    if (input.withAuthorization) {
      isAuthorized({
        requiredRole: input.withAuthorization.requiredRole,
        userRole: user.role,
      });
    }

    return next({
      ctx: {
        ...ctx,
        user,
      },
    });
  });
