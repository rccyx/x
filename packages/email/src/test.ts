import { env } from "@ashgw/env";
import { send } from "./index";
import { logger } from "@ashgw/logger";

async function main(): Promise<void> {
  await send.auth.verifyEmail({
    to: env.PERSONAL_EMAIL,
    verifyUrl: `https://example.com/verify?token=example`,
    userName: "John Doe",
  });
  logger.info("Sent verify email");
}

void main();
