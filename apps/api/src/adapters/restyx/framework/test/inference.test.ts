import { describe, it, expect as runtime } from "vitest";
import { expect as compiletime, is } from "testyx";
import { z } from "zod";
import type { InferRequest, InferResponses } from "../src/core";
import { createContractInstance } from "../src/core";

const c = createContractInstance();

// Contract to validate InferResponses type behavior
const _responses = {
  200: c.type<{ ok: true }>(),
  204: c.noBody(),
  400: z.object({ code: z.literal("BAD_REQUEST"), message: z.string() }),
  500: z.null(),
} as const;

type R = InferResponses<typeof _responses>;

// Request inference
const _bodySchema = z.object({ name: z.string(), age: z.number().int() });
type Body = InferRequest<typeof _bodySchema>;

describe("@restyx/next inference", () => {
  it("enforces type contracts", () => {
    compiletime(
      is<Body, { name: string; age: number }>()
        .describe("Body must match Zod schema shape exactly")
        .and()
        .is<Extract<R, { status: 200 }>["body"], { ok: true }>()
        .describe("200 response body must be { ok: true }")
        .and()
        .is<Extract<R, { status: 204 }>["body"], undefined>()
        .describe("204 response body must be undefined")
        .and()
        .sub<
          Extract<R, { status: 400 }>["body"],
          { code: string; message: string }
        >()
        .describe("400 response must be a valid error payload")
        .and()
        .is<Extract<R, { status: 500 }>["body"], null>()
        .describe("500 response body must be null"),
    );
  });

  it("InferRequest infers zod schema shape (runtime)", () => {
    const sample: Body = { name: "john", age: 22 };
    runtime(typeof sample.name).toBe("string");
    runtime(typeof sample.age).toBe("number");
  });

  it("InferResponses yields discriminated union (runtime)", () => {
    const ok: Extract<R, { status: 200 }> = { status: 200, body: { ok: true } };
    const noBody: Extract<R, { status: 204 }> = {
      status: 204,
      body: undefined,
    };
    const bad: Extract<R, { status: 400 }> = {
      status: 400,
      body: { code: "BAD_REQUEST", message: "x" },
    };
    const internal: Extract<R, { status: 500 }> = { status: 500, body: null };

    runtime(ok.body.ok).toBe(true);
    runtime(noBody.body).toBeUndefined();
    runtime(bad.body.code).toBe("BAD_REQUEST");
    runtime(internal.body).toBeNull();
  });
});
