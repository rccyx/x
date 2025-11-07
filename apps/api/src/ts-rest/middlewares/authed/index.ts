import { env } from "@rccyx/env";
import type { EmptyObject } from "typyx";
import { response, middlewareFn } from "ts-rest-kit/core";
import type { TsrContext } from "../../context";

export function authed() {
  return middlewareFn<TsrContext, EmptyObject>((req, _res) => {
    if (req.headers.get("x-api-token") !== env.X_API_TOKEN) {
      return response.error.unauthorized({
        message: "Invalid token. You cannot perform this action",
      });
    }
  });
}
