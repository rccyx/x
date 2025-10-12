import { AppError } from "./error";
import type { AppCode } from "./codes";

type Meta = Readonly<Record<string, unknown>>;

function make(code: AppCode) {
  return (message?: string, meta?: Meta, cause?: unknown) =>
    new AppError({ code, message, meta, cause });
}

export const E = {
  badRequest: make("BAD_REQUEST"),
  parseError: make("PARSE_ERROR"),
  invalidRequest: make("INVALID_REQUEST"),
  unauthorized: make("UNAUTHORIZED"),
  forbidden: make("FORBIDDEN"),
  notFound: make("NOT_FOUND"),
  methodNotSupported: make("METHOD_NOT_SUPPORTED"),
  conflict: make("CONFLICT"),
  preconditionFailed: make("PRECONDITION_FAILED"),
  payloadTooLarge: make("PAYLOAD_TOO_LARGE"),
  unprocessableContent: make("UNPROCESSABLE_CONTENT"),
  tooManyRequests: make("TOO_MANY_REQUESTS"),
  timeout: make("TIMEOUT"),
  clientClosedRequest: make("CLIENT_CLOSED_REQUEST"),

  internal: make("INTERNAL"),
  notImplemented: make("NOT_IMPLEMENTED"),
  badGateway: make("BAD_GATEWAY"),
  serviceUnavailable: make("SERVICE_UNAVAILABLE"),
  gatewayTimeout: make("GATEWAY_TIMEOUT"),
  upstreamError: make("UPSTREAM_ERROR"),
} as const;
