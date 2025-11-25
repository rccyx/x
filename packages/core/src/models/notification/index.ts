import { z } from "zod";

export const emailNotificationCreateSchemaDto = z.object({
  to: z.string().email(),
  type: z.enum(["personal", "service", "reminder"]),
  subject: z.string().min(1).max(30),
  title: z.string().min(1).max(30),
  message: z.string().min(1).max(10000),
});

export type EmailNotificationCreateDto = z.infer<
  typeof emailNotificationCreateSchemaDto
>;
