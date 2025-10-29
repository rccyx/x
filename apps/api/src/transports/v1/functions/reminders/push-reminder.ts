import { env } from "@ashgw/env";
import { root } from "../../../../root-uris";
import type {
  RemindersPushReminderHandlerResponses,
  RemindersPushReminderBodyRequest,
  RemindersPushReminderHeadersRequest,
} from "../../models";
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
    return ReminderService.remind({
      headers: {
        ...headers,
      },
      url: notifyUrl,
      schedule: {
        kind: "delay",
        delay: {
          value: schedule.delay.value,
          unit: schedule.delay.unit,
        },
        emailNotification: {
          message: schedule.notification.message,
          title: schedule.notification.title,
          type: "reminder",
        },
      },
    }).then((r) =>
      r.match({
        ok: (v) => ({
          status: 201,
          body: {
            created: { id: v.id, delay: schedule.delay, type: "delay" },
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
