import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import type { DatabaseClient } from "@ashgw/db";
import { env } from "@ashgw/env";
import { logger } from "@ashgw/logger";
import type { TrackViewRo } from "~/api/models/view";
export class ViewService {
  private readonly db: DatabaseClient;
  private readonly req: NextRequest;

  constructor({ db, req }: { db: DatabaseClient; req: NextRequest }) {
    this.db = db;
    this.req = req;
  }

  public async trackView({ slug }: { slug: string }): Promise<TrackViewRo> {
    const headersList = this.req.headers;
    const ipAddress =
      headersList.get("x-forwarded-for") ??
      headersList.get("x-real-ip") ??
      "127.0.0.1";
    const userAgent = headersList.get("user-agent") ?? "unknown";

    const fingerprint = this._fingerprint({ slug, ipAddress, userAgent });
    const bucketStart = this._utcMidnight(new Date());

    let total = 0;
    await this.db.$transaction(async (tx) => {
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
}
