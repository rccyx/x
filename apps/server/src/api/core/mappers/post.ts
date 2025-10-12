import type { PostCategory as DbPostCategory } from "@ashgw/db/raw";

import type {
  fontMatterMdxContentRo,
  PostCardRo,
  PostArticleRo,
  TrashPostArticleRo,
} from "../models";
import type {
  PostCardQuery,
  PostArticleQuery,
  TrashPostArticleQuery,
} from "../query-helpers";
import { PostCategoryEnum } from "../models";

export class PostMapper {
  public static toCardRo({ post }: { post: PostCardQuery }): PostCardRo {
    return {
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      firstModDate: post.firstModDate,
      minutesToRead: post.minutesToRead,
      tags: post.tags,
      views: post.viewsCount,
      category: this._mapCategory({
        category: post.category,
      }),
    };
  }

  public static toArticleRo({
    post,
  }: {
    post: PostArticleQuery;
    fontMatterMdxContent: fontMatterMdxContentRo;
  }): PostArticleRo {
    return {
      ...this.toCardRo({ post }),
      lastModDate: post.lastModDate,
      isReleased: post.isReleased,
      slug: post.slug,
      fontMatterMdxContent: {
        body: post.mdxText,
        bodyBegin: 0,
      },
    };
  }
  public static toTrashRo({
    post,
  }: {
    post: TrashPostArticleQuery;
  }): TrashPostArticleRo {
    return {
      category: this._mapCategory({
        category: post.category,
      }),
      title: post.title,
      summary: post.summary,
      tags: post.tags,
      mdxText: post.mdxText,
      deletedAt: post.deletedAt,
      originalSlug: post.originalSlug,
      firstModDate: post.firstModDate,
      lastModDate: post.lastModDate,
      wasReleased: post.wasReleased,
      id: post.id,
    };
  }

  private static _mapCategory({
    category,
  }: {
    category: DbPostCategory;
  }): PostCategoryEnum {
    switch (category) {
      case "HEALTH":
        return PostCategoryEnum.HEALTH;
      case "PHILOSOPHY":
        return PostCategoryEnum.PHILOSOPHY;
      case "SOFTWARE":
        return PostCategoryEnum.SOFTWARE;
    }
  }
}
