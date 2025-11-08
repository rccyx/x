import type { api } from "@rccyx/auth";

export type SessionAuthQuery = Awaited<
  ReturnType<typeof api.listSessions>
>[number];
