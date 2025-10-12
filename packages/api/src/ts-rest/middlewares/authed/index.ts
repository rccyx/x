import { env } from "@ashgw/env";
import type { EmptyObject } from "ts-roids";
import { middlewareResponse, middlewareFn } from "ts-rest-kit/core";
import type { GlobalContext } from "~/ts-rest/context";

export function authed() {
  return middlewareFn<GlobalContext, EmptyObject>((req, _res) => {
    if (req.headers.get("x-api-token") !== env.X_API_TOKEN) {
      return middlewareResponse.errors.unauthorized({
        message: "Invalid token. You cannot perform this action",
      });
    }
  });
}
