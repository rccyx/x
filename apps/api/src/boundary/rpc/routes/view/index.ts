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
    .mutation(
      async ({
        input: { slug },
        ctx: {
          req: { headers },
        },
      }) => {
        const ipAddress =
          headers.get("x-forwarded-for") ??
          headers.get("x-real-ip") ??
          "127.0.0.1";
        const userAgent = headers.get("user-agent") ?? "unknown";
        return new ViewService()
          .trackView({
            slug,
            ipAddress,
            userAgent,
          })
          .then((r) => r.unwrap());
      },
    ),
});
