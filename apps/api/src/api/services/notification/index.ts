import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import type { NotificationCreateResponses } from "~/api/models";
import { send } from "@ashgw/email";
import type { NotificationCreateBodyDto } from "~/api/models/notification";
import { env } from "@ashgw/env";

export class NotificationService {
  public static async create(input: {
    body: NotificationCreateBodyDto;
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
}
