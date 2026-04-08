import { describe, it, expect } from "vitest";
import { response } from "../src/core";

describe("middlewareResponse.errors.tooManyRequests", () => {
  it("adds integer Retry-After header and clamps to at least 1", () => {
    const r1 = response.error.tooManyRequests({
      body: { message: "slow" },
      retryAfterSeconds: 7.8,
    });
    expect(r1.status).toBe(429);
    expect(r1.headers.get("Retry-After")).toBe("7");

    const r2 = response.error.tooManyRequests({
      body: { message: "slow" },
      retryAfterSeconds: 0.2,
    });
    expect(r2.headers.get("Retry-After")).toBe("1");
  });
});
