import { logger } from "@ashgw/logger";
import type {
  NotificationsPushEmailNotifBodyRequest,
  NotificationsPushEmailNotifHandlerResponses,
} from "../../models";
import { env } from "@ashgw/env";
import { NotificationService } from "@ashgw/core/services";

function error(message: string): NotificationsPushEmailNotifHandlerResponses {
  return {
    status: 500,
    body: {
      code: "INTERNAL_ERROR",
      message: message,
    },
  } as const;
}

export async function pushEmailNotif(input: {
  body: NotificationsPushEmailNotifBodyRequest;
}): Promise<NotificationsPushEmailNotifHandlerResponses> {
  logger.info("Sending reminder email notification...");
  return await NotificationService.email
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
          EmailClientApiResponseFailure: (e) => {
            return error(e.message);
          },
          EmailClientApiSendingFailure: (e) => {
            return error(e.message);
          },
          NotificationTemplateRenderingFailure: (e) => {
            return error(e.message);
          },
        },
      }),
    );
}
