import { auth } from "@ashgw/auth";

export const rootUri = {
  v1: "/v1",
  rpc: "/rpc",
  auth: auth.basePath,
} as const;
