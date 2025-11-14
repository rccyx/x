import { z } from "zod";

import type { TrpcContext } from "../../../../adapters/trpc/context";
import {
  authenticatedProcedure,
  publicProcedure,
} from "../../../../adapters/trpc/procedures";
import { router } from "../../../../adapters/trpc/root";
import {
  sessionSchemaRo,
  userChangePasswordSchemaDto,
  userLoginSchemaDto,
  userTerminateSpecificSessionSchemaDto,
  userSchemaRo,
  twoFactorEnableSchemaDto,
  twoFactorGetTotpUriSchemaDto,
  twoFactorVerifyTotpSchemaDto,
  twoFactorDisableSchemaDto,
  twoFactorGenerateBackupCodesSchemaDto,
  twoFactorVerifyBackupCodeSchemaDto,
  twoFactorEnableSchemaRo,
  twoFactorGetTotpUriSchemaRo,
  twoFactorGenerateBackupCodesSchemaRo,
} from "../../models";
import { UserService } from "../../services";

const userService = (ctx: TrpcContext) =>
  new UserService({
    requestHeaders: ctx.req.headers,
  });

export const userRouter = router({
  me: publicProcedure()
    .input(z.void())
    .output(userSchemaRo.nullable())
    .query(async ({ ctx }) => {
      const r = await userService(ctx).getUserWithSession();
      return r.ok ? r.value : null;
    }),

  login: publicProcedure({
    limiter: {
      every: "1m",
      hits: 2,
    },
  })
    .input(userLoginSchemaDto)
    .output(z.void())
    .mutation(async ({ input, ctx }) =>
      userService(ctx)
        .login(input)
        .then((r) => r.unwrap()),
    ),

  logout: publicProcedure({
    limiter: {
      every: "1m",
      hits: 10,
    },
  })
    .input(z.void())
    .output(z.void())
    .mutation(async ({ ctx }) =>
      userService(ctx)
        .logout()
        .then((r) => r.unwrap()),
    ),

  changePassword: authenticatedProcedure({
    limiter: {
      every: "2h",
      hits: 1,
    },
  })
    .input(userChangePasswordSchemaDto)
    .output(z.void())
    .mutation(async ({ ctx, input }) =>
      userService(ctx)
        .changePassword({ ...input })
        .then((r) => r.unwrap()),
    ),

  listAllSessions: authenticatedProcedure({
    limiter: {
      every: "1m",
      hits: 5,
    },
  })
    .input(z.void())
    .output(z.array(sessionSchemaRo))
    .query(async ({ ctx }) =>
      userService(ctx)
        .listSessions()
        .then((r) => r.unwrap()),
    ),

  terminateAllActiveSessions: authenticatedProcedure({
    limiter: {
      every: "1m",
      hits: 5,
    },
  })
    .input(z.void())
    .output(z.void())
    .mutation(async ({ ctx }) =>
      userService(ctx)
        .terminateAllActiveSessions()
        .then((r) => r.unwrap()),
    ),

  terminateSpecificSession: authenticatedProcedure({
    limiter: {
      every: "1m",
      hits: 4,
    },
  })
    .input(userTerminateSpecificSessionSchemaDto)
    .output(z.void())
    .mutation(async ({ ctx, input: { sessionId } }) =>
      userService(ctx)
        .terminateSpecificSession({ sessionId })
        .then((r) => r.unwrap()),
    ),

  enableTwoFactor: authenticatedProcedure({
    limiter: {
      every: "1m",
      hits: 2,
    },
  })
    .input(twoFactorEnableSchemaDto)
    .output(twoFactorEnableSchemaRo)
    .mutation(async ({ ctx, input }) =>
      userService(ctx)
        .enableTwoFactor(input)
        .then((r) => r.unwrap()),
    ),

  getTwoFactorTotpUri: authenticatedProcedure({
    limiter: {
      every: "1m",
      hits: 10,
    },
  })
    .input(twoFactorGetTotpUriSchemaDto)
    .output(twoFactorGetTotpUriSchemaRo)
    .query(async ({ ctx, input }) =>
      userService(ctx)
        .getTwoFactorTotpUri(input)
        .then((r) => r.unwrap()),
    ),

  verifyTwoFactorTotp: publicProcedure({
    limiter: {
      every: "1m",
      hits: 10,
    },
  })
    .input(twoFactorVerifyTotpSchemaDto)
    .output(z.void())
    .mutation(async ({ ctx, input }) =>
      userService(ctx)
        .verifyTwoFactorTotp(input)
        .then((r) => r.unwrap()),
    ),

  disableTwoFactor: authenticatedProcedure({
    limiter: {
      every: "1m",
      hits: 10,
    },
  })
    .input(twoFactorDisableSchemaDto)
    .output(z.void())
    .mutation(async ({ ctx, input }) =>
      userService(ctx)
        .disableTwoFactor(input)
        .then((r) => r.unwrap()),
    ),

  generateTwoFactorBackupCodes: authenticatedProcedure({
    limiter: {
      every: "1m",
      hits: 10,
    },
  })
    .input(twoFactorGenerateBackupCodesSchemaDto)
    .output(twoFactorGenerateBackupCodesSchemaRo)
    .mutation(async ({ ctx, input }) =>
      userService(ctx)
        .generateTwoFactorBackupCodes(input)
        .then((r) => r.unwrap()),
    ),

  verifyTwoFactorBackupCode: publicProcedure({
    limiter: {
      every: "1m",
      hits: 10,
    },
  })
    .input(twoFactorVerifyBackupCodeSchemaDto)
    .output(z.void())
    .mutation(async ({ ctx, input }) =>
      userService(ctx)
        .verifyTwoFactorBackupCode(input)
        .then((r) => r.unwrap()),
    ),
});
