import type { DatabaseClient } from "@rccyx/db";
import type { GlobalTsrContext as Base } from "restyx/core";

export interface TsrContext extends Base {
  ctx: {
    requestedAt: Date;
    db: DatabaseClient;
  };
}
