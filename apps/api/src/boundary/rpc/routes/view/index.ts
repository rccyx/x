import { fingerprint } from "@rccyx/security";
import { publicProcedure } from "../../../../adapters/trpc/procedures";
import { router } from "../../../../adapters/trpc/root";
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
    .mutation(async ({ input: { slug }, ctx: { req } }) => {
      return new ViewService()
        .trackView({
          slug,
          uniqueViewerHash: fingerprint(req).hash,
        })
        .then((r) => r.unwrap());
    }),
});
