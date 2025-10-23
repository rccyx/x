import type { FrontMatterResult } from "front-matter";
import fm from "front-matter";
import { db } from "@ashgw/db";
import { WordCounterService } from "@ashgw/cross-runtime";
import { logger } from "@ashgw/logger";
import type {
  FontMatterMdxContentRo,
  PostCardRo,
  PostArticleRo,
  PostEditorDto,
  TrashPostArticleRo,
} from "../../models";
import { PostMapper } from "../../mappers";
import { fontMatterMdxContentSchemaRo } from "../../models";
import { PostQueryHelper } from "../../query-helpers";
import { err, ok, run, runner, runSync } from "@ashgw/runner";

export class PostService {
  private readonly serviceTag = "PostService";
  public async getPublicPostCards() {
    return runner(
      run(
        () =>
          db.post.findMany({
            where: PostQueryHelper.whereReleasedToPublic(),
            select: { ...PostQueryHelper.cardSelect() },
            orderBy: { firstModDate: "desc" },
          }),
        `${this.serviceTag}DatabaseFailure`,
        {
          severity: "fatal",
          message: "failed to fetch public posts",
        },
      ),
    ).next((posts) =>
      ok<PostCardRo[]>(posts.map((post) => PostMapper.toCardRo({ post }))),
    );
  }

  public async getAllAdminPosts() {
    return runner(
      run(
        () =>
          db.post.findMany({
            include: PostQueryHelper.adminInclude(),
            orderBy: { firstModDate: "desc" },
          }),
        `${this.serviceTag}DatabaseFailure`,
        {
          severity: "fatal",
          message: "failed to fetch admin posts",
        },
      ),
    )
      .next((rawPosts) => {
        if (rawPosts.length === 0) {
          return err({
            severity: "warn",
            message: "no admin posts found",
            tag: `${this.serviceTag}NoAdminPostsFound`,
          });
        }
        return ok(rawPosts);
      })
      .next((rawPosts) =>
        runSync(
          () =>
            rawPosts.map((rawPost) =>
              PostMapper.toArticleRo({
                post: rawPost,
                fontMatterMdxContent: this._parseMDX({
                  content: rawPost.mdxText,
                  slug: rawPost.slug,
                }),
              }),
            ),
          `${this.serviceTag}MDXParsingFailure`,
          {
            severity: "error",
            message: "failed to parse MDX",
          },
        ),
      )
      .next((posts) => ok<PostArticleRo[]>(posts));
  }

  public async getTrashedPosts() {
    return runner(
      run(
        () =>
          db.trashPost.findMany({
            orderBy: { deletedAt: "desc" },
          }),
        `${this.serviceTag}DatabaseFailure`,
        {
          severity: "fatal",
          message: "failed to fetch trashed posts",
        },
      ),
    ).next((trashed) => {
      if (trashed.length === 0)
        return err({
          severity: "warn",
          message: "no trashed posts found",
          tag: `${this.serviceTag}NoTrashedPostsFound`,
        });
      return ok<TrashPostArticleRo[]>(
        trashed.map((post) => PostMapper.toTrashRo({ post })),
      );
    });
  }

  public async getDetailedPublicPost({ slug }: { slug: string }) {
    return runner(
      run(
        () =>
          db.post.findUnique({
            where: { slug, ...PostQueryHelper.whereReleasedToPublic() },
            include: PostQueryHelper.articleInclude(),
          }),
        `${this.serviceTag}DatabaseFailure`,
        {
          severity: "fatal",
          message: "failed to fetch public post",
        },
      ),
    )
      .next((rawPost) => {
        if (!rawPost) {
          return err({
            message: "no post found for the given slug",
            severity: "warn",
            tag: `${this.serviceTag}DetailedPublicPostNotFound`,
          });
        }
        return ok(rawPost);
      })
      .next((rawPost) =>
        runSync(
          () =>
            PostMapper.toArticleRo({
              post: rawPost,
              fontMatterMdxContent: this._parseMDX({
                content: rawPost.mdxText,
                slug: rawPost.slug,
              }),
            }),
          `${this.serviceTag}MDXParsingFailure`,
          {
            severity: "error",
            message: "failed to parse MDX",
          },
        ),
      )
      .next((post) => ok<PostArticleRo>(post));
  }

  public async createPost(data: PostEditorDto) {
    const slug = data.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    return runner(
      run(
        () => db.post.findUnique({ where: { slug } }),
        `${this.serviceTag}DatabaseFailure`,
        {
          severity: "fatal",
          message: "failed to check if post already exists",
        },
      ),
    )
      .next((existingPost) => {
        if (existingPost) {
          return err({
            tag: `${this.serviceTag}PostAlreadyExists`,
            severity: "error",
            message: `a post with slug "${slug}" already exists`,
          });
        }
        return ok();
      })
      .next(() =>
        runSync(
          () => WordCounterService.countMinutesToRead(data.mdxText),
          `${this.serviceTag}WordCountFailure`,
          {
            severity: "error",
            message: "failed to count words",
          },
        ),
      )
      .next((minutesToRead) =>
        run(
          () => {
            const now = new Date();
            return db.post.create({
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
          },
          `${this.serviceTag}DatabaseFailure`,
          {
            severity: "fatal",
            message: "failed to create post",
          },
        ),
      )
      .next((rawPost) =>
        runSync(
          () =>
            PostMapper.toArticleRo({
              post: rawPost,
              fontMatterMdxContent: this._parseMDX({
                content: rawPost.mdxText,
                slug: rawPost.slug,
              }),
            }),
          `${this.serviceTag}MDXParsingFailure`,
          {
            severity: "error",
            message: "failed to parse MDX",
          },
        ),
      )
      .next((post) => ok<PostArticleRo>(post));
  }

  public async updatePost({
    data,
    slug,
  }: {
    slug: string;
    data: PostEditorDto;
  }) {
    return runner(
      run(
        () => db.post.findUnique({ where: { slug } }),
        `${this.serviceTag}DatabaseFailure`,
        {
          severity: "fatal",
          message: "failed to check if post already exists",
        },
      ),
    )
      .next((existingPost) => {
        if (!existingPost) {
          return err({
            severity: "warn",
            message: `post with slug "${slug}" not found`,
            tag: `${this.serviceTag}PostNotFound`,
          });
        }
        return ok(existingPost);
      })
      .next(() =>
        runSync(
          () => WordCounterService.countMinutesToRead(data.mdxText),
          `${this.serviceTag}WordCountFailure`,
          {
            severity: "error",
            message: "failed to count words",
          },
        ),
      )
      .next((minutesToRead) =>
        run(
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
          `${this.serviceTag}DatabaseFailure`,
          {
            severity: "fatal",
            message: "failed to update post",
          },
        ),
      )
      .next((rawPost) =>
        runSync(
          () =>
            PostMapper.toArticleRo({
              post: rawPost,
              fontMatterMdxContent: this._parseMDX({
                content: data.mdxText,
                slug,
              }),
            }),
          `${this.serviceTag}MDXParsingFailure`,
          {
            severity: "error",
            message: "failed to parse MDX",
          },
        ),
      )
      .next((post) => ok<PostArticleRo>(post));
  }

  public async trashPost({ originalSlug }: { originalSlug: string }) {
    return runner(
      run(
        () => db.post.findUnique({ where: { slug: originalSlug } }),
        `${this.serviceTag}DatabaseFailure`,
        {
          severity: "fatal",
          message: "failed to check if post exists",
        },
      ),
    )
      .next((post) => {
        if (!post) {
          return err({
            severity: "warn",
            message: `post with slug "${originalSlug}" not found`,
            tag: `${this.serviceTag}PostNotFound`,
          });
        }
        return ok(post);
      })
      .next((post) =>
        run(
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
          `${this.serviceTag}DatabaseFailure`,
          {
            severity: "fatal",
            message: "failed to trash post",
          },
        ),
      )
      .next(() => {
        logger.info("post moved to trash", { originalSlug });
        return ok();
      });
  }

  public async purgeTrashPost({ trashId }: { trashId: string }) {
    return runner(
      run(
        () => db.trashPost.delete({ where: { id: trashId } }),
        `${this.serviceTag}DatabaseFailure`,
        {
          severity: "fatal",
          message: "failed to purge trash post",
        },
      ),
    ).next(() => {
      logger.info("trash post purged", { trashId });
      return ok();
    });
  }

  public async purgeTrash() {
    return runner(
      run(
        () => db.trashPost.deleteMany(),
        `${this.serviceTag}DatabaseFailure`,
        {
          severity: "fatal",
          message: "failed to purge trash posts",
        },
      ),
    ).next(() => {
      logger.info("trash posts purged");
      return ok();
    });
  }

  public async restoreFromTrash({ trashId }: { trashId: string }) {
    return runner(
      run(
        () => db.trashPost.findUnique({ where: { id: trashId } }),
        `${this.serviceTag}DatabaseFailure`,
        {
          severity: "fatal",
          message: "failed to find trash post",
        },
      ),
    )
      .next((trash) => {
        if (!trash) {
          return err({
            severity: "warn",
            message: `trash post with id "${trashId}" not found`,
            tag: `${this.serviceTag}TrashPostNotFound`,
          });
        }
        return ok(trash);
      })
      .next((trash) =>
        run(
          () => db.post.findUnique({ where: { slug: trash.originalSlug } }),
          `${this.serviceTag}DatabaseFailure`,
          {
            severity: "fatal",
            message: "failed to check if post already exists",
          },
        ),
      )
      .nextAcc((exists, _, __) => {
        if (exists) {
          return err({
            severity: "error",
            message: `a live post with slug "${exists.originalSlug}" already exists`,
            tag: `${this.serviceTag}PostAlreadyExists`,
          });
        }
        return ok();
      })
      .nextAcc((_, trash, __) =>
        run(
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
          `${this.serviceTag}DatabaseFailure`,
          {
            severity: "fatal",
            message: "failed to restore from trash",
          },
        ),
      )
      .next(() => {
        logger.info("post restored from trash", { trashId });
        return ok();
      });
  }

  private _parseMDX({
    content,
  }: {
    content: string;
    slug: string;
  }): FontMatterMdxContentRo {
    const parsed: FrontMatterResult<":"> = fm(content);
    return fontMatterMdxContentSchemaRo.parse(parsed);
  }
}
