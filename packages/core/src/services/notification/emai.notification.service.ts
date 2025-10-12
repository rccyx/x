import { send } from "@ashgw/email";
import type { EmailNotificationCreateSchemaDto } from "../../models/notification";
import { logger } from "@ashgw/logger";

export class EmailNotificationService {
  public static async create(input: {
    body: EmailNotificationCreateSchemaDto;
  }): Promise<void> {
    logger.info("Sending email notification...");
    await send.notification.notify({
      to: input.body.to,
      title: input.body.title,
      subject: input.body.subject,
      type: input.body.type,
      messageMd: input.body.message,
    });
    logger.info("Email notification sent successfully");
  }
}
