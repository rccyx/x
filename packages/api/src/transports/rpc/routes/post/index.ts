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
import { BlogService } from "../../services";

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
      const blogService = new BlogService();
      return await blogService.getDetailedPublicPost({ slug });
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
      const blogService = new BlogService();
      return await blogService.getPublicPostCards();
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
      const blogService = new BlogService();
      return await blogService.getAllAdminPosts();
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
      const blogService = new BlogService();
      return await blogService.createPost(input);
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
      const blogService = new BlogService();
      return await blogService.updatePost({ slug, data });
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
      const blogService = new BlogService();
      await blogService.trashPost({ originalSlug: slug });
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
      const blogService = new BlogService();
      return await blogService.getTrashedPosts();
    }),

  purgeTrash: adminProcedure({
    limiter: {
      hits: 3,
      every: "10s",
    },
  })
    .input(z.object({ trashId: z.string().min(1) }))
    .output(z.void())
    .mutation(async ({ input: { trashId } }) => {
      const blogService = new BlogService();
      await blogService.purgeTrash({ trashId });
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
      const blogService = new BlogService();
      await blogService.restoreFromTrash({ trashId });
    }),
});
