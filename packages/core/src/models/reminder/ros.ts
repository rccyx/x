import { z } from "zod";
import { isoDateTimeSchema } from "./shared";

export const reminderSendEmailNotificationSchemaRo = z.object({
  id: z.string().min(1).max(255),
  at: isoDateTimeSchema.optional(),
});

export type ReminderSendEmailNotificationSchemaRo = z.infer<
  typeof reminderSendEmailNotificationSchemaRo
>;
