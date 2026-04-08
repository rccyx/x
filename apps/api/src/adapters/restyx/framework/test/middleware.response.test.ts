import { describe, it, expect } from "vitest";
import { response } from "../src/core";

// local copy of the mapping to avoid internal import reshuffles
const HTTP_STATUS_BY_CODE = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  UPSTREAM_ERROR: 502,
  TIMEOUT: 504,
} as const;

describe("middlewareResponse", () => {
  it("generic returns no-body response when body is undefined", () => {
    const res = response.generic({ status: 204, body: undefined });
    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(204);
  });

  it("generic returns json response when body is provided", async () => {
    const res = response.generic({
      status: 200,
      body: { a: 1 as number },
    });
    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { a: number };
    expect(json.a).toBe(1);
  });

  it("errors.* map codes to default HTTP statuses and include headers", () => {
    const res = response.error.unauthorized({ message: "no" });
    expect(res.status).toBe(HTTP_STATUS_BY_CODE.UNAUTHORIZED);
    const bad = response.error.badRequest({ message: "bad" });
    expect(bad.status).toBe(HTTP_STATUS_BY_CODE.BAD_REQUEST);

    const tmr = response.error.tooManyRequests({
      body: { message: "slow down" },
      retryAfterSeconds: 7,
    });
    expect(tmr.status).toBe(HTTP_STATUS_BY_CODE.TOO_MANY_REQUESTS);
    expect(tmr.headers.get("Retry-After")).toBe("7");
  });
});
