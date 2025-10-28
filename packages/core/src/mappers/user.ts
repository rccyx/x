import type { UserRo } from "../models";
import type { UserAuthQuery } from "../query-helpers/user";
import { UserRoleEnum } from "../models";
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
      image: user.image ?? null,
      role: this._mapRoleFromAuthQuery(user.role),
      twoFactorEnabled: user.twoFactorEnabled ?? false,
      session: SessionMapper.toRo({ session }),
    };
  }

  private static _mapRoleFromAuthQuery(role: string): UserRoleEnum {
    const normalized = role.toLowerCase().trim();

    const map: Record<"admin" | "visitor", UserRoleEnum> = {
      admin: UserRoleEnum.ADMIN,
      visitor: UserRoleEnum.VISITOR,
    };
    // fallback to visitor by default, but it will never happen
    return (
      (map as Record<string, UserRoleEnum>)[normalized] ?? UserRoleEnum.VISITOR
    );
  }
}
