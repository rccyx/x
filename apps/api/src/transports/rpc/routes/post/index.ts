import { z } from "zod";
import { adminProcedure, publicProcedure } from "../../../../trpc/procedures";
import { router } from "../../../../trpc/root";
import {
  postCardSchemaRo,
  postDeleteSchemaDto,
  postArticleSchemaRo,
  postEditorSchemaDto,
  postGetSchemaDto,
  postUpdateSchemaDto,
  trashPostArticleSchemaRo,
} from "../../models";
import { PostService } from "../../services";

export const postRouter = router({
  getDetailedPublicPost: publicProcedure({
    limiter: {
      hits: 7,
      every: "10s",
    },
  })
    .input(postGetSchemaDto)
    .output(postArticleSchemaRo.nullable())
    .query(async ({ input: { slug } }) => {
      return new PostService()
        .getDetailedPublicPost({ slug })
        .then((r) => r.unwrap());
    }),

  getPublicPostCards: publicProcedure({
    limiter: {
      hits: 7,
      every: "10s",
    },
  })
    .input(z.void())
    .output(z.array(postCardSchemaRo))
    .query(async () => {
      return new PostService().getPublicPostCards().then((r) => r.unwrap());
    }),

  getAllAdminPosts: adminProcedure({
    limiter: {
      hits: 5,
      every: "12s",
    },
  })
    .input(z.void())
    .output(z.array(postArticleSchemaRo))
    .query(async () => {
      return new PostService().getAllAdminPosts().then((r) => r.unwrap());
    }),

  createPost: adminProcedure({
    limiter: {
      hits: 2,
      every: "30s",
    },
  })
    .input(postEditorSchemaDto)
    .output(postArticleSchemaRo)
    .mutation(async ({ input }) => {
      return new PostService().createPost(input).then((r) => r.unwrap());
    }),

  updatePost: adminProcedure({
    limiter: {
      hits: 2,
      every: "30s",
    },
  })
    .input(postUpdateSchemaDto)
    .output(postArticleSchemaRo)
    .mutation(async ({ input: { data, slug } }) => {
      return new PostService()
        .updatePost({ slug, data })
        .then((r) => r.unwrap());
    }),

  trashPost: adminProcedure({
    limiter: {
      hits: 2,
      every: "30s",
    },
  })
    .input(postDeleteSchemaDto)
    .output(z.void())
    .mutation(async ({ input: { slug } }) => {
      return new PostService()
        .trashPost({ originalSlug: slug })
        .then((r) => r.unwrap());
    }),

  getTrashedPosts: adminProcedure({
    limiter: {
      hits: 5,
      every: "10s",
    },
  })
    .input(z.void())
    .output(z.array(trashPostArticleSchemaRo))
    .query(async () => {
      return new PostService().getTrashedPosts().then((r) => r.unwrap());
    }),

  purgeTrashPost: adminProcedure({
    limiter: {
      hits: 3,
      every: "10s",
    },
  })
    .input(z.object({ trashId: z.string().min(1) }))
    .output(z.void())
    .mutation(async ({ input: { trashId } }) => {
      return new PostService()
        .purgeTrashPost({ trashId })
        .then((r) => r.unwrap());
    }),

  restoreFromTrash: adminProcedure({
    limiter: {
      hits: 5,
      every: "10s",
    },
  })
    .input(z.object({ trashId: z.string().min(1) }))
    .output(z.void())
    .mutation(async ({ input: { trashId } }) => {
      return new PostService()
        .restoreFromTrash({ trashId })
        .then((r) => r.unwrap());
    }),
});
