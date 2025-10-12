import type { FrontMatterResult } from "front-matter";
import type { Optional } from "ts-roids";
import fm from "front-matter";
import { db } from "@ashgw/db";
import { WordCounterService } from "@ashgw/cross-runtime";
import { E, throwable } from "@ashgw/error";
import { logger } from "@ashgw/logger";
import type {
  fontMatterMdxContentRo,
  PostCardRo,
  PostArticleRo,
  PostEditorDto,
  TrashPostArticleRo,
} from "../../models";
import { PostMapper } from "../../mappers";
import { fontMatterMdxContentSchemaRo } from "../../models";
import { PostQueryHelper } from "../../query-helpers";

export class PostService {
  public async getPublicPostCards(): Promise<PostCardRo[]> {
    const posts = await throwable(
      () =>
        db.post.findMany({
          where: PostQueryHelper.whereReleasedToPublic(),
          select: { ...PostQueryHelper.cardSelect() },
          orderBy: { firstModDate: "desc" },
        }),
      {
        service: "db",
        operation: "post.findMany",
        message: "failed to fetch public posts",
      },
    );

    return posts.map((post) => PostMapper.toCardRo({ post }));
  }

  public async getAllAdminPosts(): Promise<PostArticleRo[]> {
    const posts = await throwable(
      () =>
        db.post.findMany({
          include: PostQueryHelper.adminInclude(),
          orderBy: { firstModDate: "desc" },
        }),
      {
        service: "db",
        operation: "post.findMany",
        message: "failed to fetch admin posts",
      },
    );

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
    const trashed = await throwable(
      () =>
        db.trashPost.findMany({
          orderBy: { deletedAt: "desc" },
        }),
      {
        service: "db",
        operation: "trashPost.findMany",
        message: "failed to fetch trashed posts",
        onError: (e) =>
          logger.error("failed to fetch trashed posts", {
            errMessage: e.message,
          }),
      },
    );

    if (trashed.length === 0) return [];
    return trashed.map((t) => PostMapper.toTrashRo({ post: t }));
  }

  public async getDetailedPublicPost({
    slug,
  }: {
    slug: string;
  }): Promise<Optional<PostArticleRo>> {
    const post = await throwable(
      () =>
        db.post.findUnique({
          where: { slug, ...PostQueryHelper.whereReleasedToPublic() },
          include: PostQueryHelper.articleInclude(),
        }),
      {
        service: "db",
        operation: "post.findUnique",
        message: "failed to fetch detailed public post",
      },
    );

    if (!post) return null;

    return PostMapper.toArticleRo({
      post,
      fontMatterMdxContent: this._parseMDX({ content: post.mdxText, slug }),
    });
  }

  public async createPost(data: PostEditorDto): Promise<PostArticleRo> {
    const slug = this._slugify(data.title);

    const existingPost = await throwable(
      () => db.post.findUnique({ where: { slug } }),
      {
        service: "db",
        operation: "post.findUnique",
        message: "failed to check if post already exists with the slug",
      },
    );

    if (existingPost)
      throw E.conflict(`a post with slug "${slug}" already exists`);

    const now = new Date();
    const minutesToRead = WordCounterService.countMinutesToRead(data.mdxText);

    const post = await throwable(
      () =>
        db.post.create({
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
        }),
      {
        service: "db",
        operation: "post.create",
        message: `failed to create post with slug: ${slug}`,
      },
    );

    return PostMapper.toArticleRo({
      post,
      fontMatterMdxContent: this._parseMDX({ content: data.mdxText, slug }),
    });
  }

  public async updatePost({
    data,
    slug,
  }: {
    slug: string;
    data: PostEditorDto;
  }): Promise<PostArticleRo> {
    const existingPost = await db.post.findUnique({
      where: { slug },
      select: { slug: true },
    });
    if (!existingPost) throw E.notFound(`post with slug "${slug}" not found`);

    const minutesToRead = WordCounterService.countMinutesToRead(data.mdxText);

    const post = await throwable(
      () =>
        db.post.update({
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
        }),
      {
        service: "db",
        operation: "post.update",
        message: `failed to update ${data.title}`,
      },
    );

    return PostMapper.toArticleRo({
      post,
      fontMatterMdxContent: this._parseMDX({ content: data.mdxText, slug }),
    });
  }

  public async trashPost({
    originalSlug,
  }: {
    originalSlug: string;
  }): Promise<void> {
    const post = await db.post.findUnique({ where: { slug: originalSlug } });
    if (!post) throw E.notFound(`post with slug "${originalSlug}" not found`);

    await throwable(
      () =>
        db.$transaction(async (tx) => {
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
        }),
      {
        service: "db",
        operation: "transaction.trashPost",
        message: `failed to move ${post.title} to trash`,
      },
    );

    logger.info("post moved to trash", { originalSlug });
  }

  public async purgeTrashPost({ trashId }: { trashId: string }): Promise<void> {
    await throwable(() => db.trashPost.delete({ where: { id: trashId } }), {
      service: "db",
      operation: "trashPost.delete",
      message: "failed to purge trashed post",
    });
  }

  public async purgeTrash(): Promise<void> {
    await throwable(() => db.trashPost.deleteMany(), {
      service: "db",
      operation: "trashPost.deleteMany",
      message: "failed to purge all trashed posts",
    });
  }

  public async restoreFromTrash({
    trashId,
  }: {
    trashId: string;
  }): Promise<void> {
    const trash = await db.trashPost.findUnique({ where: { id: trashId } });
    if (!trash) throw E.notFound("trash item not found");

    const exists = await db.post.findUnique({
      where: { slug: trash.originalSlug },
    });
    if (exists)
      throw E.conflict(
        `a live post with slug "${trash.originalSlug}" already exists`,
      );

    await throwable(
      () =>
        db.$transaction(async (tx) => {
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
        }),
      {
        service: "db",
        operation: "transaction.restorePost",
        message: "failed to restore post from trash",
      },
    );
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
