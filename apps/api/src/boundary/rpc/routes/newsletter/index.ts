import { z } from "zod";

import { publicProcedure } from "../../../../adapters/trpc/procedures";
import { router } from "../../../../adapters/trpc/root";
import { newsletterSubscribeSchemaDto } from "../../models";
import { NewsletterService } from "../../services";

export const newsletterRouter = router({
  subscribe: publicProcedure({
    limiter: {
      hits: 3,
      every: "10s",
    },
  })
    .input(newsletterSubscribeSchemaDto)
    .output(z.void())
    .mutation(async ({ input: { email } }) => {
      return await new NewsletterService()
        .subscribe({ email })
        .then((r) => r.unwrap());
    }),
});
