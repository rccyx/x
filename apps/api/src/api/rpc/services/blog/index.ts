import type { FrontMatterResult } from "front-matter";
import type { Optional } from "ts-roids";
import fm from "front-matter";
import type { DatabaseClient } from "@ashgw/db";
import type { StorageClient } from "@ashgw/storage";
import { WordCounterService } from "@ashgw/cross-runtime";
import { AppError } from "@ashgw/error";
import { logger } from "@ashgw/logger";

import type {
  fontMatterMdxContentRo,
  PostCardRo,
  PostArticleRo,
  PostEditorDto,
  TrashPostArticleRo,
} from "~/api/models";
import { PostMapper } from "~/api/mappers";
import { fontMatterMdxContentSchemaRo } from "~/api/models";
import { PostQueryHelper } from "~/api/query-helpers";

export class BlogService {
  private readonly db: DatabaseClient;
  // storage still injected for images or future assets...
  private readonly storage: StorageClient;

  constructor({ db, storage }: { db: DatabaseClient; storage: StorageClient }) {
    this.db = db;
    this.storage = storage;
  }

  public async getPublicPostCards(): Promise<PostCardRo[]> {
    const posts = await this.db.post.findMany({
      where: PostQueryHelper.whereReleasedToPublic(),
      select: {
        ...PostQueryHelper.cardSelect(),
      },
      orderBy: { firstModDate: "desc" },
    });

    return posts.map((post) =>
      PostMapper.toCardRo({
        post,
      }),
    );
  }
  public async getAllAdminPosts(): Promise<PostArticleRo[]> {
    const posts = await this.db.post.findMany({
      include: PostQueryHelper.adminInclude(),
      orderBy: { firstModDate: "desc" },
    });
    if (posts.length === 0) return [];

    return posts.map((post) =>
      PostMapper.toArticleRo({
        post,
        fontMatterMdxContent: this._parseMDX({
          content: post.mdxText,
          slug: post.slug,
        }),
      }),
    );
  }

  public async getTrashedPosts(): Promise<TrashPostArticleRo[]> {
    const trashed = await this.db.trashPost.findMany({
      orderBy: { deletedAt: "desc" },
    });

    if (trashed.length === 0) return [];

    return trashed.map((t) =>
      PostMapper.toTrashRo({
        post: t,
      }),
    );
  }

  public async getDetailedPublicPost({
    slug,
  }: {
    slug: string;
  }): Promise<Optional<PostArticleRo>> {
    const post = await this.db.post.findUnique({
      where: { slug, ...PostQueryHelper.whereReleasedToPublic() },
      include: PostQueryHelper.articleInclude(),
    });
    if (!post) return null;

    return PostMapper.toArticleRo({
      post,
      fontMatterMdxContent: this._parseMDX({ content: post.mdxText, slug }),
    });
  }

  public async createPost(data: PostEditorDto): Promise<PostArticleRo> {
    const slug = this._slugify(data.title);
    const existingPost = await this.db.post.findUnique({ where: { slug } });
    if (existingPost) {
      throw new AppError({
        code: "CONFLICT",
        message: `A post with slug "${slug}" already exists`,
      });
    }

    const now = new Date();
    const minutesToRead = WordCounterService.countMinutesToRead(data.mdxText);

    const post = await this.db.post.create({
      data: {
        slug,
        title: data.title,
        summary: data.summary,
        isReleased: data.isReleased,
        firstModDate: now,
        lastModDate: now,
        minutesToRead,
        tags: data.tags,
        category: data.category,
        mdxText: data.mdxText,
      },
      include: PostQueryHelper.articleInclude(),
    });

    return PostMapper.toArticleRo({
      post,
      fontMatterMdxContent: this._parseMDX({
        content: data.mdxText,
        slug,
      }),
    });
  }

  public async updatePost({
    data,
    slug,
  }: {
    slug: string;
    data: PostEditorDto;
  }): Promise<PostArticleRo> {
    const existingPost = await this.db.post.findUnique({
      where: { slug },
      select: { slug: true },
    });
    if (!existingPost) {
      throw new AppError({
        code: "NOT_FOUND",
        message: `Post with slug "${slug}" not found`,
      });
    }

    const minutesToRead = WordCounterService.countMinutesToRead(data.mdxText);

    const post = await this.db.post.update({
      where: { slug },
      data: {
        title: data.title,
        summary: data.summary,
        isReleased: data.isReleased,
        lastModDate: new Date(),
        minutesToRead,
        tags: data.tags,
        category: data.category,
        mdxText: data.mdxText,
      },
      include: PostQueryHelper.articleInclude(),
    });

    return PostMapper.toArticleRo({
      post,
      fontMatterMdxContent: this._parseMDX({
        content: data.mdxText,
        slug,
      }),
    });
  }

  /**
   * Move a live post to TrashPost. (no support for images or other assets yet)
   */
  public async trashPost({
    originalSlug,
  }: {
    originalSlug: string;
  }): Promise<void> {
    const post = await this.db.post.findUnique({
      where: { slug: originalSlug },
    });
    if (!post) {
      throw new AppError({
        code: "NOT_FOUND",
        message: `Post with slug "${originalSlug}" not found`,
      });
    }

    await this.db.$transaction(async (tx) => {
      await tx.trashPost.create({
        data: {
          originalSlug: post.slug,
          title: post.title,
          summary: post.summary,
          firstModDate: post.firstModDate,
          lastModDate: post.lastModDate,
          wasReleased: post.isReleased,
          minutesToRead: post.minutesToRead,
          tags: post.tags,
          category: post.category,
          mdxText: post.mdxText,
        },
      });

      await tx.post.delete({ where: { slug: post.slug } });
    });

    logger.info("Post moved to trash", { originalSlug });
  }

  public async purgeTrash({ trashId }: { trashId: string }): Promise<void> {
    await this.db.trashPost.delete({ where: { id: trashId } });
  }

  public async restoreFromTrash({
    trashId,
  }: {
    trashId: string;
  }): Promise<void> {
    const trash = await this.db.trashPost.findUnique({
      where: { id: trashId },
    });
    if (!trash) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Trash item not found",
      });
    }

    const exists = await this.db.post.findUnique({
      where: { slug: trash.originalSlug },
    });
    if (exists) {
      throw new AppError({
        code: "CONFLICT",
        message: "A live post already uses this slug",
      });
    }

    await this.db.$transaction(async (tx) => {
      await tx.post.create({
        data: {
          slug: trash.originalSlug,
          title: trash.title,
          summary: trash.summary,
          firstModDate: trash.firstModDate,
          lastModDate: trash.lastModDate,
          isReleased: trash.wasReleased,
          minutesToRead: trash.minutesToRead,
          tags: trash.tags,
          category: trash.category,
          mdxText: trash.mdxText,
        },
      });
      await tx.trashPost.delete({ where: { id: trashId } });
    });
  }

  private _parseMDX({
    content,
  }: {
    content: string;
    slug: string;
  }): fontMatterMdxContentRo {
    const parsed: FrontMatterResult<":"> = fm(content);
    return fontMatterMdxContentSchemaRo.parse(parsed);
  }

  private _slugify(title: string): string {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
}
