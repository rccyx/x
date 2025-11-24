import type { api } from "@rccyx/auth";

export type SessionRaw = Awaited<ReturnType<typeof api.listSessions>>[number];
