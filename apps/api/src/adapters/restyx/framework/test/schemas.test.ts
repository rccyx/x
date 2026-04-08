import { describe, it, expect } from "vitest";
import { z } from "zod";
import type { TestType } from "typyx";
import { httpErrorSchema, createSchemaResponses } from "../src/core";
import { initContract } from "@ts-rest/core";

const c = initContract();

describe("@restyx/next schemas", () => {
  it("createSchemaResponses returns same object preserving literal types", () => {
    const resp = createSchemaResponses({
      200: c.type<{ ok: true }>(),
      401: httpErrorSchema.unauthorized(),
    });

    expect(Object.keys(resp)).toEqual(["200", "401"]);
  });

  // type-level check for error body
  type _assertUnauthorizedBody = TestType<
    z.infer<ReturnType<typeof httpErrorSchema.unauthorized>>,
    {
      message: string;
      details?: Record<string, unknown>;
    },
    true
  >;

  it("accepts zod schemas and that they validate", () => {
    const schema = z.object({ a: z.number().int().positive() });
    const parsed = schema.parse({ a: 1 });
    expect(parsed.a).toBe(1);
  });
});
