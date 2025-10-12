import { z } from "zod";

// ========== Schemas ==========

const password = z.string().min(8).max(255);

export const twoFactorEnableSchemaDto = z.object({
  password,
});

export const twoFactorGetTotpUriSchemaDto = z.object({
  password,
});

export const twoFactorVerifyTotpSchemaDto = z.object({
  code: z.string().min(6).max(10),
  trustDevice: z.boolean().optional(),
});

export const twoFactorDisableSchemaDto = z.object({
  password,
});

export const twoFactorGenerateBackupCodesSchemaDto = z.object({
  password,
});

export const twoFactorVerifyBackupCodeSchemaDto = z.object({
  code: z.string().min(6).max(64),
  disableSession: z.boolean().optional(),
  trustDevice: z.boolean().optional(),
});

// ========== Types ==========

export type TwoFactorEnableDto = z.infer<typeof twoFactorEnableSchemaDto>;
export type TwoFactorGetTotpUriDto = z.infer<
  typeof twoFactorGetTotpUriSchemaDto
>;
export type TwoFactorVerifyTotpDto = z.infer<
  typeof twoFactorVerifyTotpSchemaDto
>;
export type TwoFactorDisableDto = z.infer<typeof twoFactorDisableSchemaDto>;
export type TwoFactorGenerateBackupCodesDto = z.infer<
  typeof twoFactorGenerateBackupCodesSchemaDto
>;
export type TwoFactorVerifyBackupCodeDto = z.infer<
  typeof twoFactorVerifyBackupCodeSchemaDto
>;
