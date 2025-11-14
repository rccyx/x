import { z } from "zod";

import { publicProcedure } from "../../../../adapters/trpc/procedures";
import { router } from "../../../../adapters/trpc/root";
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
    .mutation(async ({ input: { email } }) => {
      return await new NewsletterService()
        .subscribe({ email })
        .then((r) => r.unwrap());
    }),
});
