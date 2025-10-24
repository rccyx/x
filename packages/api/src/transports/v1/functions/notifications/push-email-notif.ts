import { logger } from "@ashgw/logger";
import type {
  NotificationsPushEmailNotifBodyRequest,
  NotificationsPushEmailNotifHandlerResponses,
} from "../../models";
import { env } from "@ashgw/env";
import { NotificationService } from "@ashgw/core/services";

export async function pushEmailNotif(input: {
  body: NotificationsPushEmailNotifBodyRequest;
}): Promise<NotificationsPushEmailNotifHandlerResponses> {
  logger.info("Sending reminder email notification...");
  return NotificationService.email
    .sendNotification({
      body: {
        to: input.body.to ?? env.PERSONAL_EMAIL,
        type: "reminder",
        message: input.body.message,
        subject: input.body.subject ?? input.body.title,
        title: input.body.title,
      },
    })
    .then((r) =>
      r.match({
        ok: () => {
          logger.info("Reminder email notification sent successfully");
          return {
            status: 200,
            body: undefined,
          } as const;
        },
        err: {
          EmailClientApiResponseFailure: ({ message }) => {
            return {
              status: 502,
              body: {
                message,
              },
            } as const;
          },
          EmailClientApiSendingFailure: ({ message }) => {
            return {
              status: 500,
              body: {
                message,
              },
            } as const;
          },
          NotificationTemplateRenderingFailure: ({ message }) => {
            return {
              status: 500,
              body: {
                message,
              },
            } as const;
          },
        },
      }),
    );
}
