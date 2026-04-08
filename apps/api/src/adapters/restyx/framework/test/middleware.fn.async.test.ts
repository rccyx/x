import { describe, it, expect } from "vitest";
import { middlewareFn, response } from "../src/core";
import type { MiddlewareRequest } from "../src/core";
import type { GlobalContext } from "../src/core";

interface G extends GlobalContext {
  ctx: { user?: string };
}

describe("middlewareFn async behavior and short circuit", () => {
  it("awaits async fn and short circuits when Response returned", async () => {
    const mw = middlewareFn<G, { userId: string }>(async (req) => {
      await Promise.resolve();
      req.ctx.user = "john";
      return response.error.forbidden({ message: "no" });
    });

    const fake = { ctx: {} } as unknown as MiddlewareRequest<
      G,
      { userId: string }
    >;
    const out = await mw(fake);
    expect(out).toBeInstanceOf(Response);
  });

  it("can return ctx fragment asynchronously", async () => {
    const mw = middlewareFn<G, { traceId: string }>(async () => {
      await Promise.resolve();
      return { ctx: { traceId: "t-1" } };
    });
    const fake = { ctx: {} } as unknown as MiddlewareRequest<
      G,
      { traceId: string }
    >;
    const out = await mw(fake);
    expect(out && typeof out === "object" && "ctx" in out).toBe(true);
    // @ts-expect-no-error at runtime
    expect((out as { ctx: { traceId: string } }).ctx.traceId).toBe("t-1");
  });
});
