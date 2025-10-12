import { z } from "zod";
import { isoDateTimeSchema } from "./shared";

export const reminderCreatedSchemaRo = z.object({
  kind: z.enum(["message", "schedule"]),
  id: z.string().min(1).max(255),
  at: isoDateTimeSchema.optional(),
});

export type ReminderCreatedRo = z.infer<typeof reminderCreatedSchemaRo>;
