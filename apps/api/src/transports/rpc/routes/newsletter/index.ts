import { z } from "zod";

import { publicProcedure } from "~/trpc/procedures";
import { router } from "~/trpc/root";
import { newsletterSubscribeDtoSchema } from "../../models";
import { NewsletterService } from "../../services";

export const newsletterRouter = router({
  subscribe: publicProcedure({
    limiter: {
      hits: 3,
      every: "10s",
    },
  })
    .input(newsletterSubscribeDtoSchema)
    .output(z.void())
    .mutation(async ({ input }) => {
      return NewsletterService.subscribe({
        email: input.email,
      }).then((r) => r.unwrap());
    }),
});
