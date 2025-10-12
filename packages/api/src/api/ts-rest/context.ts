import type { DatabaseClient } from "@ashgw/db";
import type { GlobalTsrContext } from "ts-rest-kit/core";

export interface GlobalContext extends GlobalTsrContext {
  ctx: {
    requestedAt: Date;
    db: DatabaseClient;
  };
}
