import type { auth } from "@rccyx/auth";

export type SessionAuthQuery = Awaited<
  ReturnType<typeof auth.api.listSessions>
>[number];
