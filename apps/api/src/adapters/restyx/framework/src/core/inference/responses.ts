import type { z } from "zod";
import type {
  ContractOtherResponse,
  ContractPlainType,
  ContractNullType,
  ContractNoBody,
} from "@ts-rest/core";

/* ---------- Internal helpers ---------- */

/** Unwrap zod / c.type<T>() / null holders into plain TS types. */
type UnwrapContractAny<T> = T extends z.ZodTypeAny
  ? z.infer<T>
  : T extends ContractPlainType<infer P>
    ? P
    : T extends ContractNullType
      ? null
      : [T] extends [null]
        ? null
        : never;

/**
 * Why it exists:
 * ts-rest represents bodies in a few shapes. Also, `c.noBody()` can widen to `symbol`
 * in some contexts. This helper normalizes those cases to a predictable `{ body: ... }`
 * shape or `{ body: undefined }` for no-body codes like 204.
 *
 * Rules:
 * - ContractNoBody or widened `symbol`  -> { body: undefined }
 * - ContractOtherResponse<Inner>       -> { body: UnwrapContractAny<Inner> }
 * - zod schema                         -> { body: z.infer<typeof schema> }
 * - ContractPlainType<T>               -> { body: T }
 * - null or ContractNullType           -> { body: null }
 */
type BodyFromResponseLoose<R> = R extends typeof ContractNoBody
  ? { body: undefined }
  : R extends symbol
    ? { body: undefined }
    : R extends ContractOtherResponse<infer Inner>
      ? UnwrapContractAny<Inner> extends never
        ? never
        : { body: UnwrapContractAny<Inner> }
      : R extends z.ZodTypeAny
        ? { body: z.infer<R> }
        : R extends ContractPlainType<infer P>
          ? { body: P }
          : R extends ContractNullType
            ? { body: null }
            : [R] extends [null]
              ? { body: null }
              : never;

type WithHeaders<T> = T & { headers?: Record<string, string> };
type StatusCodes<T> = Extract<keyof T, number>; // numeric HTTP status keys only

/**
 * Input:
 *   const responses = { 200: c.type<{ ok: true }>(), 204: c.noBody() }
 *
 * Output:
 *   | { status: 200; body: { ok: true }; headers?: Record<string,string> }
 *   | { status: 204; body: undefined; headers?: Record<string,string> }
 *
 * Notes:
 * - We keep `headers?` at the union level so you can attach standard headers per status.
 * - We do not over-constrain `status` to literal unions in callers. You get full
 *   discrimination on `status` while keeping ergonomic narrowings in switch statements.
 */
export type InferResponses<T extends Record<number, unknown>> = {
  [S in StatusCodes<T>]: WithHeaders<
    { status: S } & BodyFromResponseLoose<T[S]>
  >;
}[StatusCodes<T>];
