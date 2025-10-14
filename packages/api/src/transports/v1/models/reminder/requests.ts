import { z } from "zod";
import { notificationCreateBodySchemaRequest } from "../notification";
import { tokenAuthMiddlewareHeaderSchemaRequest } from "../_shared";
import { isoDateTimeSchema } from "./shared";

const reminderNotificationSchemaRequest =
  notificationCreateBodySchemaRequest.omit({
    to: true,
    subject: true,
  });

const withNotification = <T extends z.ZodRawShape>(shape: T) =>
  z.object({
    ...shape,
    notification: reminderNotificationSchemaRequest,
  });

const scheduleAtSchema = withNotification({
  kind: z.literal("at").describe("At a specific date and time"),
  at: isoDateTimeSchema,
});

const scheduleDelaySchema = withNotification({
  kind: z.literal("delay").describe("Delay for a specific duration"),
  delay: z.discriminatedUnion("unit", [
    z.object({
      unit: z.literal("seconds"),
      value: z.number().positive().describe("The number of seconds to delay"),
    }),
    z.object({
      unit: z.literal("minutes"),
      value: z.number().positive().describe("The number of minutes to delay"),
    }),
    z.object({
      unit: z.literal("hours"),
      value: z.number().positive().describe("The number of hours to delay"),
    }),
    z.object({
      unit: z.literal("days"),
      value: z.number().positive().describe("The number of days to delay"),
    }),
  ]),
});

export const reminderCreateBodySchemaRequest = z
  .object({
    schedule: z.discriminatedUnion("kind", [
      scheduleAtSchema,
      scheduleDelaySchema,
    ]),
  })
  .describe("The reminder to create.");

export const reminderCreateHeadersSchemaRequest =
  tokenAuthMiddlewareHeaderSchemaRequest.extend({});

export type ReminderCreateBodyRequest = z.infer<
  typeof reminderCreateBodySchemaRequest
>;
export type ReminderCreateHeadersRequest = z.infer<
  typeof reminderCreateHeadersSchemaRequest
>;
