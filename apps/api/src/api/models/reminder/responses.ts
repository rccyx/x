import { z } from "zod";
import type { InferResponses } from "ts-rest-kit/core";
import { createSchemaResponses } from "ts-rest-kit/core";
import {
  tokenAuthMiddlewareSchemaResponse,
  internalErrorSchemaResponse,
  rateLimiterMiddlewareSchemaResponse,
} from "~/api/models/shared/responses";
import { reminderMessageCreatedSchemaRo } from "./ros";

export const reminderCreateSchemaResponses = createSchemaResponses({
  201: z.object({
    created: z.array(reminderMessageCreatedSchemaRo),
  }),
  ...rateLimiterMiddlewareSchemaResponse,
  ...tokenAuthMiddlewareSchemaResponse,
  ...internalErrorSchemaResponse,
});

export type ReminderCreateResponses = InferResponses<
  typeof reminderCreateSchemaResponses
>;
