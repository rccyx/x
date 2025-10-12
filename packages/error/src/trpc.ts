import type { AppCode } from "./codes";
import { AppError } from "./error";

export type TRPCErrorCtor<Code extends string> = new (opts: {
  code: Code;
  message?: string;
  cause?: unknown;
}) => unknown;

export type TrpcCode =
  | "PARSE_ERROR"
  | "BAD_REQUEST"
  | "INTERNAL_SERVER_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_SUPPORTED"
  | "TIMEOUT"
  | "CONFLICT"
  | "PRECONDITION_FAILED"
  | "PAYLOAD_TOO_LARGE"
  | "UNPROCESSABLE_CONTENT"
  | "TOO_MANY_REQUESTS"
  | "CLIENT_CLOSED_REQUEST";

const trpcByCode: Record<AppCode, TrpcCode> = {
  BAD_REQUEST: "BAD_REQUEST",
  PARSE_ERROR: "PARSE_ERROR",
  INVALID_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  METHOD_NOT_SUPPORTED: "METHOD_NOT_SUPPORTED",
  CONFLICT: "CONFLICT",
  PRECONDITION_FAILED: "PRECONDITION_FAILED",
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
  UNPROCESSABLE_CONTENT: "UNPROCESSABLE_CONTENT",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  TIMEOUT: "TIMEOUT",
  CLIENT_CLOSED_REQUEST: "CLIENT_CLOSED_REQUEST",
  INTERNAL: "INTERNAL_SERVER_ERROR",
  NOT_IMPLEMENTED: "INTERNAL_SERVER_ERROR",
  BAD_GATEWAY: "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE: "INTERNAL_SERVER_ERROR",
  GATEWAY_TIMEOUT: "TIMEOUT",
  UPSTREAM_ERROR: "INTERNAL_SERVER_ERROR",
};

export function trpcCodeFromApp(code: AppCode): TrpcCode {
  return trpcByCode[code];
}

export function toTrpc<TCtor extends TRPCErrorCtor<TrpcCode>>(
  ctor: TCtor,
  e: AppError,
) {
  const code = trpcCodeFromApp(e.code);
  const message = e.exposeMessage ? e.message : "Internal error";
  return new ctor({ code, message, cause: e });
}

export function toTrpcFromUnknown<TCtor extends TRPCErrorCtor<TrpcCode>>(
  ctor: TCtor,
  u: unknown,
) {
  const e = AppError.fromUnknown(u, { code: "INTERNAL" });
  return toTrpc(ctor, e);
}
