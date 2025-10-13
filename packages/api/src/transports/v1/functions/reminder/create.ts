import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import { env } from "@ashgw/env";
import { rootUri } from "../../../../uri";
import type {
  ReminderCreateBodyRequest,
  ReminderCreateResponses,
  ReminderMessageCreatedRo,
  ReminderCreateHeadersRequest,
} from "../../models";
import { scheduler } from "@ashgw/scheduler";
import { v1endpoints } from "../../endpoints";
import { ReminderService } from "@ashgw/core/services";

export async function create({
  body: { schedule },
  headers,
}: {
  body: ReminderCreateBodyRequest;
  headers: ReminderCreateHeadersRequest;
}): Promise<ReminderCreateResponses> {
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
        url: env.NEXT_PUBLIC_WWW_URL + rootUri.v1 + v1endpoints.notification,
      });

      return {
        status: 201,
        body: {
          created: [{ id: result.id, at: result.at }],
        },
      };
    }

    if (schedule.kind === "multiAt") {
      const created: ReminderMessageCreatedRo[] = [];
      for (const item of schedule.notifications) {
        const result = await scheduler
          .headers({
            ...headers,
          })
          .schedule({
            at: {
              datetimeIso: item.at,
            },
            url: notifyUrl,
            payload: JSON.stringify(item.notification),
          });

        created.push({ kind: "message", id: result.messageId, at: item.at });
      }

      return { status: 201, body: { created } };
    }

    if (schedule.kind === "delay") {
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
        body: { created: [{ kind: "message", id: result.messageId }] },
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
