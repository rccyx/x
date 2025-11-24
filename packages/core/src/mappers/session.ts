import type { SessionRo } from "../models";
import type { SessionRaw } from "../projections/session";

export class SessionMapper {
  public static toRo({ session }: { session: SessionRaw }): SessionRo {
    return {
      id: session.id,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      isExpired: new Date(session.expiresAt) < new Date(),
      userAgent: session.userAgent ? session.userAgent : undefined,
    };
  }
}
