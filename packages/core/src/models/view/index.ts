import { z } from "zod";
import { slug } from "../shared";

// ========== DTOs ==========

export const trackViewSchemaDto = z.object({
  slug,
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
