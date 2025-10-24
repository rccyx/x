import { z } from "zod";

export const reminderSendEmailNotificationSchemaRo = z.object({
  id: z.string().min(1).max(255),
});

export type ReminderSendEmailNotificationRo = z.infer<
  typeof reminderSendEmailNotificationSchemaRo
>;
