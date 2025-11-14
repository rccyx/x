import type {
  NotificationsPushEmailNotifBodyRequest,
  NotificationsPushEmailNotifHandlerResponses,
} from "../../models";
import { NotificationService } from "@rccyx/core/services";

export async function pushEmailNotif(input: {
  body: NotificationsPushEmailNotifBodyRequest;
}): Promise<NotificationsPushEmailNotifHandlerResponses> {
  return NotificationService.email
    .sendNotification({
      body: {
        to: input.body.to,
        type: "reminder",
        message: input.body.message,
        subject: input.body.subject,
        title: input.body.title,
      },
    })
    .then((r) =>
      r.match({
        ok: () => {
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
