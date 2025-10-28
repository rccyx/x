// TS-REST v3 client + React Query v5 hooks initializer
// - initClient: runtime-safe client (supports throwOnUnknownStatus, validateResponse)
// - initTsrReactQuery: generates typed hooks + providers for React Query v5
import { initTsrReactQuery } from "@ts-rest/react-query/v5";
import { initClient } from "@ts-rest/core";
import { contract } from "~/transports/v1/contract";
import { root } from "~/root-uris";
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

// Low-level SDK for imperative calls (without React Query)
export const sdk = initClient(contract, args);

/**
 * React Query integration for ts-rest.
 *
 * Provides auto-generated hooks like:
 * ```ts
 * const { data, error } = tsrQueryClientSides.healthCheck.useQuery(["hc"]);
 * ```
 *
 */
// Hook container + Provider + initQueryClient/useQueryClient helpers
export const tsrQueryClientSide = initTsrReactQuery(contract, args);
