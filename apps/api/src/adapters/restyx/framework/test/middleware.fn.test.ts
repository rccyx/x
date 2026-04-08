import { describe, it, expect } from "vitest";
import { middlewareFn, responseHandlersFn } from "../src/core";
import type { MiddlewareRequest, ResponseHandlerRequest } from "../src/core";
import { TsRestResponse } from "@ts-rest/serverless/next";

describe("middlewareFn and responseHandlersFn", () => {
  it("middlewareFn adapts function and allows returning ctx object", () => {
    interface G {
      ctx: Record<string, unknown>;
    }
    const mw = middlewareFn<G, { userId: string }>(() => {
      return { ctx: { userId: "u1" } };
    });

    const fakeReq = {} as unknown as MiddlewareRequest<G, { userId: string }>;
    const out = mw(fakeReq);
    const hasCtx =
      !!out && typeof out === "object" && "ctx" in (out as { ctx: unknown });
    expect(hasCtx).toBe(true);
    expect((out as { ctx: { userId: string } }).ctx.userId).toBe("u1");
  });

  it("responseHandlersFn wraps handler and forwards args", async () => {
    const fn = responseHandlersFn<void, { ctx: Record<string, unknown> }>(
      (res, req) => {
        expect(res.status).toBe(200);
        expect(req.url).toContain("/x");
      },
    );

    // minimal request shape with url
    // pass a TsRestResponse-compatible shape and a minimal request with url
    const res = new TsRestResponse(null, { status: 200 });
    const req = { url: "https://a/x" } as unknown as ResponseHandlerRequest<{
      ctx: Record<string, unknown>;
    }>;
    await fn(res, req);
  });
});
