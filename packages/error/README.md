# @ashgw/error

Most projects eventually rot under a mess of error styles. Some code throws raw `Error`, some use HTTP-only classes, some copy-paste TRPCError, and suddenly your monorepo is a jungle. This package exists so that never happens again. It gives you one internal error type and a couple of mappers, and that’s it. Everything else flows from there.

The philosophy is simple. Inside your services you never throw a raw error. You only throw an `AppError`. You don’t touch transport-specific error classes, not in tRPC, not in REST, not anywhere. Your core logic speaks one language, and then at the edge you translate once into whatever the framework expects. This keeps your domain pure and your boundaries clean. It is the same idea you see in DDD, in Go’s sentinel errors, and in old enterprise systems that had to survive years of chaos. The difference is we actually made it nice to use in TypeScript.

Usage reflects that simplicity. When you need to raise something, you don’t write new classes, you don’t remember fifteen names, you just call `E`. For example: `throw E.notFound("Post not found", { slug })`. That’s it. If you catch an unknown value, you can wrap it with `E.internal("unexpected failure", { op: "x" }, cause)`. Every AppError carries a code, a message, and optional metadata. By default the message is exposed to clients, but you can mark it private if you want. No surprises, no half measures.

At the boundary, you pick the mapper. In REST handlers, you call `httpFrom(error)` and get back `{status, body}` ready to send. In tRPC, you call `trpcFrom(TRPCError, error)` and it hands you a proper TRPCError with the right code. That’s the only time you ever think about transport. Inside your services you never care if the request came from REST, RPC, GraphQL, or CLI. It’s always the same internal error flowing up the stack.

This package has no dependencies. It works in Node, Deno, browser, serverless, wherever you want. The point is discipline: you never throw anything else in your codebase. Every error is consistent, every log line is predictable, and clients never get random shapes. It’s lean, it’s boring, and it saves you from the slow death of “whatever error feels right in the moment.”

## boundary helpers

`external()` wraps calls to third party sdks or apis and maps failures to `E.upstreamError` with `meta.upstream`.

```ts
import { external } from "@ashgw/error";

const user = await external(() => sdk.users.get(id), {
  service: "example-sdk",
  operation: "users.get",
});
```

`internal()` wraps calls to things you control like databases and internal services and maps failures to E.internal with meta.internal

```ts
import { internal } from "@ashgw/error";

const row = await internal(() => db.user.findById(id), {
  service: "db",
  op: "user.findById",
});
```
