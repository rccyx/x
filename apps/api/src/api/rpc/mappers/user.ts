import type { UserRo } from "../models";
import type { UserAuthQuery } from "../query-helpers/user";
import { UserRoleEnum } from "../models";
import { AppError } from "@ashgw/error";
import type { SessionAuthQuery } from "../query-helpers/session";
import { SessionMapper } from "./session";

export class UserMapper {
  public static toUserRo({
    user,
    session,
  }: {
    user: UserAuthQuery;
    session: SessionAuthQuery;
  }): UserRo {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
      updatedAt: user.updatedAt,
      image: user.image ? user.image : undefined,
      role: this._mapRoleFromAuthQuery({ role: user.role }),
      twoFactorEnabled: user.twoFactorEnabled ?? false,
      session: SessionMapper.toRo({ session }),
    };
  }

  private static _mapRoleFromAuthQuery({
    role,
  }: {
    role: string;
  }): UserRoleEnum {
    const normalized = role.toLowerCase().trim();

    switch (normalized) {
      case "admin":
        return UserRoleEnum.ADMIN;
      case "visitor":
        return UserRoleEnum.VISITOR;
      default:
        throw new AppError({
          code: "INTERNAL",
          message: "Invalid role type, got: " + role,
        });
    }
  }
}
