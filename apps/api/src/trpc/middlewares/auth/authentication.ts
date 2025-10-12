import { TRPCError } from "@trpc/server";

import type { UserRo } from "~/api/models";
import type { TrpcContext } from "~/trpc/context";
import { UserService } from "~/api/services";

export async function isAuthenticated(input: {
  ctx: TrpcContext;
}): Promise<UserRo> {
  const user = await new UserService({ ctx: input.ctx }).me();

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return user;
}
