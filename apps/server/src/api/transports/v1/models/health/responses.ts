import { createSchemaResponses } from "ts-rest-kit/core";
import type { InferResponses } from "ts-rest-kit/core";
import { okSchemaResponse } from "../shared";

export const healthSchemaResponses = createSchemaResponses({
  ...okSchemaResponse,
});

export type HealthResponses = InferResponses<typeof healthSchemaResponses>;
