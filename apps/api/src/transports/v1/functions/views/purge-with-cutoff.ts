import type { ViewsPurgeWithCutoffHandlerResponses } from "../../models";
import { ViewService } from "@ashgw/core/services";

const retainDays = 2;
const oneDayInMs = 1000 * 60 * 60 * 24;

export async function purgeWithCutoff(): Promise<ViewsPurgeWithCutoffHandlerResponses> {
  return new ViewService()
    .purgeViewWindowWithCutoff({
      cutoff: new Date(Date.now() - oneDayInMs * retainDays), // compute cutoff per function run
    })
    .then((r) =>
      r.match({
        ok: () => {
          return {
            status: 204,
            body: undefined,
          };
        },
        err: {
          ViewServiceDatabaseDeleteManyFailure: (e) => {
            return {
              status: 500,
              body: {
                message: e.message,
              },
            } as const;
          },
        },
      }),
    );
}
