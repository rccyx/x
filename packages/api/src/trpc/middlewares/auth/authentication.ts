import { TRPCError } from "@trpc/server";

import type { UserRo } from "@ashgw/core/models";
import type { TrpcContext } from "../../../trpc/context";
import { UserService } from "@ashgw/core/services";

export async function isAuthenticated(input: {
  ctx: TrpcContext;
}): Promise<UserRo> {
  const user = await new UserService({
    requestHeaders: input.ctx.req.headers,
  }).me();

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return user;
}
