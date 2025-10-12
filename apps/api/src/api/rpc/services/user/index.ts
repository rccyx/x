import { AppError } from "@ashgw/error";
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
} from "~/api/models";
import { SessionMapper, UserMapper } from "~/api/mappers";
import type { Optional } from "ts-roids";
import type { TrpcContext } from "~/trpc/context";
import { authApi } from "~/lib/auth";

export class UserService {
  private readonly ctx: TrpcContext;
  constructor({ ctx }: { ctx: TrpcContext }) {
    this.ctx = ctx;
  }
  // ======================= Login =======================
  public async login({ email, password }: UserLoginDto): Promise<void> {
    await authApi.signInEmail({
      body: {
        email,
        password,
      },
      headers: this.ctx.req.headers,
    });
  }

  public async signUp({
    email,
    password,
    name,
  }: UserRegisterDto): Promise<void> {
    await authApi.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: this.ctx.req.headers,
    });
  }

  public async logout(): Promise<void> {
    await authApi.signOut({
      headers: this.ctx.req.headers,
    });
  }

  public async terminateAllActiveSessions(): Promise<void> {
    await authApi.revokeSessions({
      headers: this.ctx.req.headers,
    });
  }

  public async listSessions(): Promise<SessionRo[]> {
    const sessions = await authApi.listSessions({
      headers: this.ctx.req.headers,
    });
    return sessions.map((s) => SessionMapper.toRo({ session: s }));
  }

  public async terminateSpecificSession({
    sessionId,
  }: UserTerminateSpecificSessionDto): Promise<void> {
    const sessions = await authApi.listSessions({
      headers: this.ctx.req.headers,
    });
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: "Invalid session ID",
      });
    }
    await authApi.revokeSession({
      body: {
        token: target.token,
      },
      headers: this.ctx.req.headers,
    });
  }

  public async changePassword(input: UserChangePasswordDto): Promise<void> {
    await authApi.changePassword({
      body: {
        ...input,
        revokeOtherSessions: true,
      },
      headers: this.ctx.req.headers,
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
    const response = await authApi.getSession({
      headers: this.ctx.req.headers,
    });
    if (!response?.user) {
      throw new AppError({
        code: "UNAUTHORIZED",
      });
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
    return await authApi.enableTwoFactor({
      body: {
        ...input,
      },
      headers: this.ctx.req.headers,
    });
  }
  public async getTwoFactorTotpUri(
    input: TwoFactorGetTotpUriDto,
  ): Promise<TwoFactorGetTotpUriRo> {
    return await authApi.getTOTPURI({
      body: input,
      headers: this.ctx.req.headers,
    });
  }
  public async verifyTwoFactorTotp(
    input: TwoFactorVerifyTotpDto,
  ): Promise<void> {
    await authApi.verifyTOTP({
      body: input,
      headers: this.ctx.req.headers,
    });
  }
  public async disableTwoFactor(input: TwoFactorDisableDto): Promise<void> {
    await authApi.disableTwoFactor({
      body: input,
      headers: this.ctx.req.headers,
    });
  }
  public async generateTwoFactorBackupCodes(
    input: TwoFactorGenerateBackupCodesDto,
  ): Promise<TwoFactorGenerateBackupCodesRo> {
    return await authApi.generateBackupCodes({
      body: input,
      headers: this.ctx.req.headers,
    });
  }

  public async verifyTwoFactorBackupCode(
    input: TwoFactorVerifyBackupCodeDto,
  ): Promise<void> {
    await authApi.verifyBackupCode({
      body: input,
      headers: this.ctx.req.headers,
    });
  }
}
