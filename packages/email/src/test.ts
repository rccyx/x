import { env } from "@ashgw/env";
import { send } from "./index";
import { logger } from "@ashgw/logger";

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
          EmailClientResponseMissingId: (e) => {
            logger.error("Failed to send verify email", { error: e });
          },
          EmailClientSendingFailure: (e) => {
            logger.error("Failed to send verify email", { error: e });
          },
          VerifyEmailTemplateRenderingFailure: (e) => {
            logger.error("Failed to send verify email", { error: e });
          },
        },
      }),
    );
  logger.info("Sent verify email");
}

void main();
