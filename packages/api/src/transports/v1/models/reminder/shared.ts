import { z } from "zod";
// need to require timezone in ISO to avoid accidental UTC mistakes
export const isoDateTimeSchema = z
  .string()
  .datetime({ offset: true })
  .describe("e.g. '2025-01-01T00:00:00+00:00'");
