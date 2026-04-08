import type { DatabaseClient } from "@rccyx/db";
import type { GlobalContext as Base } from "../../adapters/restyx/framework/src/core";

export interface RestyxContext extends Base {
  ctx: {
    requestedAt: Date;
    db: DatabaseClient;
  };
}
