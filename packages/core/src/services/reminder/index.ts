import { scheduler } from "@ashgw/scheduler";
import type {
  ReminderSendEmailNotificationSchemaRo,
  ReminderSendEmailNotificationSchemaDto,
} from "../../models";

async function remind({
  headers,
  schedule,
  url,
}: ReminderSendEmailNotificationSchemaDto): Promise<ReminderSendEmailNotificationSchemaRo> {
  if (schedule.kind === "at") {
    const result = await scheduler
      .headers({
        ...headers,
      })
      .schedule({
        at: {
          datetimeIso: schedule.at,
        },
        url,
        payload: JSON.stringify(schedule.emailNotification),
      });
    return [{ id: result.messageId, at: schedule.at }];

    // delay
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
        url,
        payload: JSON.stringify(schedule.emailNotification),
      });
    return [{ id: result.messageId, at: schedule.delay.unit }];
  }
}

export const ReminderService = {
  remind,
};
