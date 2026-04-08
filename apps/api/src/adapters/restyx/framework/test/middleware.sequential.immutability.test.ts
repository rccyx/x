import type { EmptyObject } from "typyx";
import { describe, it, expect } from "vitest";
import { middleware } from "../src/next";

describe("sequential middleware immutability", () => {
  it("use() returns a new builder without mutating the original chain", () => {
    const base = middleware<{ ctx: EmptyObject }>();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const a = base.use(() => {});
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const b = a.use(() => {});
    // objects are different instances as builder is immutable
    expect(a).not.toBe(base);
    expect(b).not.toBe(a);
  });
});
