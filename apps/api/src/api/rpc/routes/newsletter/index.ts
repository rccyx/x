import { z } from "zod";

import { publicProcedure } from "~/trpc/procedures";
import { router } from "~/trpc/root";
import { newsletterSubscribeDtoSchema } from "~/api/models";
import { NewsletterService } from "~/api/services";

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
      return await NewsletterService.subscribe({
        email: input.email,
      });
    }),
});
