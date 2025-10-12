import type { Prisma } from "@ashgw/db/raw";

export type PostCardQuery = Prisma.PostGetPayload<{
  select: ReturnType<typeof PostQueryHelper.cardSelect>;
}>;

export type PostArticleQuery = Prisma.PostGetPayload<{
  include: ReturnType<typeof PostQueryHelper.articleInclude>;
}>;

export type PostAdminQuery = Prisma.PostGetPayload<{
  include: ReturnType<typeof PostQueryHelper.adminInclude>;
}>;

export type TrashPostArticleQuery = Prisma.TrashPostGetPayload<{
  select: ReturnType<typeof PostQueryHelper.trashArticleSelect>;
}>;

export class PostQueryHelper {
  public static articleInclude() {
    return {} satisfies Prisma.PostInclude;
  }

  public static cardSelect() {
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

  public static adminInclude() {
    return {
      ...this.articleInclude(),
    } satisfies Prisma.PostInclude;
  }

  public static whereReleasedToPublic() {
    return {
      isReleased: true,
      firstModDate: { lte: new Date() },
    } satisfies Prisma.PostWhereInput;
  }

  public static trashArticleSelect() {
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
