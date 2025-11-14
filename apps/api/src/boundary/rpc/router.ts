import { router } from "../../adapters/trpc/root";
import { newsletterRouter, postRouter, userRouter, viewRouter } from "./routes";

export const appRouter = router({
  post: postRouter,
  newsletter: newsletterRouter,
  user: userRouter,
  view: viewRouter,
});

export type AppRouter = typeof appRouter;
