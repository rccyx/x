import { z } from "zod";

export const errorSchema = z.object({
  message: z.string().min(1).max(1000),
  details: z.record(z.string(), z.unknown()).optional(),
});

export type ErrorBody = z.infer<typeof errorSchema>;

export const httpErrorSchema = {
  badRequest: () => errorSchema.describe("400 Bad Request"),
  unauthorized: () => errorSchema.describe("401 Unauthorized"),
  forbidden: () => errorSchema.describe("403 Forbidden"),
  notFound: () => errorSchema.describe("404 Not Found"),
  conflict: () => errorSchema.describe("409 Conflict"),
  tooManyRequests: () => errorSchema.describe("429 Too Many Requests"),
  internal: () => errorSchema.describe("500 Internal Server Error"),
  upstream: () => errorSchema.describe("502 Upstream Error"),
  timeout: () => errorSchema.describe("504 Timeout"),
};
