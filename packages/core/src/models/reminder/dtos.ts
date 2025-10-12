import { emailNotificationCreateSchemaDto } from "../../models";
import { z } from "zod";
import { isoDateTimeSchema } from "./shared";

const reminderEmailNotificationSchemaDto =
  emailNotificationCreateSchemaDto.omit({
    to: true,
    subject: true,
  });

const withNotification = <T extends z.ZodRawShape>(shape: T) =>
  z.object({
    ...shape,
    emailNotification: reminderEmailNotificationSchemaDto,
  });

const scheduleAtSchema = withNotification({
  kind: z.literal("at"),
  at: isoDateTimeSchema,
});

const scheduleDelaySchema = withNotification({
  kind: z.literal("delay"),
  delay: z.discriminatedUnion("unit", [
    z.object({
      unit: z.literal("seconds"),
      value: z.number().positive(),
    }),
    z.object({
      unit: z.literal("minutes"),
      value: z.number().positive(),
    }),
    z.object({
      unit: z.literal("hours"),
      value: z.number().positive(),
    }),
    z.object({
      unit: z.literal("days"),
      value: z.number().positive(),
    }),
  ]),
});

export const reminderSendEmailNotificationSchemaDto = z.object({
  schedule: z.discriminatedUnion("kind", [
    scheduleAtSchema,
    scheduleDelaySchema,
  ]),
});

export type ReminderSendEmailNotificationSchemaDto = z.infer<
  typeof reminderSendEmailNotificationSchemaDto
>;
