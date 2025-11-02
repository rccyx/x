import { observer } from "@rccyx/runner";
import { logger } from "@rccyx/logger";
import { send } from "./index";
import { email } from "@rccyx/constants";

function sendInstantCall() {
  // noop
}

observer((err) => {
  if (err.meta?.severity === "warn") {
    logger.warn(err.message, {
      tag: err.tag,
      meta: err.meta,
      cause: err.cause,
    });
    return;
  } else if (err.meta?.severity === "fatal") {
    logger.fatal(err.message, {
      tag: err.tag,
      meta: err.meta,
      cause: err.cause,
    });
    sendInstantCall();
    return;
  }
  logger.error(err.message, { tag: err.tag, meta: err.meta, cause: err.cause });
});

async function main(): Promise<void> {
  await send.auth
    .verifyEmail({
      to: email.personal.address,
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
