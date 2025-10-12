import { emailNotificationCreateSchemaDto } from "../../models";
import type { z } from "zod";

export const reminderEmailNotificationSchemaRequest =
  emailNotificationCreateSchemaDto.omit({
    to: true,
    subject: true,
  });

export type ReminderEmailNotificationSchemaRequest = z.infer<
  typeof reminderEmailNotificationSchemaRequest
>;
