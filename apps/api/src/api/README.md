# API architecture and naming guide

This repo exposes two transports over the same domain logic:

- **RPC (tRPC)** for internal apps and server code paths. Thin adapter, best DX.
- **REST (ts-rest)** for public or third party use. Stable, versioned, documented.

The **Services** layer is the single source of truth. Both transports validate inputs, run middlewares, and then delegate to Services. Services return **ROs**. Any mapping between database, 3rd party & public shapes lives in **Mappers**.

## Layering

1. **Transport**

   - RPC: `api/rpc/routes/*`
   - REST: `api/v1/router.ts`, `api/v1/contract.ts`
   - Concerns: validation, auth, rate limit, serialization, versioning

2. **Models**

   - RPC models: `api/rpc/models/*` with `Dto` (inputs) and `Ro` (outputs)
   - REST models: `api/v1/models/*` with `*Request` and `*Responses`

3. **Mappers**

   - `api/rpc/mappers/*` map DB QueryHelper results to `Ro` types

4. **Query Helpers**

   - `api/rpc/query-helpers/*` define Prisma selects/includes

5. **Services**

   - `api/rpc/services/*` implement business logic, call DB and infra

Keep logic out of the transport. If a handler contains branching that is not auth, rate limit, or trivial mapping, move it to a Service.

## Naming conventions

### General

s

- No `any` or `z.any()`. Use precise primitives, enums, unions.
- Every schema gets `.describe()` in REST. It becomes spec text for auto docs.
- Numbers from query are strings. Validate as string, transform to number, then pipe to bounded `z.number()`.
- Use discriminated unions for polymorphic inputs.

### RPC (internal)

- **DTO schemas (values)**: `<resource><Action><Schema>Dto`

  - Examples: `postUpdateSchemaDto`, `twoFactorEnableSchemaDto`

- **DTO types**: `<Resource><Action>Dto` inferred from the schema
- **RO schemas (values)**: `<resource><ViewOrIntent><Schema>Ro`

  - Examples: `postArticleSchemaRo`, `sessionSchemaRo`

- **RO types**: `<Resource><ViewOrIntent>Ro`
- **Mappers**: `<Entity>Mapper` with methods `to<Shape>Ro` and `from<Shape>Dto` if needed
- **Query helpers**: `<Entity><Intent>Query`, helper class `<Entity>QueryHelper` with `select/include/where*` methods
- **Procedures**: verbs that state intent, `getPublicPostCards`, `trashPost`, `enableTwoFactor`, since calling them requires us to call the resource first, so no need to prepend the resource here.

### REST (public)

- **Requests**: `<Resource><Action><Headers|Query|Path|Body>Request`
- **Response schemas (values)**: `<resource><Action><Schema>Responses`
- **Response types**: `<Resource><Action>Responses` inferred from schema responses
- **Endpoints object**: snake free, nest under resource buckets. Example: `v1endpoints.post.viewWindow = "/post/view-window"`
- **Contract keys**: `<resource><Action>` verbs read well in client SDKs. Example: `postDeleteTrash`
- **Functions**: mirror contract keys in `api/v1/functions/<resource>/<action>.ts`, each file contains 1 action.

### Services

- **Classes**: `<Domain>Service` with constructor injection for infra
- **Methods**: imperative verbs on domain objects, `createPost`, `updatePost`, `trashPost`, `restoreFromTrash`
- **Return**: always RO types, never raw DB types

### Files and folders

```
apps/api/src
├── api
│   ├── rpc
│   │   ├── models/           # Dto/Ro schemas and types (internal)
│   │   ├── mappers/
│   │   ├── query-helpers/
│   │   ├── routes/           # tRPC routers only
│   │   ├── services/         # business logic, single source of truth
│   │   └── router.ts         # appRouter assembly
│   ├── v1
│   │   ├── contract.ts       # ts-rest contract, source of truth for REST surface
│   │   ├── endpoints.ts
│   │   ├── functions/        # thin adapters that call Services
│   │   ├── models/           # *Request and *Responses schemas and types
│   │   └── router.ts
│   └── uri.ts
├── app                       # Next.js route handlers per transport
│   ├── rpc/[node]/route.ts
│   └── v1/[...node]/route.ts
└── trpc, ts-rest, lib, middleware, etc.
```

Keep `api/rpc/models` separate from `api/v1/models`. This prevents internal DTOs from leaking into public requests.

## Data flow examples

### RPC read

`client -> trpc route -> validate DTO -> call Service -> Service loads with QueryHelper -> Mapper.toRo -> return RO`

### REST command

`client -> ts-rest router -> validate *Request -> auth + rate limit -> map Request to DTO -> call Service -> map RO to *Responses if needed -> return`

Mapping is usually one line because DTO and Request often match. Keep the types distinct to preserve the boundary.

## Versioning and deprecation

- REST is versioned under `/v1`. New breaking public changes go to `/v2`. Services can support both while you migrate.
- RPC is internal. You can evolve names and shapes as needed. Coordinate with internal consumers through type errors.
- Never add breaking changes to existing REST contract keys. Add a new key or a new version.

## Error handling

- Transport returns typed errors only from declared error schemas.
- Services throw `AppError` with stable `code` values. Transports translate these to HTTP or TRPC errors.
- Avoid leaking internal messages across the boundary.

## Rate limiting and auth

- Apply rate limiting in transport. The limiter returns helpful messages and retry hints.
- For RPC, use `publicProcedure`, `authenticatedProcedure`, and `adminProcedure`.
- For REST, use middlewares `authed()` and `rateLimiter()` in router composition.

## CORS and cookies

- RPC route handler sets `credentials: include` on client fetch and mirrors cookies back to the final response.
- REST uses Next handlers and does not require custom CORS for same origin. Add CORS only when exposing across origins.

## Schema strictness checklist

- Every public field documented using `.describe()` in REST.
- No extraneous fields accepted. Use `.strict()` where appropriate.
- Transform and pipe number-like query strings.
- Use enums for roles and categories in both layers.
- Headers are explicitly modeled as schemas. Never read raw headers in Services.

## Mapper rules

- Mappers accept DB result types produced by QueryHelpers. They never call the db.
- Private helper methods for enum normalization are allowed.
- Mappers never log or throw domain errors. They are pure transformations.

## Service rules

- Only place allowed to call db and external clients.
- Input is DTOs or internally constructed primitives. Output is ROs.
- Throw `AppError` for domain failures. Do not return null for exceptional flows unless the caller expects null as a valid outcome.

## Procedure and endpoint naming

- Prefer intent based names over CRUD noise. `trashPost`, `restoreFromTrash`, `getPublicPostCards`.
- For lists, names end with plural nouns. For detail reads, include context like `getDetailedPublicPost`.
- For commands, use imperative verbs. For queries, use `get*`.

## Example mini spec

RPC

```ts
// dto
export const postUpdateSchemaDto = z.object({
  slug: z.string().min(1),
  data: postEditorSchemaDto,
});
export type PostUpdateDto = z.infer<typeof postUpdateSchemaDto>;

// route
updatePost: adminProcedure({ limiter: { hits: 2, every: "30s" } })
  .input(postUpdateSchemaDto)
  .output(postArticleSchemaRo)
  .mutation(async ({ input: { slug, data }, ctx: { db } }) => {
    return await new BlogService({ db, storage }).updatePost({ slug, data });
  });
```

REST

```ts
// requests
export const postTrashDeleteHeadersSchemaRequest =
  tokenAuthMiddlewareHeaderSchemaRequest.extend({});
export type PostTrashDeleteHeadersRequest = z.infer<
  typeof postTrashDeleteHeadersSchemaRequest
>;

// responses
export const postTrashDeleteSchemaResponses = createSchemaResponses({
  ...rateLimiterMiddlewareSchemaResponse,
  ...tokenAuthMiddlewareSchemaResponse,
  ...noContentSchemaResponse,
  ...internalErrorSchemaResponse,
});
export type PostTrashDeleteResponses = InferResponses<
  typeof postTrashDeleteSchemaResponses
>;
```

Service

```ts
export class BlogService {
  public async trashPost({
    originalSlug,
  }: {
    originalSlug: string;
  }): Promise<void> {
    // implementation as in repo
  }
}
```

## What to put where

- A new user facing operation

  - Add REST contract entry under `api/v1/contract.ts`
  - Add function under `api/v1/functions/<resource>/<action>.ts` that calls a Service
  - Add request and response schemas under `api/v1/models/<resource>`
  - Wire handler in `api/v1/router.ts`

- A new internal only operation

  - Add RPC procedure in `api/rpc/routes/<resource>`
  - Add DTO or RO schemas if needed
  - Implement in a Service if it is not a trivial wrapper

- A new database view or selection

  - Add a method to `QueryHelper`
  - Update Mapper to produce the right RO

## FAQ

**Should REST call RPC, or both call Services directly?**
Both should call Services directly. Avoid chaining transports.

**Can REST reuse RPC DTOs?**
Do not import RPC DTOs into REST. Define `*Request` in REST and map to DTOs before hitting Services. This keeps the public contract stable even if internal DTOs change.

**Can Services return primitives instead of ROs?**
Prefer ROs. It gives you a stable, documented shape across the app and simplifies testing.

**Where do I normalize external provider responses?**
In Services, immediately after the client call, then return an RO.

**How to deprecate a REST field?**
Add a replacement field, run both for a period, mark old field as deprecated in OpenAPI, remove in the next version.

---

If you want, I can turn this into `apps/api/README.md` and add a short `CONTRIBUTING.md` with do and do not rules.
