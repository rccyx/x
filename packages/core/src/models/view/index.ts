import { z } from "zod";
import { slug } from "../shared";

// ========== DTOs ==========

export const trackViewSchemaDto = z.object({
  slug,
  ipAddress: z.string().min(1).max(128),
  userAgent: z.string().min(1).max(2048),
});

export const viewWindowPurgeWithCutoffSchemaDto = z.object({
  cutoff: z.date(),
});

// ========== ROs ==========
export const trackViewSchemaRo = z.object({
  total: z.number().int().nonnegative(),
});

export const viewWindowPurgeWithCutoffSchemaRo = z.object({
  deletedCount: z.number().int().nonnegative(),
});

// ========== Types ==========

export type TrackViewDto = z.infer<typeof trackViewSchemaDto>;
export type TrackViewRo = z.infer<typeof trackViewSchemaRo>;
export type ViewWindowPurgeWithCutoffDto = z.infer<
  typeof viewWindowPurgeWithCutoffSchemaDto
>;

export type ViewWindowPurgeWithCutoffRo = z.infer<
  typeof viewWindowPurgeWithCutoffSchemaRo
>;
