import { env } from "@ashgw/env";
import type { EmptyObject } from "ts-roids";
import { response, middlewareFn } from "ts-rest-kit/core";
import type { GlobalContext } from "../../context";

export function authed() {
  return middlewareFn<GlobalContext, EmptyObject>((req, _res) => {
    if (req.headers.get("x-api-token") !== env.X_API_TOKEN) {
      return response.error.unauthorized({
        message: "Invalid token. You cannot perform this action",
      });
    }
  });
}
