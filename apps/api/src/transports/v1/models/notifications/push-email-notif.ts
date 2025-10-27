import { z } from "zod";
import type { InferResponses } from "ts-rest-kit/core";
import { createSchemaResponses, httpErrorSchema } from "ts-rest-kit/core";

import { tokenAuthMiddlewareHeaderSchemaRequest } from "../_shared";
import {
  rateLimiterMiddlewareSchemaResponse,
  tokenAuthMiddlewareSchemaResponse,
  okSchemaResponse,
  internalErrorSchemaResponse,
} from "../_shared/responses";

/* ------------------------- Request Schemas ------------------------- */

export const notificationsPushEmailNotifHeadersSchemaRequest =
  tokenAuthMiddlewareHeaderSchemaRequest;

export const notificationsPushEmailNotifBodySchemaRequest = z
  .object({
    to: z
      .string()
      .email()
      .optional()
      .describe(
        "The email address to send the notification to. If not provided, the notification will be sent to my personal email address.",
      ),
    subject: z
      .string()
      .min(1)
      .max(30)
      .optional()
      .describe("The subject of the notification."),
    title: z.string().min(1).max(30).describe("The title of the notification."),
    message: z
      .string()
      .min(1)
      .max(10000)
      .describe("The message of the notification."),
  })
  .describe("The email notification to send.");

/* ------------------------- Request Types ------------------------- */

export type NotificationsPushEmailNotifHeadersRequest = z.infer<
  typeof notificationsPushEmailNotifHeadersSchemaRequest
>;

export type NotificationsPushEmailNotifBodyRequest = z.infer<
  typeof notificationsPushEmailNotifBodySchemaRequest
>;

/* ------------------------- Response Schemas ------------------------- */

const mws = createSchemaResponses({
  ...rateLimiterMiddlewareSchemaResponse,
  ...tokenAuthMiddlewareSchemaResponse,
});

const __notificationsPushEmailNotifHandlerSchemaResponses =
  createSchemaResponses({
    ...okSchemaResponse,
    ...internalErrorSchemaResponse,
    502: httpErrorSchema.upstream().describe("Upstream error"),
  });

export const notificationsPushEmailNotifSchemaResponses = createSchemaResponses(
  {
    ...mws,
    ...__notificationsPushEmailNotifHandlerSchemaResponses,
  },
);

/* ------------------------- Response Types ------------------------- */

export type NotificationsPushEmailNotifHandlerResponses = InferResponses<
  typeof __notificationsPushEmailNotifHandlerSchemaResponses
>;

export type NotificationsPushEmailNotifResponses = InferResponses<
  typeof notificationsPushEmailNotifSchemaResponses
>;
