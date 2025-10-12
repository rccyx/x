import { z } from "zod";
import { id } from "../shared";

export const sessionSchemaRo = z.object({
  id,
  createdAt: z.date(),
  updatedAt: z.date(),
  isExpired: z.boolean(),
  userAgent: z.string().min(1).max(2048).optional(),
});

export type SessionRo = z.infer<typeof sessionSchemaRo>;
