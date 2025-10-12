import { send } from "@ashgw/email";
import type { EmailNotificationCreateSchemaDto } from "../../models/notification";

export class EmailNotificationService {
  public static async sendNotification(input: {
    body: EmailNotificationCreateSchemaDto;
  }): Promise<void> {
    await send.notification.notify({
      to: input.body.to,
      title: input.body.title,
      subject: input.body.subject,
      type: input.body.type,
      messageMd: input.body.message,
    });
  }
}
