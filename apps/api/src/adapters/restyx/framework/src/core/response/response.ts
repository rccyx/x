import type { MaybeUndefined } from "typyx";
import { TsRestResponse } from "@ts-rest/serverless";
import type { ErrorBody } from "./error";

export interface MwUnion {
  status: number;
  body: MaybeUndefined<unknown>;
  headers?: Record<string, string>;
}

function generic(x: MwUnion): Response {
  const { status, body, headers } = x;
  return typeof body === "undefined"
    ? new TsRestResponse(null, { status, headers })
    : new TsRestResponse(
        typeof body === "string" ? body : JSON.stringify(body),
        { status, headers },
      );
}

function withStatus(defaultStatus: number) {
  return (
    body: ErrorBody,
    opts?: { status?: number; headers?: Record<string, string> },
  ) =>
    generic({
      status: opts?.status ?? defaultStatus,
      headers: opts?.headers,
      body,
    });
}

const error = {
  badRequest: withStatus(400),
  unauthorized: withStatus(401),
  forbidden: withStatus(403),
  notFound: withStatus(404),
  conflict: withStatus(409),
  internal: withStatus(500),
  upstream: withStatus(502),
  timeout: withStatus(504),
  tooManyRequests: (opts: {
    body: ErrorBody;
    retryAfterSeconds: number;
    status?: number;
    headers?: Record<string, string>;
  }) => {
    const retry = Math.max(1, Math.floor(opts.retryAfterSeconds));
    return generic({
      status: opts.status ?? 429,
      headers: { ...(opts.headers ?? {}), "Retry-After": String(retry) },
      body: opts.body,
    });
  },
};

export const response = { generic, error };
