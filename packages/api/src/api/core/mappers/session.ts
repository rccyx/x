import type { SessionRo } from "../models";
import type { SessionAuthQuery } from "../query-helpers/session";

export class SessionMapper {
  public static toRo({ session }: { session: SessionAuthQuery }): SessionRo {
    return {
      id: session.id,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      isExpired: new Date(session.expiresAt) < new Date(),
      userAgent: session.userAgent ? session.userAgent : undefined,
    };
  }
}
