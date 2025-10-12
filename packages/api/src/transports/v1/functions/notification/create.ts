import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import type {
  NotificationCreateBodyRequest,
  NotificationCreateResponses,
} from "../../models";
import { env } from "@ashgw/env";
import { NotificationService } from "@ashgw/core/services";

export async function create(input: {
  body: NotificationCreateBodyRequest;
}): Promise<NotificationCreateResponses> {
  logger.info("Sending email notification...");

  try {
    await NotificationService.email.sendNotification({
      body: {
        to: input.body.to ?? env.PERSONAL_EMAIL,
        type: input.body.type,
        message: input.body.message,
        subject: input.body.subject ?? input.body.title,
        title: input.body.title,
      },
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
