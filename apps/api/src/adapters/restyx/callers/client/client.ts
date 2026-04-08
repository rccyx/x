import { createSdkClient } from "../../../../adapters/restyx/framework/src/sdk";
import { env } from "@rccyx/env";
import { contract } from "../../../../boundary/v1/contract";
import { root } from "../../../../root-uris";
import type { CreateClientArgs } from "../../../../adapters/restyx/framework/src/core";

// Centralized client options per latest docs
// Prefer passing credentials via fetchOptions when needed; keep baseHeaders pure
const args = {
  baseUrl: env.NEXT_PUBLIC_API_URL + root.v1,
  baseHeaders: {},
  validateResponse: true, // runtime response validation against contract
  throwOnUnknownStatus: true, // enforce declared status codes only
  jsonQuery: false,
} satisfies CreateClientArgs;

export const sdk = createSdkClient(contract, args);
