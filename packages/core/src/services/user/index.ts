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

export class UserService {
  private readonly requestHeaders: Headers;
  constructor({ requestHeaders }: { requestHeaders: Headers }) {
    this.requestHeaders = requestHeaders;
  }
  public async login({ email, password }: UserLoginDto): Promise<void> {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: this.requestHeaders,
    });
  }

  public async signUp({ email, password, name }: UserRegisterDto) {
    return await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });
  }

  public async logout() {
    return auth.api.signOut({ headers: this.requestHeaders });
  }

  public async terminateAllActiveSessions() {
    return await auth.api.revokeSessions({
      headers: this.requestHeaders,
    });
  }

  public async listSessions() {
    const sessions = await auth.api.listSessions({
      headers: this.requestHeaders,
    });
    return sessions.map((s) => SessionMapper.toRo({ session: s }));
  }

  public async terminateSpecificSession({
    sessionId,
  }: UserTerminateSpecificSessionDto) {
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
    return await auth.api.changePassword({
      body: {
        ...input,
        revokeOtherSessions: true,
      },
      headers: this.requestHeaders,
    });
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
    return auth.api.getTOTPURI({
      body: input,
      headers: this.requestHeaders,
    });
  }
  public async verifyTwoFactorTotp(
    input: TwoFactorVerifyTotpDto,
  ): Promise<void> {
    await auth.api.verifyTOTP({
      body: input,
      headers: this.requestHeaders,
    });
  }
  public async disableTwoFactor(input: TwoFactorDisableDto): Promise<void> {
    await auth.api.disableTwoFactor({
      body: input,
      headers: this.requestHeaders,
    });
  }
  public async generateTwoFactorBackupCodes(
    input: TwoFactorGenerateBackupCodesDto,
  ): Promise<TwoFactorGenerateBackupCodesRo> {
    return await auth.api.generateBackupCodes({
      body: input,
      headers: this.requestHeaders,
    });
  }

  public async verifyTwoFactorBackupCode(
    input: TwoFactorVerifyBackupCodeDto,
  ): Promise<void> {
    await auth.api.verifyBackupCode({
      body: input,
      headers: this.requestHeaders,
    });
  }
}
