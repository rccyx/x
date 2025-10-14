import { z } from "zod";
import { tokenAuthMiddlewareHeaderSchemaRequest } from "../_shared";
import { notificationsPushEmailNotifBodySchemaRequest } from "../notifications";
import type { InferResponses } from "ts-rest-kit/core";
import { createSchemaResponses } from "ts-rest-kit/core";
import {
  tokenAuthMiddlewareSchemaResponse,
  internalErrorSchemaResponse,
  rateLimiterMiddlewareSchemaResponse,
} from "../_shared/responses";

/* ------------------------- Shared Schemas ------------------------- */
export const isoDateTimeSchema = z
  .string()
  .datetime({ offset: true })
  .describe("e.g. '2025-01-01T00:00:00+00:00'");

/* ------------------------- Request Schemas ------------------------- */

const notification = notificationsPushEmailNotifBodySchemaRequest.omit({
  to: true,
  subject: true,
});

const withNotification = <T extends z.ZodRawShape>(shape: T) =>
  z.object({
    ...shape,
    notification,
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

export const remindersPushReminderBodySchemaRequest = z
  .object({
    schedule: z.discriminatedUnion("kind", [
      scheduleAtSchema,
      scheduleDelaySchema,
    ]),
  })
  .describe("The reminder to create.");

export const remindersPushReminderHeadersSchemaRequest =
  tokenAuthMiddlewareHeaderSchemaRequest.extend({});

export type RemindersPushReminderBodyRequest = z.infer<
  typeof remindersPushReminderBodySchemaRequest
>;
export type RemindersPushReminderHeadersRequest = z.infer<
  typeof remindersPushReminderHeadersSchemaRequest
>;

/* ------------------------- Response Schemas ------------------------- */

const mw = createSchemaResponses({
  ...rateLimiterMiddlewareSchemaResponse,
  ...tokenAuthMiddlewareSchemaResponse,
});

const __remindersPushReminderHandlerSchemaResponses = createSchemaResponses({
  201: z.object({
    created: z.array(
      z
        .object({
          id: z.string().min(1).max(255),
          at: isoDateTimeSchema.optional(),
        })
        .describe(
          "The reminder message or schedule created successfully by the upstream service.",
        ),
    ),
  }),
  ...internalErrorSchemaResponse,
});

export const remindersPushReminderSchemaResponses = createSchemaResponses({
  ...mw,
  ...__remindersPushReminderHandlerSchemaResponses,
});

export type RemindersPushReminderHandlerResponses = InferResponses<
  typeof __remindersPushReminderHandlerSchemaResponses
>;

export type RemindersPushReminderResponses = InferResponses<
  typeof remindersPushReminderSchemaResponses
>;
