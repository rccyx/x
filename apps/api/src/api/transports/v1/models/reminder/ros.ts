import { z } from "zod";
import { isoDateTimeSchema } from "./shared";

export const reminderMessageCreatedSchemaRo = z
  .object({
    kind: z.enum(["message", "schedule"]),
    id: z.string().min(1).max(255),
    at: isoDateTimeSchema.optional(),
  })
  .describe(
    "The reminder message or schedule created successfully by the upstream service.",
  );

export type ReminderMessageCreatedRo = z.infer<
  typeof reminderMessageCreatedSchemaRo
>;
