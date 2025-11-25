import { createSchemaResponses } from "restyx/core";
import type { InferResponses } from "restyx/core";
import { okSchemaResponse } from "../_shared";

export const healthSchemaResponses = createSchemaResponses({
  ...okSchemaResponse,
});

export type HealthResponses = InferResponses<typeof healthSchemaResponses>;
