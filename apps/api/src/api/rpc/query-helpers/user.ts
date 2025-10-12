import type { authApi } from "~/lib/auth";

type ExtractUser<T> = T extends { response: { user: infer U } }
  ? U
  : T extends { user: infer U }
    ? U
    : never;

export type UserAuthQuery = ExtractUser<
  Awaited<ReturnType<typeof authApi.getSession>>
>;
