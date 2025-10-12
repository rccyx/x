import { z } from "zod";

const totpURI = z.string().min(1).max(512);

export const twoFactorEnableSchemaRo = z.object({
  totpURI,
  backupCodes: z.array(z.string().min(1).max(255)),
});

export const twoFactorGetTotpUriSchemaRo = z.object({
  totpURI,
});
export const twoFactorGenerateBackupCodesSchemaRo = z.object({
  backupCodes: z.array(z.string().min(1).max(255)),
});

export type TwoFactorEnableRo = z.infer<typeof twoFactorEnableSchemaRo>;

export type TwoFactorGetTotpUriRo = z.infer<typeof twoFactorGetTotpUriSchemaRo>;

export type TwoFactorGenerateBackupCodesRo = z.infer<
  typeof twoFactorGenerateBackupCodesSchemaRo
>;
