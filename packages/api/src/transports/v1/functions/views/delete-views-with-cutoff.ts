import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import type { ViewWindowDeleteHandlerResponses } from "../../models";
import { ViewService } from "@ashgw/core/services";

const retainDays = 2;
const oneDayInMs = 1000 * 60 * 60 * 24;

export async function deleteViewWindowWithCutoff(): Promise<ViewWindowDeleteHandlerResponses> {
  // compute cutoff per function run
  const cutoff = new Date(Date.now() - oneDayInMs * retainDays);

  try {
    await new ViewService().purgeViewWindowWithCutoff({
      cutoff,
    });
    return {
      status: 204,
      body: undefined,
    };
  } catch (error) {
    logger.error("purgeViewWindow cleanup failed", { error });
    monitor.next.captureException({ error });
    return {
      status: 500,
      body: {
        code: "INTERNAL_ERROR",
        message: "Oops! Looks like it's on me this time",
      },
    };
  }
}
