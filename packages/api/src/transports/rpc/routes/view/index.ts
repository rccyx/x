import { publicProcedure } from "../../../../trpc/procedures";
import { router } from "../../../../trpc/root";
import { trackViewSchemaRo, trackViewSchemaDto } from "../../models";
import { ViewService } from "../../services";

export const viewRouter = router({
  trackView: publicProcedure({
    limiter: {
      hits: 5,
      every: "10s",
    },
  })
    .input(trackViewSchemaDto)
    .output(trackViewSchemaRo)
    .mutation(
      async ({
        input: { slug },
        ctx: {
          req: { headers },
        },
      }) => {
        return await new ViewService({
          requestHeaders: headers,
        }).trackView({ slug });
      },
    ),
});
