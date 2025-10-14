import { z } from "zod";
import type { InferResponses } from "ts-rest-kit/core";
import { createSchemaResponses } from "ts-rest-kit/core";
import {
  tokenAuthMiddlewareSchemaResponse,
  internalErrorSchemaResponse,
  rateLimiterMiddlewareSchemaResponse,
} from "../shared/responses";

import { isoDateTimeSchema } from "./shared";

/* ------------------------- Request Schemas ------------------------- */

/* ------------------------- Response Schemas ------------------------- */

export const mw = createSchemaResponses({
  ...rateLimiterMiddlewareSchemaResponse,
  ...tokenAuthMiddlewareSchemaResponse,
});

export const remindersPushReminderHandlerSchemaResponses =
  createSchemaResponses({
    201: z.object({
      created: z.array(
        z
          .object({
            id: z.string().min(1).max(255),
            at: isoDateTimeSchema.optional(),
          })
          .describe(
            "The reminder message or schedule created successfully by the upstream service.",
          ),
      ),
    }),
    ...internalErrorSchemaResponse,
  });

export const remindersPushReminderSchemaResponses = createSchemaResponses({
  ...mw,
  ...remindersPushReminderHandlerSchemaResponses,
  // TODO: remove this annoying ass error reposne when erryx is done
});

export type RemindersPushReminderHandlerResponses = InferResponses<
  typeof remindersPushReminderHandlerSchemaResponses
>;

export type RemindersPushReminderResponses = InferResponses<
  typeof remindersPushReminderSchemaResponses
>;
