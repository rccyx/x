import { TRPCError } from "@trpc/server";

import { UserService } from "~/transports/rpc/services";
import type { UserRo } from "~/transports/rpc/models";
import type { TrpcContext } from "~/trpc/context";

export async function isAuthenticated(input: {
  ctx: TrpcContext;
}): Promise<UserRo> {
  const r = await new UserService({
    requestHeaders: input.ctx.req.headers,
  }).getUserWithSession();
  if (!r.ok) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this",
    });
  }
  return r.value;
}
