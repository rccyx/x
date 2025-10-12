import { z } from "zod";
import { email } from "../shared";

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(255, { message: "Password must be at most 255 characters" })
  .regex(/[a-z]/, { message: "Must include at least one lowercase letter" })
  .regex(/[A-Z]/, { message: "Must include at least one uppercase letter" })
  .regex(/[0-9]/, { message: "Must include at least one number" })
  .describe(
    "8–255 characters, at least one uppercase, one lowercase, one number & one symbol",
  );

// ========== Schemas ==========
export const userLoginSchemaDto = z.object({
  email,
  password: passwordSchema,
});

export const userRegisterSchemaDto = userLoginSchemaDto.extend({
  name: z.string().min(2).max(30),
});

export const userChangePasswordSchemaDto = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });

export const userTerminateSpecificSessionSchemaDto = z.object({
  sessionId: z.string().min(1).max(255),
});

// ========== Types ==========
export type UserLoginDto = z.infer<typeof userLoginSchemaDto>;
export type UserRegisterDto = z.infer<typeof userRegisterSchemaDto>;
export type UserChangePasswordDto = z.infer<typeof userChangePasswordSchemaDto>;
export type UserTerminateSpecificSessionDto = z.infer<
  typeof userTerminateSpecificSessionSchemaDto
>;
