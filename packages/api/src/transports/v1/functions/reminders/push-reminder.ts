import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
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
  try {
    if (schedule.kind === "at") {
      const result = await ReminderService.remind({
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
      });

      return {
        status: 201,
        body: {
          created: [{ id: result.id, at: result.at }],
        },
      };
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

      const result = await scheduler
        .headers({
          ...headers,
        })
        .schedule({
          delay: { ...delayObjectNormalizer() },
          url: notifyUrl,
          payload: JSON.stringify(schedule.notification),
        });

      return {
        status: 201,
        body: { created: [{ id: result.messageId, at: schedule.delay.unit }] },
      };
    }
  } catch (error) {
    logger.error("reminder scheduling failed", { error });
    monitor.next.captureException({ error });
    return {
      status: 500,
      body: { code: "INTERNAL_ERROR", message: "Internal error" },
    };
  }
}
