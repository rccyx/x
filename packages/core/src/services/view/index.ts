import { db } from "@rccyx/db";
import { logger } from "@rccyx/logger";
import type {
  TrackViewDto,
  TrackViewRo,
  ViewWindowPurgeWithCutoffDto,
  ViewWindowPurgeWithCutoffRo,
} from "../../models/view";
import { ok, run, runner } from "@rccyx/runner";

type Fingerprint = string;

export class ViewService {
  private readonly serviceTag = "ViewService";
  public async trackView({
    slug,
    uniqueViewerHash,
  }: TrackViewDto & { uniqueViewerHash: string }) {
    return runner(ok<Fingerprint>(slug + ":" + uniqueViewerHash))
      .next(() => {
        const bucketStart = new Date(
          Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            new Date().getUTCDate(),
            0,
            0,
            0,
            0,
          ),
        );
        return ok(bucketStart);
      })
      .nextAcc((fingerprint, bucketStart) =>
        run(
          () => this._trackViewTransaction({ bucketStart, fingerprint, slug }),
          `${this.serviceTag}DatabaseTransactionFailure`,
          {
            message: "failed to track view",
            severity: "error",
          },
        ),
      )
      .next(({ total }) => ok<TrackViewRo>({ total }));
  }

  private async _trackViewTransaction({
    bucketStart,
    fingerprint,
    slug,
  }: {
    slug: string;
    fingerprint: string;
    bucketStart: Date;
  }) {
    let total = 0;
    await db.$transaction(async (tx) => {
      const inserted = await tx.postViewWindow.createMany({
        data: { postSlug: slug, fingerprint, bucketStart },
        skipDuplicates: true,
      });

      if (inserted.count > 0) {
        const updated = await tx.post.update({
          where: { slug },
          data: { viewsCount: { increment: 1 } },
          select: { viewsCount: true },
        });
        total = updated.viewsCount;
        logger.info("New view tracked", { slug });
      } else {
        const existing = await tx.post.findUnique({
          where: { slug },
          select: { viewsCount: true },
        });
        logger.info("User already saw the post, no view to track", {
          slug,
        });
        total = existing?.viewsCount ?? 0;
      }
    });
    return { total };
  }

  public async purgeViewWindowWithCutoff({
    cutoff,
  }: ViewWindowPurgeWithCutoffDto) {
    logger.info("Cleaning up the view window prior to: ", {
      cutoffDate: cutoff.toISOString(),
    });

    return runner(
      run(
        () =>
          db.postViewWindow.deleteMany({
            where: { bucketStart: { lt: cutoff } },
          }),
        `${this.serviceTag}DatabaseDeleteManyFailure`,
        {
          severity: "fatal",
          message: "failed to purge view window",
        },
      ),
    ).next(({ count }) => {
      if (count > 0) {
        logger.info("View window records purged successfully!", {
          deleted: count,
          cutoff: cutoff.toISOString(),
        });
      } else {
        logger.info("No record to purge, view window is clean", {
          cutoff: cutoff.toISOString(),
        });
      }
      return ok<ViewWindowPurgeWithCutoffRo>({ deletedCount: count });
    });
  }
}
