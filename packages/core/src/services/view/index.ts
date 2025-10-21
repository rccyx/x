import { createHash } from "crypto";
import { db } from "@ashgw/db";
import { env } from "@ashgw/env";
import { logger } from "@ashgw/logger";
import type {
  TrackViewDto,
  TrackViewRo,
  ViewWindowPurgeWithCutoffDto,
  ViewWindowPurgeWithCutoffRo,
} from "../../models/view";

export class ViewService {
  public async trackView({
    slug,
    ipAddress,
    userAgent,
  }: TrackViewDto): Promise<TrackViewRo> {
    const fingerprint = this._fingerprint({ slug, ipAddress, userAgent });
    const bucketStart = this._utcMidnight(new Date());

    let total = 0;
    await throwable(
      () =>
        db.$transaction(async (tx) => {
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
        }),
      {
        message: "failed to track view",
        service: "db",
        operation: "transaction.track-view",
      },
    );
    return { total };
  }
  private _fingerprint({
    slug,
    ipAddress,
    userAgent,
  }: {
    slug: string;
    ipAddress: string;
    userAgent: string;
  }): string {
    const hashedIp = createHash("sha256")
      .update(ipAddress + env.IP_HASH_SALT)
      .digest("hex");
    return createHash("sha256")
      .update(`${slug}:${hashedIp}:${userAgent}`)
      .digest("hex");
  }

  private _utcMidnight(d: Date): Date {
    return new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0),
    );
  }

  public async purgeViewWindowWithCutoff({
    cutoff,
  }: ViewWindowPurgeWithCutoffDto): Promise<ViewWindowPurgeWithCutoffRo> {
    logger.info("Cleaning up the view window prior to: ", {
      cutoffDate: cutoff.toISOString(),
    });
    const deleted = await throwable(
      () =>
        db.postViewWindow.deleteMany({
          where: { bucketStart: { lt: cutoff } },
        }),
      {
        message: "failed to purge view window",
        service: "db",
        operation: "postViewWindow.deleteMany",
      },
    );
    const deletedCount = deleted.count;
    if (deletedCount > 0) {
      logger.info("View window records purged successfully!", {
        deleted: deletedCount,
        cutoff: cutoff.toISOString(),
      });
    } else {
      logger.info("No record to purge, view window is clean", {
        cutoff: cutoff.toISOString(),
      });
    }
    return { deletedCount };
  }
}
