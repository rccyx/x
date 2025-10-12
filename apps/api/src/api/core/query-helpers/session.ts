import type { authApi } from "~/lib/auth";

export type SessionAuthQuery = Awaited<
  ReturnType<typeof authApi.listSessions>
>[number];
