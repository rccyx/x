import { db } from "@ashgw/db";
import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import type { PostTrashDeleteResponses } from "~/transports/v1/models";

const retentionDays = 30;

export async function deleteTrash(): Promise<PostTrashDeleteResponses> {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  try {
    const { count } = await db.trashPost.deleteMany({
      where: { deletedAt: { lt: cutoff } },
    });

    logger.info("Trashed posts purged", {
      deleted: count,
      cutoff: cutoff.toISOString(),
    });
    return { status: 204, body: undefined };
  } catch (error) {
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
