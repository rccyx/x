import type { AppCode, AppHttpBody } from "./codes";
import { AppError } from "./error";

export type HttpStatus =
  | 400
  | 401
  | 403
  | 404
  | 405
  | 409
  | 412
  | 413
  | 422
  | 429
  | 408
  | 499
  | 500
  | 501
  | 502
  | 503
  | 504;

const httpByCode: Record<AppCode, HttpStatus> = {
  BAD_REQUEST: 400,
  PARSE_ERROR: 400,
  INVALID_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_SUPPORTED: 405,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  TIMEOUT: 408,
  CLIENT_CLOSED_REQUEST: 499,
  INTERNAL: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  UPSTREAM_ERROR: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

export function httpStatusFromCode(code: AppCode): HttpStatus {
  return httpByCode[code];
}

export function toHttp(e: AppError): { status: HttpStatus; body: AppHttpBody } {
  const status = httpStatusFromCode(e.code);
  const safeMessage = e.exposeMessage ? e.message : defaultMessage(e.code);
  const body: AppHttpBody = {
    code: e.code,
    message: safeMessage,
    ...(e.exposeMessage && e.meta
      ? { meta: e.meta as Record<string, unknown> }
      : {}),
  };
  return { status, body };
}

export function toHttpFromUnknown(u: unknown): {
  status: HttpStatus;
  body: AppHttpBody;
} {
  const e = AppError.fromUnknown(u, { code: "INTERNAL" });
  return toHttp(e);
}

function defaultMessage(code: AppCode): string {
  switch (code) {
    case "BAD_REQUEST":
    case "PARSE_ERROR":
    case "INVALID_REQUEST":
      return "Bad request";
    case "UNAUTHORIZED":
      return "Unauthorized";
    case "FORBIDDEN":
      return "Forbidden";
    case "NOT_FOUND":
      return "Not found";
    case "METHOD_NOT_SUPPORTED":
      return "Method not supported";
    case "CONFLICT":
      return "Conflict";
    case "PRECONDITION_FAILED":
      return "Precondition failed";
    case "PAYLOAD_TOO_LARGE":
      return "Payload too large";
    case "UNPROCESSABLE_CONTENT":
      return "Unprocessable content";
    case "TOO_MANY_REQUESTS":
      return "Too many requests";
    case "TIMEOUT":
      return "Request timeout";
    case "CLIENT_CLOSED_REQUEST":
      return "Client closed request";
    case "NOT_IMPLEMENTED":
      return "Not implemented";
    case "BAD_GATEWAY":
      return "Bad gateway";
    case "SERVICE_UNAVAILABLE":
      return "Service unavailable";
    case "GATEWAY_TIMEOUT":
      return "Gateway timeout";
    case "INTERNAL":
    default:
      return "Internal error";
  }
}
