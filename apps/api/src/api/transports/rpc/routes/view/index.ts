import { publicProcedure } from "~/api/trpc/procedures";
import { router } from "~/api/trpc/root";
import { trackViewSchemaRo, trackViewSchemaDto } from "~/api/core/models";
import { ViewService } from "~/api/core/services";

export const viewRouter = router({
  trackView: publicProcedure({
    limiter: {
      hits: 5,
      every: "10s",
    },
  })
    .input(trackViewSchemaDto)
    .output(trackViewSchemaRo)
    .mutation(async ({ input: { slug }, ctx: { db, req } }) => {
      return await new ViewService({
        db,
        req,
      }).trackView({ slug });
    }),
});
