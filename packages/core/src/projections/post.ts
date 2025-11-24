import type { Prisma } from "@rccyx/db/raw";

export type PostCardRaw = Prisma.PostGetPayload<{
  select: ReturnType<typeof PostProjection.card>;
}>;

export type PostArticleRaw = Prisma.PostGetPayload<{
  include: ReturnType<typeof PostProjection.article>;
}>;

export type PostAdminRaw = Prisma.PostGetPayload<{
  include: ReturnType<typeof PostProjection.admin>;
}>;

export type TrashPostRaw = Prisma.TrashPostGetPayload<{
  select: ReturnType<typeof PostProjection.trash>;
}>;

export class PostProjection {
  public static article() {
    return {} satisfies Prisma.PostInclude;
  }

  public static card() {
    return {
      slug: true,
      category: true,
      tags: true,
      title: true,
      summary: true,
      firstModDate: true,
      minutesToRead: true,
      viewsCount: true,
    } satisfies Prisma.PostSelect;
  }

  public static admin() {
    return {
      ...this.article(),
    } satisfies Prisma.PostInclude;
  }

  public static public() {
    return {
      isReleased: true,
      firstModDate: { lte: new Date() },
    } satisfies Prisma.PostWhereInput;
  }

  public static trash() {
    return {
      id: true,
      originalSlug: true,
      title: true,
      summary: true,
      firstModDate: true,
      lastModDate: true,
      minutesToRead: true,
      wasReleased: true,
      tags: true,
      category: true,
      mdxText: true,
      deletedAt: true,
    } satisfies Prisma.TrashPostSelect;
  }
}
