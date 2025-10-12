import { scheduler } from "@ashgw/scheduler";

async function remindMultiAt() {
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
}

async function remindAt() {
  const result = await scheduler
    .headers({
      ...headers,
    })
    .schedule({
      at: {
        datetimeIso: schedule.at,
      },
      payload: JSON.stringify(schedule.notification),
      url: notifyUrl,
    });
  return result;
}

async function remindDelay() {
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
  return result;
}

export const ReminderService = {
  remindMultiAt,
  remindAt,
  remindDelay,
};
