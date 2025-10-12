import { z } from "zod";

import { UserRoleEnum } from "./shared";
import { email, id } from "../shared";
import { sessionSchemaRo } from "../session";

export const userSchemaRo = z.object({
  id,
  email,
  createdAt: z.date(),
  updatedAt: z.date(),
  emailVerified: z.boolean().default(false),
  name: z.string().min(1).max(30).nullable(),
  image: z.string().min(1).max(4096).optional(),
  role: z.nativeEnum(UserRoleEnum),
  twoFactorEnabled: z.boolean(),
  session: sessionSchemaRo,
});

// ========== Types ==========
export type UserRo = z.infer<typeof userSchemaRo>;
