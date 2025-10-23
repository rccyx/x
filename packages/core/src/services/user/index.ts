import type {
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
import { logger as baseLogger } from "@ashgw/logger";
import { run } from "@ashgw/runner";

const logger = baseLogger.withContext({
  service: "UserService",
});

export class UserService {
  private readonly serviceTag = "UserService";
  private readonly authApiTag = "AuthApi";

  private readonly requestHeaders: Headers;
  constructor({ requestHeaders }: { requestHeaders: Headers }) {
    this.requestHeaders = requestHeaders;
  }
  public async login({ email, password }: UserLoginDto) {
    logger.info("Logging in user");
    return run(
      () =>
        auth.api.signInEmail({
          body: {
            email,
            password,
          },
          headers: this.requestHeaders,
        }),
      `${this.serviceTag}${this.authApiTag}SignInEmailFailure`,
      {
        severity: "error",
        message: "failed to sign in",
      },
    );
  }

  public async signUp({ email, password, name }: UserRegisterDto) {
    logger.info("Signing up user");
    return run(
      () =>
        auth.api.signUpEmail({
          body: {
            email,
            password,
            name,
          },
          headers: this.requestHeaders,
        }),
      `${this.serviceTag}${this.authApiTag}SignUpEmailFailure`,
      {
        severity: "error",
        message: "failed to sign up",
      },
    );
  }

  public async logout() {
    logger.info("Logging out user");
    return run(
      () => auth.api.signOut({ headers: this.requestHeaders }),
      `${this.serviceTag}${this.authApiTag}SignOutFailure`,
      {
        severity: "error",
        message: "failed to sign out",
      },
    );
  }

  public async terminateAllActiveSessions() {
    logger.info("Terminating all active sessions");
    return run(
      () => auth.api.revokeSessions({ headers: this.requestHeaders }),
      `${this.serviceTag}${this.authApiTag}RevokeSessionsFailure`,
      {
        severity: "error",
        message: "failed to revoke sessions",
      },
    );
  }

  public async listSessions() {
    logger.info("Listing all sessions");
    const sessions = await auth.api.listSessions({
      headers: this.requestHeaders,
    });
    return sessions.map((s) => SessionMapper.toRo({ session: s }));
  }

  public async terminateSpecificSession({
    sessionId,
  }: UserTerminateSpecificSessionDto) {
    logger.info("Terminating specific session");
    const sessions = await auth.api.listSessions({
      headers: this.requestHeaders,
    });
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      throw Error("Invalid session ID");
    }
    return await auth.api.revokeSession({
      body: {
        token: session.token,
      },
      headers: this.requestHeaders,
    });
  }

  public async changePassword(input: UserChangePasswordDto) {
    logger.info("Changing password");
    return await auth.api.changePassword({
      body: {
        ...input,
        revokeOtherSessions: true,
      },
      headers: this.requestHeaders,
    });
  }

  public async me(): Promise<Optional<UserRo>> {
    logger.info("Get me");
    try {
      return await this._getUserWithSession();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return null;
    }
  }

  private async _getUserWithSession(): Promise<UserRo> {
    logger.info("Getting user with session");
    const response = await auth.api.getSession({
      headers: this.requestHeaders,
    });
    if (!response?.user) {
      throw Error("Invalid session");
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
    logger.info("Enabling two factor");
    return await auth.api.enableTwoFactor({
      body: {
        ...input,
      },
      headers: this.requestHeaders,
    });
  }
  public async getTwoFactorTotpUri(
    input: TwoFactorGetTotpUriDto,
  ): Promise<TwoFactorGetTotpUriRo> {
    logger.info("Getting two factor totp uri");
    return auth.api.getTOTPURI({
      body: input,
      headers: this.requestHeaders,
    });
  }
  public async verifyTwoFactorTotp(
    input: TwoFactorVerifyTotpDto,
  ): Promise<void> {
    logger.info("Verifying two factor totp");
    await auth.api.verifyTOTP({
      body: input,
      headers: this.requestHeaders,
    });
  }
  public async disableTwoFactor(input: TwoFactorDisableDto): Promise<void> {
    logger.info("Disabling two factor");
    await auth.api.disableTwoFactor({
      body: input,
      headers: this.requestHeaders,
    });
  }
  public async generateTwoFactorBackupCodes(
    input: TwoFactorGenerateBackupCodesDto,
  ): Promise<TwoFactorGenerateBackupCodesRo> {
    logger.info("Generating two factor backup codes");
    return await auth.api.generateBackupCodes({
      body: input,
      headers: this.requestHeaders,
    });
  }

  public async verifyTwoFactorBackupCode(
    input: TwoFactorVerifyBackupCodeDto,
  ): Promise<void> {
    logger.info("Verifying two factor backup code");
    await auth.api.verifyBackupCode({
      body: input,
      headers: this.requestHeaders,
    });
  }
}
