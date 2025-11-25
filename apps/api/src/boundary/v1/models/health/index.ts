import { createSchemaResponses } from "@restyx/next/core";
import type { InferResponses } from "@restyx/next/core";
import { okSchemaResponse } from "../_shared";

export const healthSchemaResponses = createSchemaResponses({
  ...okSchemaResponse,
});

export type HealthResponses = InferResponses<typeof healthSchemaResponses>;
