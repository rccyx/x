import { scheduler } from "@ashgw/scheduler";
import type {
  ReminderSendEmailNotificationRo,
  ReminderSendEmailNotificationSchemaDto,
} from "../../models";
import { ok, runner } from "@ashgw/runner";

async function remind({
  headers,
  schedule,
  url,
}: ReminderSendEmailNotificationSchemaDto) {
  if (schedule.kind === "at") {
    return runner(
      scheduler
        .headers({
          ...headers,
        })
        .schedule({
          at: {
            datetimeIso: schedule.at,
          },
          url,
          payload: JSON.stringify(schedule.emailNotification),
        }),
    ).next(() =>
      ok<ReminderSendEmailNotificationRo>({
        at: schedule.at,
        type: "date",
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

    return runner(
      scheduler
        .headers({
          ...headers,
        })
        .schedule({
          delay: { ...delayObjectNormalizer() },
          url,
          payload: JSON.stringify(schedule.emailNotification),
        }),
    ).next(() =>
      ok<ReminderSendEmailNotificationRo>({
        type: "delay",
        unit: schedule.delay.unit,
        value: schedule.delay.value,
      }),
    );
  }
}

export const ReminderService = {
  remind,
};
