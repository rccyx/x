import type { inferProcedureInput } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { expect, test } from "vitest";

import { db } from "@rccyx/db";

import type { AppRouter } from "../../src/boundary/rpc/router";
import {
  postCardSchemaRo,
  postArticleSchemaRo,
} from "../../src/boundary/rpc/models";
import { appRouter } from "../../src/boundary/rpc/router";
import { createTRPCContext } from "../../src/adapters/trpc/context";
import { createCallerFactory } from "../../src/adapters/trpc/root";

function makeNextRequestStub(init?: {
  headers?: Record<string, string | string[]>;
  method?: string;
  url?: string;
}): NextRequest {
  const h = new Headers();
  for (const [k, v] of Object.entries(init?.headers ?? {})) {
    if (Array.isArray(v)) v.forEach((val) => h.append(k, val));
    else h.set(k, v);
  }
  const url = init?.url ?? "http://localhost/test";
  const method = init?.method ?? "GET";
  return new NextRequest(url, { method, headers: h }) as unknown as NextRequest;
}

function createTestContext() {
  const req = makeNextRequestStub({
    headers: {
      forwarded: 'for="127.0.0.1";proto=https;by=vitest',
      "x-forwarded-for": "127.0.0.1",
      "user-agent": "vitest",
      "accept-language": "en",
    },
  });

  return createTRPCContext({
    db,
    req,
    res: new NextResponse(null, { headers: new Headers() }),
    trpcInfo: {} as FetchCreateContextFnOptions["info"],
  });
}

test("load and validate all continuum posts", async () => {
  const ctx = createTestContext();
  const caller = createCallerFactory(appRouter)(ctx);
  const posts = await caller.post.getPublicPostCards();

  for (const post of posts) {
    expect(() => postCardSchemaRo.parse(post)).not.toThrow();
  }
});

test("load and validate a single continuum post", async () => {
  const ctx = createTestContext();
  const caller = createCallerFactory(appRouter)(ctx);

  const cards = await caller.post.getPublicPostCards();
  expect(cards.length).toBeGreaterThan(0);

  const input: inferProcedureInput<AppRouter["post"]["getDetailedPublicPost"]> =
    {
      slug: cards[0]?.slug ?? "",
    };

  const post = await caller.post.getDetailedPublicPost(input);

  expect(post).toMatchObject(postArticleSchemaRo.parse(post));
});
