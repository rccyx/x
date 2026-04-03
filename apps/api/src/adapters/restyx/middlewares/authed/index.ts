import { env } from "@rccyx/env";
import type { EmptyObject } from "typyx";
import { response, middlewareFn } from "@restyx/next/core";
import type { RestyxContext } from "../../context";

export function authed() {
  return middlewareFn<RestyxContext, EmptyObject>((req, _res) => {
    if (req.headers.get("x-api-token") !== env.X_API_KEY) {
      return response.error.unauthorized({
        message: "Invalid token. You cannot perform this action",
      });
    }
  });
}
