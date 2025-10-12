import { tokenAuthMiddlewareHeaderSchemaRequest } from "~/transports/v1/models/shared";
import { z } from "zod";
import { NotificationType } from "@ashgw/email";

export const notificationCreateHeadersSchemaRequest =
  tokenAuthMiddlewareHeaderSchemaRequest;

export const notificationCreateBodySchemaRequest = z
  .object({
    to: z
      .string()
      .email()
      .optional()
      .describe(
        "The email address to send the notification to. If not provided, the notification will be sent to my personal email address.",
      ),
    type: z
      .nativeEnum(NotificationType)
      .describe("The type of the notification"),
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
  .describe("The Email notification to send.");

export type NotificationCreateHeadersRequest = z.infer<
  typeof notificationCreateHeadersSchemaRequest
>;
export type NotificationCreateBodyRequest = z.infer<
  typeof notificationCreateBodySchemaRequest
>;
