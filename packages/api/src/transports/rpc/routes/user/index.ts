import { z } from "zod";

import type { TrpcContext } from "../../../../trpc/context";
import {
  authenticatedProcedure,
  publicProcedure,
} from "../../../../trpc/procedures";
import { router } from "../../../../trpc/root";
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
      return userService(ctx)
        .getUserWithSession()
        .then((r) =>
          r.match({
            ok: (user) => user,
            err: {
              UserServiceAuthApiGetSessionFailure: (_e) => {
                return null;
              },
              UserServiceAuthApiInvalidSession: (_e) => {
                return null;
              },
            },
          }),
        );
    }),

  login: publicProcedure({
    limiter: {
      every: "1m",
      hits: 2,
    },
  })
    .input(userLoginSchemaDto)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await userService(ctx)
        .login(input)
        .then((r) => r.unwrap());
    }),

  logout: publicProcedure({
    limiter: {
      every: "1m",
      hits: 10,
    },
  })
    .input(z.void())
    .output(z.void())
    .mutation(async ({ ctx }) => {
      await userService(ctx)
        .logout()
        .then((r) => r.unwrap());
    }),

  changePassword: authenticatedProcedure({
    limiter: {
      every: "2h",
      hits: 1,
    },
  })
    .input(userChangePasswordSchemaDto)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await userService(ctx).changePassword({
        ...input,
      });
    }),

  listAllSessions: authenticatedProcedure({
    limiter: {
      every: "1m",
      hits: 5,
    },
  })
    .input(z.void())
    .output(z.array(sessionSchemaRo))
    .query(async ({ ctx }) => {
      return userService(ctx)
        .listSessions()
        .then((r) => r.unwrap());
    }),

  terminateAllActiveSessions: authenticatedProcedure({
    limiter: {
      every: "1m",
      hits: 5,
    },
  })
    .input(z.void())
    .output(z.void())
    .mutation(async ({ ctx }) => {
      await userService(ctx)
        .terminateAllActiveSessions()
        .then((r) => r.unwrap());
    }),

  terminateSpecificSession: authenticatedProcedure({
    limiter: {
      every: "1m",
      hits: 4,
    },
  })
    .input(userTerminateSpecificSessionSchemaDto)
    .output(z.void())
    .mutation(async ({ ctx, input: { sessionId } }) => {
      return userService(ctx)
        .terminateSpecificSession({
          sessionId,
        })
        .then((r) => r.unwrap());
    }),

  enableTwoFactor: authenticatedProcedure({
    limiter: {
      every: "1m",
      hits: 2,
    },
  })
    .input(twoFactorEnableSchemaDto)
    .output(twoFactorEnableSchemaRo)
    .mutation(async ({ ctx, input }) => {
      return userService(ctx)
        .enableTwoFactor(input)
        .then((r) => r.unwrap());
    }),

  getTwoFactorTotpUri: authenticatedProcedure({
    limiter: {
      every: "1m",
      hits: 10,
    },
  })
    .input(twoFactorGetTotpUriSchemaDto)
    .output(twoFactorGetTotpUriSchemaRo)
    .query(async ({ ctx, input }) => {
      return userService(ctx)
        .getTwoFactorTotpUri(input)
        .then((r) => r.unwrap());
    }),

  verifyTwoFactorTotp: publicProcedure({
    limiter: {
      every: "1m",
      hits: 10,
    },
  })
    .input(twoFactorVerifyTotpSchemaDto)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await userService(ctx)
        .verifyTwoFactorTotp(input)
        .then((r) => r.unwrap());
    }),

  disableTwoFactor: authenticatedProcedure({
    limiter: {
      every: "1m",
      hits: 10,
    },
  })
    .input(twoFactorDisableSchemaDto)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await userService(ctx)
        .disableTwoFactor(input)
        .then((r) => r.unwrap());
    }),

  generateTwoFactorBackupCodes: authenticatedProcedure({
    limiter: {
      every: "1m",
      hits: 10,
    },
  })
    .input(twoFactorGenerateBackupCodesSchemaDto)
    .output(twoFactorGenerateBackupCodesSchemaRo)
    .mutation(async ({ ctx, input }) => {
      return userService(ctx)
        .generateTwoFactorBackupCodes(input)
        .then((r) => r.unwrap());
    }),

  verifyTwoFactorBackupCode: publicProcedure({
    limiter: {
      every: "1m",
      hits: 10,
    },
  })
    .input(twoFactorVerifyBackupCodeSchemaDto)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await userService(ctx)
        .verifyTwoFactorBackupCode(input)
        .then((r) => r.unwrap());
    }),
});
