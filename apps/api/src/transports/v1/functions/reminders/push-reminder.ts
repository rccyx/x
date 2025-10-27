import { env } from "@ashgw/env";
import { root } from "../../../../root-uris";
import type {
  RemindersPushReminderHandlerResponses,
  RemindersPushReminderBodyRequest,
  RemindersPushReminderHeadersRequest,
} from "../../models";
import { scheduler } from "@ashgw/scheduler";
import { v1 } from "../../uris";
import { ReminderService } from "@ashgw/core/services";

const notifyUrl = env.NEXT_PUBLIC_WWW_URL + root.v1 + v1.notifications;

export async function pushReminder({
  body: { schedule },
  headers,
}: {
  body: RemindersPushReminderBodyRequest;
  headers: RemindersPushReminderHeadersRequest;
}): Promise<RemindersPushReminderHandlerResponses> {
  if (schedule.kind === "at") {
    return ReminderService.remind({
      headers: {
        ...headers,
      },
      schedule: {
        kind: "at",
        at: schedule.at,
        emailNotification: {
          message: schedule.notification.message,
          title: schedule.notification.title,
          type: "reminder",
        },
      },
      url: notifyUrl,
    }).then((r) =>
      r.match({
        ok: (v) => ({
          status: 201,
          body: {
            created: { id: v.id, at: schedule.at, type: "at" },
          },
        }),
        err: {
          SchedulerServiceExternalApiPublishFailure: (e) => {
            return {
              status: 502,
              body: {
                message: e.message,
              },
            } as const;
          },
        },
      }),
    );
  } else {
    const delayObjectNormalizer = () => {
      const value = schedule.delay.value;
      const unitMap = {
        days: { days: value },
        hours: { hours: value },
        minutes: { minutes: value },
        seconds: { seconds: value },
      } as const;

      return unitMap[schedule.delay.unit];
    };

    return scheduler
      .headers({
        ...headers,
      })
      .schedule({
        delay: { ...delayObjectNormalizer() },
        url: notifyUrl,
        payload: JSON.stringify(schedule.notification),
      })
      .then((r) =>
        r.match({
          ok: (v) => ({
            status: 201,
            body: {
              created: {
                type: "delay",
                delay: schedule.delay.value,
                id: v.messageId,
              },
            },
          }),
          err: {
            SchedulerServiceExternalApiPublishFailure: (e) => {
              return {
                status: 502,
                body: {
                  message: e.message,
                },
              } as const;
            },
          },
        }),
      );
  }
}
