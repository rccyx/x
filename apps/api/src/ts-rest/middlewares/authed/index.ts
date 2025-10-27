import { env } from "@ashgw/env";
import type { EmptyObject } from "ts-roids";
import { middlewareFn } from "ts-rest-kit/core";
import type { GlobalContext } from "../../context";

export function authed() {
  return middlewareFn<GlobalContext, EmptyObject>((req, _res) => {
    if (req.headers.get("x-api-token") !== env.X_API_TOKEN) {
      return {
        status: 401,
        body: {
          message: "Invalid token. You cannot perform this action",
        },
      } as const;
    }
  });
}
