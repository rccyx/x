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
  SessionRo,
} from "../../models";
import { SessionMapper, UserMapper } from "../../mappers";
import { api } from "@rccyx/auth";
import { logger as baseLogger } from "@rccyx/logger";
import { err, ok, run, runner } from "@rccyx/runner";

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
    return runner(
      run(
        () =>
          api.signInEmail({
            body: { email, password },
            headers: this.requestHeaders,
          }),
        `${this.serviceTag}${this.authApiTag}SignInEmailFailure`,
        { severity: "error", message: "failed to sign in" },
      ),
    ).next(() => ok());
  }

  public async signUp({ email, password, name }: UserRegisterDto) {
    logger.info("Signing up user");
    return run(
      () =>
        api.signUpEmail({
          body: { email, password, name },
          headers: this.requestHeaders,
        }),
      `${this.serviceTag}${this.authApiTag}SignUpEmailFailure`,
      { severity: "error", message: "failed to sign up" },
    );
  }

  public async logout() {
    logger.info("Logging out user");
    return runner(
      run(
        () => api.signOut({ headers: this.requestHeaders }),
        `${this.serviceTag}${this.authApiTag}SignOutFailure`,
        { severity: "error", message: "failed to sign out" },
      ),
    ).next(() => ok());
  }

  public async terminateAllActiveSessions() {
    logger.info("Terminating all active sessions");
    return runner(
      run(
        () => api.revokeSessions({ headers: this.requestHeaders }),
        `${this.serviceTag}${this.authApiTag}RevokeSessionsFailure`,
        { severity: "error", message: "failed to revoke sessions" },
      ),
    ).next(() => ok());
  }

  public async listSessions() {
    logger.info("Listing all sessions");
    return runner(
      run(
        () => api.listSessions({ headers: this.requestHeaders }),
        `${this.serviceTag}${this.authApiTag}ListSessionsFailure`,
        { severity: "error", message: "failed to list sessions" },
      ),
    ).next((rawSessions) =>
      ok<SessionRo[]>(
        rawSessions.map((session) => SessionMapper.toSessionRo({ session })),
      ),
    );
  }

  public async terminateSpecificSession({
    sessionId,
  }: UserTerminateSpecificSessionDto) {
    return runner(
      run(
        () => api.listSessions({ headers: this.requestHeaders }),
        `${this.serviceTag}${this.authApiTag}ListSessionsFailure`,
        { severity: "error", message: "failed to list sessions" },
      ),
    )
      .next((rawSessions) => {
        const rawSession = rawSessions.find((s) => s.id === sessionId);
        if (!rawSession) {
          return err({
            severity: "warn",
            tag: `${this.serviceTag}${this.authApiTag}InvalidSessionId`,
            message: "Invalid session ID",
            meta: {
              note: "the provided session ID doesnt match any of the active sessions",
            },
          });
        }
        return ok(rawSession);
      })
      .next((rawSession) =>
        run(
          () =>
            api.revokeSession({
              body: { token: rawSession.token },
              headers: this._cookies(),
            }),
          `${this.serviceTag}${this.authApiTag}RevokeSessionFailure`,
          { severity: "error", message: "failed to revoke session" },
        ),
      )
      .next(() => ok());
  }

  public async changePassword(input: UserChangePasswordDto) {
    logger.info("Changing password");
    return runner(
      run(
        () =>
          api.changePassword({
            body: { ...input, revokeOtherSessions: true },
            headers: this._cookies(),
          }),
        `${this.serviceTag}${this.authApiTag}ChangePasswordFailure`,
        { severity: "error", message: "failed to change password" },
      ),
    ).next(() => ok());
  }

  public async getUserWithSession() {
    logger.info("Getting user with session");
    return runner(
      run(
        () => api.getSession({ headers: this.requestHeaders }),
        `${this.serviceTag}${this.authApiTag}GetSession`,
        { severity: "error", message: "failed to get session" },
      ),
    ).next((res) => {
      if (!res?.user) {
        return err({
          severity: "warn",
          tag: `${this.serviceTag}${this.authApiTag}InvalidSession`,
          message: "no user found in session",
        });
      }
      return ok<UserRo>(
        UserMapper.toUserRo({ user: res.user, session: res.session }),
      );
    });
  }

  public async enableTwoFactor(input: TwoFactorEnableDto) {
    logger.info("Enabling two factor");
    return runner(
      run(
        () =>
          api.enableTwoFactor({
            body: { ...input },
            headers: this._cookies(),
          }),
        `${this.serviceTag}${this.authApiTag}EnableTwoFactorFailure`,
        { severity: "error", message: "failed to enable two factor" },
      ),
    ).next(({ backupCodes, totpURI }) =>
      ok<TwoFactorEnableRo>({ backupCodes, totpURI }),
    );
  }

  public async getTwoFactorTotpUri(input: TwoFactorGetTotpUriDto) {
    logger.info("Getting two factor totp uri");
    return runner(
      run(
        () =>
          api.getTOTPURI({
            body: input,
            headers: this._cookies(),
          }),
        `${this.serviceTag}${this.authApiTag}GetTOTPURIFailure`,
        { severity: "error", message: "failed to get totp uri" },
      ),
    ).next(({ totpURI }) => ok<TwoFactorGetTotpUriRo>({ totpURI }));
  }

  public async verifyTwoFactorTotp(input: TwoFactorVerifyTotpDto) {
    logger.info("Verifying two factor totp");
    return runner(
      run(
        () =>
          api.verifyTOTP({
            body: input,
            headers: this._cookies(),
          }),
        `${this.serviceTag}${this.authApiTag}VerifyTOTPFailure`,
        { severity: "error", message: "failed to verify totp" },
      ),
    ).next(() => ok());
  }

  public async disableTwoFactor(input: TwoFactorDisableDto) {
    logger.info("Disabling two factor");
    return runner(
      run(
        () =>
          api.disableTwoFactor({
            body: input,
            headers: this._cookies(),
          }),
        `${this.serviceTag}${this.authApiTag}DisableTwoFactorFailure`,
        { severity: "error", message: "failed to disable two factor" },
      ),
    ).next(() => ok());
  }

  public async generateTwoFactorBackupCodes(
    input: TwoFactorGenerateBackupCodesDto,
  ) {
    logger.info("Generating two factor backup codes");
    return runner(
      run(
        () =>
          api.generateBackupCodes({
            body: input,
            headers: this._cookies(),
          }),
        `${this.serviceTag}${this.authApiTag}GenerateBackupCodesFailure`,
        { severity: "error", message: "failed to generate backup codes" },
      ),
    ).next(({ backupCodes }) =>
      ok<TwoFactorGenerateBackupCodesRo>({ backupCodes }),
    );
  }

  public async verifyTwoFactorBackupCode(input: TwoFactorVerifyBackupCodeDto) {
    logger.info("Verifying two factor backup code");
    return runner(
      run(
        () =>
          api.verifyBackupCode({
            body: input,
            headers: this._cookies(),
          }),
        `${this.serviceTag}${this.authApiTag}VerifyBackupCodeFailure`,
        { severity: "error", message: "failed to verify backup code" },
      ),
    ).next(() => ok());
  }

  private _cookies(): HeadersInit {
    const cookie = this.requestHeaders.get("cookie");
    return cookie ? { cookie } : {};
  }
}
