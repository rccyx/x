import { z } from "zod";
import { email } from "../shared";

export const newsletterSubscribeSchemaDto = z.object({
  email,
});

export type NewsletterSubscribeDto = z.infer<
  typeof newsletterSubscribeSchemaDto
>;
