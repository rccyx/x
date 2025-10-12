import { publicProcedure } from "~/trpc/procedures";
import { router } from "~/trpc/root";
import {
  trackViewSchemaRo,
  trackViewSchemaDto,
} from "~/api/transports/rpc/models";
import { ViewService } from "~/api/transports/rpc/services";

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
