import { z } from "zod";
import { NotificationType } from "@ashgw/email";

export const emailNotificationCreateSchemaDto = z.object({
  to: z.string().email(),
  type: z.nativeEnum(NotificationType),
  subject: z.string().min(1).max(30),
  title: z.string().min(1).max(30),
  message: z.string().min(1).max(10000),
});

export type EmailNotificationCreateSchemaDto = z.infer<
  typeof emailNotificationCreateSchemaDto
>;
