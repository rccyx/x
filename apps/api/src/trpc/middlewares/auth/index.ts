import type { UserRoleEnum } from "~/transports/rpc/models";
import { middleware } from "~/trpc/root";
import { isAuthenticated } from "./authentication";
import { isAuthorized } from "./authorization";

export const authMiddleware = (input: {
  authorize?: {
    requiredRole: UserRoleEnum;
  };
}) =>
  middleware(async ({ ctx, next }) => {
    const user = await isAuthenticated({ ctx });

    if (input.authorize) {
      isAuthorized({
        requiredRole: input.authorize.requiredRole,
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
