import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import type { PostViewWindowDeleteResponses } from "../../models";
import { ViewService } from "@ashgw/core/services";

const retainDays = 2;

export async function deleteViewWindow(): Promise<PostViewWindowDeleteResponses> {
  // compute cutoff per function run
  const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 24 * retainDays);

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
