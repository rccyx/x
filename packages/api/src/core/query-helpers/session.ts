import type { auth } from "@ashgw/auth";

export type SessionAuthQuery = Awaited<
  ReturnType<typeof auth.api.listSessions>
>[number];
