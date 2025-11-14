import { initTsrReactQuery } from "@ts-rest/react-query/v5";
import { initClient } from "@ts-rest/core";
import { contract } from "../../../../boundary/v1/contract";
import { root } from "../../../../root-uris";
import type { InitClientArgs } from "@ts-rest/core";

// Centralized client options per latest docs
// Prefer passing credentials via fetchOptions when needed; keep baseHeaders pure
const args = {
  baseUrl: root.v1,
  baseHeaders: {},
  validateResponse: true, // runtime response validation against contract
  throwOnUnknownStatus: true, // enforce declared status codes only
  jsonQuery: false,
} satisfies InitClientArgs;

export const sdk = initClient(contract, args);

export const restClient = initTsrReactQuery(contract, args);
