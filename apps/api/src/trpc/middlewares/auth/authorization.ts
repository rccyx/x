import { TRPCError } from "@trpc/server";

import type { UserRo, UserRoleEnum } from "~/api/models";

// role hierarchy: higher rank means more privilege!
// DO NOT CHANGE THE RANKING OF THE ROLES
const ROLE_RANK_DO_NOT_CHANGE_OR_YOULL_DIE: Record<UserRoleEnum, number> = {
  VISITOR: 0,
  ADMIN: 1,
} as const;

function hasSufficientRole({
  requiredRole,
  userRole,
}: {
  userRole: UserRoleEnum;
  requiredRole: UserRoleEnum;
}): boolean {
  return (
    ROLE_RANK_DO_NOT_CHANGE_OR_YOULL_DIE[userRole] >=
    ROLE_RANK_DO_NOT_CHANGE_OR_YOULL_DIE[requiredRole]
  );
}

export function isAuthorized({
  userRole,
  requiredRole,
}: {
  userRole: UserRo["role"];
  requiredRole: UserRoleEnum;
}): void {
  if (
    !hasSufficientRole({
      requiredRole,
      userRole,
    })
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You don't have permission to access this resource",
    });
  }
}
