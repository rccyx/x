import { z } from "zod";
import { slug } from "../shared";

// ========== DTOs ==========

export const trackViewSchemaDto = z.object({
  slug,
});

// ========== ROs ==========
export const trackViewSchemaRo = z.object({
  total: z.number().int().nonnegative(),
});

// ========== Types ==========

export type TrackViewDto = z.infer<typeof trackViewSchemaDto>;
export type TrackViewRo = z.infer<typeof trackViewSchemaRo>;
