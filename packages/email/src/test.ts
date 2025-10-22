import { observer } from "@ashgw/runner";
import { logger } from "@ashgw/logger";
import { env } from "@ashgw/env";
import { send } from "./index";

observer((err) => {
  logger.error(err.message, {
    tag: err.tag,
    meta: err.meta,
    cause: err.cause,
  });
});

async function main(): Promise<void> {
  await send.auth
    .verifyEmail({
      to: env.PERSONAL_EMAIL,
      verifyUrl: `https://example.com/verify?token=example`,
      userName: "John Doe",
    })
    .then((r) =>
      r.match({
        ok: (v) => logger.info("Sent verify email", { id: v.id }),
        err: {
          EmailClientApiResponseFailure: (_e) => {
            // noop
          },
          EmailClientApiSendingFailure: (_e) => {
            // noop
          },
          VerifyEmailTemplateRenderingFailure: (_e) => {
            // noop
          },
        },
      }),
    )
    .catch((e) => logger.error("error", e));
}

void main();
