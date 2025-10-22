import { z } from "zod";
import { isoDateTimeSchema } from "./shared";

const delaySchemaRo = z.object({
  type: z.literal("delay"),
  unit: z.enum(["seconds", "minutes", "hours", "days"]),
  value: z.number().nonnegative(),
});

const dateSchemaRo = z.object({
  type: z.literal("date"),
  at: isoDateTimeSchema,
});

export const reminderSendEmailNotificationSchemaRo = z.discriminatedUnion(
  "type",
  [delaySchemaRo, dateSchemaRo],
);

export type ReminderSendEmailNotificationRo = z.infer<
  typeof reminderSendEmailNotificationSchemaRo
>;
