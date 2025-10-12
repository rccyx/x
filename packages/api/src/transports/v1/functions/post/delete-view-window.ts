import { db } from "@ashgw/db";
import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import type { PostViewWindowDeleteResponses } from "../../models";

const retainDays = 2;

export async function deleteViewWindow(): Promise<PostViewWindowDeleteResponses> {
  // compute cutoff per function run
  const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 24 * retainDays);
  logger.info("Cleaning up the post view window...", {
    cutoffDate: cutoff.toISOString(),
  });

  try {
    const deleted = await db.postViewWindow.deleteMany({
      where: { bucketStart: { lt: cutoff } }, // uses @@index([bucketStart])
    });

    if (deleted.count > 0) {
      logger.info("View window records purged successfully!", {
        deleted: deleted.count,
        cutoff: cutoff.toISOString(),
      });
    } else {
      logger.info("No record to purge, view window is clean", {
        cutoff: cutoff.toISOString(),
      });
    }

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
