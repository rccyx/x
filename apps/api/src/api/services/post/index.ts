import type { DatabaseClient } from "@ashgw/db";
import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import type {
  PostTrashDeleteResponses,
  PostViewWindowDeleteResponses,
} from "~/api/models";

export class PostService {
  private static readonly retentionDays = 30;
  private static readonly retainDays = 2;
  private readonly db: DatabaseClient;

  constructor({ db }: { db: DatabaseClient }) {
    this.db = db;
  }

  public async purgeTrashPosts(): Promise<PostTrashDeleteResponses> {
    const cutoff = new Date(
      Date.now() - PostService.retentionDays * 24 * 60 * 60 * 1000,
    );

    try {
      const { count } = await this.db.trashPost.deleteMany({
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

  public async purgeViewWindow(): Promise<PostViewWindowDeleteResponses> {
    // compute cutoff per function run
    const cutoff = new Date(
      Date.now() - 1000 * 60 * 60 * 24 * PostService.retainDays,
    );
    logger.info("Cleaning up the post view window...", {
      cutoffDate: cutoff.toISOString(),
    });

    try {
      const deleted = await this.db.postViewWindow.deleteMany({
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
}
