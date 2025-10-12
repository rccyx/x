import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import type {
  NotificationCreateBodyRequest,
  NotificationCreateResponses,
} from "~/transports/v1/models";
import { send } from "@ashgw/email";
import { env } from "@ashgw/env";

export async function create(input: {
  body: NotificationCreateBodyRequest;
}): Promise<NotificationCreateResponses> {
  logger.info("Sending email notification...");

  try {
    await send.notification.notify({
      to: input.body.to ?? env.PERSONAL_EMAIL,
      title: input.body.title,
      subject: input.body.subject,
      type: input.body.type,
      messageMd: input.body.message,
    });

    logger.info("Email notification sent successfully");
    return { status: 200, body: undefined };
  } catch (error) {
    monitor.next.captureException({ error });
    logger.error("Failed to send notification", { error });
    return {
      status: 500,
      body: {
        code: "INTERNAL_ERROR",
        message: "Oops! Looks like it's on me this time",
      },
    };
  }
}
