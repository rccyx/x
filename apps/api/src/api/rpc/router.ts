import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { router } from "../trpc/root";
import { newsletterRouter, postRouter, userRouter, viewRouter } from "./routes";

export const appRouter = router({
  post: postRouter,
  newsletter: newsletterRouter,
  user: userRouter,
  view: viewRouter,
});

export type AppRouter = typeof appRouter;

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
