import type {
  SessionRo,
  TwoFactorEnableDto,
  TwoFactorEnableRo,
  TwoFactorGenerateBackupCodesRo,
  TwoFactorGetTotpUriDto,
  TwoFactorGetTotpUriRo,
  TwoFactorGenerateBackupCodesDto,
  TwoFactorVerifyBackupCodeDto,
  TwoFactorDisableDto,
  TwoFactorVerifyTotpDto,
  UserLoginDto,
  UserRegisterDto,
  UserRo,
  UserTerminateSpecificSessionDto,
  UserChangePasswordDto,
} from "../../models";
import { SessionMapper, UserMapper } from "../../mappers";
import type { Optional } from "ts-roids";
import { auth } from "@ashgw/auth";
import { err, ok, run, runner } from "@ashgw/runner";
export class UserService {
  private readonly requestHeaders: Headers;
  constructor({ requestHeaders }: { requestHeaders: Headers }) {
    this.requestHeaders = requestHeaders;
  }
  public async login({ email, password }: UserLoginDto): Promise<void> {
    await run(
      () =>
        auth.api.signInEmail({
          body: {
            email,
            password,
          },
          headers: this.requestHeaders,
        }),
      "Sign in email internal API bare hit",
      {
        message: "failed to login",
      },
    );
  }

  public async signUp({ email, password, name }: UserRegisterDto) {
    return await run(
      () =>
        auth.api.signUpEmail({
          body: {
            email,
            password,
            name,
          },
        }),
      "Sign up email API call",
      {
        message: "failed to sign up",
      },
    );
  }

  public async logout() {
    return await run(
      () => auth.api.signOut({ headers: this.requestHeaders }),
      "Sign out API call",
      {
        message: "failed to sign out",
      },
    );
  }

  public async terminateAllActiveSessions() {
    return await run(
      () =>
        auth.api.revokeSessions({
          headers: this.requestHeaders,
        }),
      "Revoke sessions API call",
      {
        message: "failed to revoke sessions",
      },
    );
  }

  public async listSessions() {
    return await runner(
      run(
        () => auth.api.listSessions({ headers: this.requestHeaders }),
        "List sessions API call",
        {
          message: "failed to list sessions",
        },
      ),
    ).transform((sessions) =>
      sessions.map((s) => SessionMapper.toRo({ session: s })),
    );
  }

  public async terminateSpecificSession({
    sessionId,
  }: UserTerminateSpecificSessionDto): Promise<void> {
    await runner(
      run(
        () => auth.api.listSessions({ headers: this.requestHeaders }),
        "List sessions API call",
        {
          message: "failed to list sessions",
        },
      ),
    ).transform((sessions) =>
      sessions.map((s) => SessionMapper.toRo({ session: s })),
    );

    await runner(
      run(
        () => auth.api.listSessions({ headers: this.requestHeaders }),
        "List sessions API call",
        {
          message: "failed to list sessions",
        },
      ),
    )
      .next((sessions) => {
        const session = sessions.find((s) => s.id === sessionId);
        if (!session) {
          return err({
            message: "Invalid session ID",
            tag: "Could not find the right session when mapped over",
          });
        }
        return ok(session);
      })
      .next((session) =>
        run(
          () => {
            return auth.api.revokeSession({
              body: {
                token: session.token,
              },
              headers: this.requestHeaders,
            });
          },
          "Revoke Session API call",
          {
            message: "Cannot revoke session",
          },
        ),
      );
  }

  public async changePassword(input: UserChangePasswordDto): Promise<void> {
    await throwable(
      () =>
        auth.api.changePassword({
          body: {
            ...input,
            revokeOtherSessions: true,
          },
          headers: this.requestHeaders,
        }),
      {
        message: "failed to change password",
        service: "auth",
        operation: "change-password",
      },
    );
  }

  public async me(): Promise<Optional<UserRo>> {
    try {
      return await this._getUserWithSession();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return null;
    }
  }

  private async _getUserWithSession(): Promise<UserRo> {
    const response = await throwable(
      () => auth.api.getSession({ headers: this.requestHeaders }),
      {
        message: "failed to get session",
        service: "auth",
        operation: "get-session",
      },
    );
    if (!response?.user) {
      throw E.unauthorized("Invalid session");
    }
    return UserMapper.toUserRo({
      user: response.user,
      session: response.session,
    });
  }

  // ======================= Two Factor =======================

  public async enableTwoFactor(
    input: TwoFactorEnableDto,
  ): Promise<TwoFactorEnableRo> {
    return await throwable(
      () =>
        auth.api.enableTwoFactor({
          body: {
            ...input,
          },
          headers: this.requestHeaders,
        }),
      {
        message: "failed to enable two factor",
        service: "auth",
        operation: "enable-two-factor",
      },
    );
  }
  public async getTwoFactorTotpUri(
    input: TwoFactorGetTotpUriDto,
  ): Promise<TwoFactorGetTotpUriRo> {
    return await throwable(
      () =>
        auth.api.getTOTPURI({
          body: input,
          headers: this.requestHeaders,
        }),
      {
        message: "failed to get two factor totp uri",
        service: "auth",
        operation: "get-two-factor-totp-uri",
      },
    );
  }
  public async verifyTwoFactorTotp(
    input: TwoFactorVerifyTotpDto,
  ): Promise<void> {
    await throwable(
      () =>
        auth.api.verifyTOTP({
          body: input,
          headers: this.requestHeaders,
        }),
      {
        message: "failed to verify two factor totp",
        service: "auth",
        operation: "verify-two-factor-totp",
      },
    );
  }
  public async disableTwoFactor(input: TwoFactorDisableDto): Promise<void> {
    await throwable(
      () =>
        auth.api.disableTwoFactor({
          body: input,
          headers: this.requestHeaders,
        }),
      {
        message: "failed to disable two factor",
        service: "auth",
        operation: "disable-two-factor",
      },
    );
  }
  public async generateTwoFactorBackupCodes(
    input: TwoFactorGenerateBackupCodesDto,
  ): Promise<TwoFactorGenerateBackupCodesRo> {
    return await throwable(
      () =>
        auth.api.generateBackupCodes({
          body: input,
          headers: this.requestHeaders,
        }),
      {
        message: "failed to generate two factor backup codes",
        service: "auth",
        operation: "generate-two-factor-backup-codes",
      },
    );
  }

  public async verifyTwoFactorBackupCode(
    input: TwoFactorVerifyBackupCodeDto,
  ): Promise<void> {
    await throwable(
      () =>
        auth.api.verifyBackupCode({
          body: input,
          headers: this.requestHeaders,
        }),
      {
        message: "failed to verify two factor backup code",
        service: "auth",
        operation: "verify-two-factor-backup-code",
      },
    );
  }
}
