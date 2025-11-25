import { send } from "@rccyx/email";
import type { EmailNotificationCreateDto } from "../../models/notification";

export class EmailNotificationService {
  public static async sendNotification(input: {
    body: EmailNotificationCreateDto;
  }) {
    return send.notification.notify({
      to: input.body.to,
      title: input.body.title,
      subject: input.body.subject,
      type: input.body.type,
      messageMd: input.body.message,
    });
  }
}
