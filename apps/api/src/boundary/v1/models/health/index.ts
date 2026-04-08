import { createSchemaResponses } from "../../../../adapters/restyx/framework/src/core";
import type { InferResponses } from "../../../../adapters/restyx/framework/src/core";
import { okSchemaResponse } from "../_shared";

export const healthSchemaResponses = createSchemaResponses({
  ...okSchemaResponse,
});

export type HealthResponses = InferResponses<typeof healthSchemaResponses>;
