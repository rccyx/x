Names are contracts. Once they leak into other repos, other teams, other years, they are basically permanent. This RFC is not about taste, it is about mechanical rules. Follow them and you get an API surface that can scale from one brain to five thousand without dissolving into synonyms and random nouns. Ignore them and everything else you do will feel brittle, no matter how smart the internal logic is.

The whole system is built on three layers that agree on the same vocabulary: the boundary (REST or any HTTP edge), the core (services, models, mappers, query-helpers), and the RPC layer (tRPC or any other typed transport between frontend and core). Each layer does a different job, but it never invents its own naming. It only projects the same words in different shapes.

You always start from a small, fixed vocabulary of resources and operations. A resource is a domain noun that makes sense by itself: user, post, session, reminder, notification, view, invoice, tenant, whatever your domain is. You always name it in PascalCase when talking about types and classes (User, Post, Session) and in lower plural when talking about collections at the HTTP layer (users, posts, sessions). Operations are verbs attached to those resources: get, create, update, delete, purgeTrash, sendEmail, schedule, list, restore, etc. Once you pick a verb for a given use case, you don’t rename it somewhere else. If the operation is “schedule a reminder”, that verb is schedule everywhere: in the REST operation id, in the core service, in the RPC method. There is never a place that calls it “createReminderJob” just because it’s a different file.

For REST boundaries, you always separate the path constants from the declarative contract. Versioning lives in code as a value, not as magic strings scattered across files. A minimal versioned path definition looks like this:

```ts
// boundary/v1/uris.ts
export const v1 = {
  health: "/health",
  users: "/users",
  posts: "/posts",
  reminders: "/reminders",
  notifications: "/notifications",
  views: "/views",
  oss: {
    bootstrap: "/bootstrap",
    gpg: "/gpg",
    script: "/script",
  },
};
```

Version objects are always named `v1`, `v2`, etc. Resource keys under them are lower-case and plural if they represent a collection (`users`, `posts`, `reminders`) or a stable singleton (`health` is fine). Nested groups like `oss` are just namespaces that logically cluster endpoints under the same base path. There is no trailing slash. All routes within that version must build their paths from this object. Nobody is allowed to hand-type `"/v1/posts"` in a random router.

Once paths exist, you define operation identifiers as the canonical API names. An operation id is the stable handle that all other layers align to. The pattern is `<resourcePlural><Action>` in camelCase for most operations. If your resource is `posts` and the operation is to purge the trash, the id is `postsPurgeTrash`. If the resource is `reminders` and the operation is to schedule one, the id is `remindersSchedule`. In some cases, when the resource is effectively a single thing (`health`) and the operation is obvious, you can use just the resource name as the operation id. That is a special case and should stay rare.

The HTTP contract is a mapping from operation ids to HTTP semantics:

```ts
// boundary/v1/contract.ts
export const contract = createContract(c)({
  health: {
    method: "GET",
    path: v1.health,
    strictStatusCodes: true,
    summary: "Health check",
    description: "Liveness probe for the API.",
    responses: healthSchemaResponses,
  },

  postsPurgeTrash: {
    method: "DELETE",
    path: v1.posts,
    strictStatusCodes: true,
    summary: "Purge trashed posts",
    description: "Permanently deletes posts currently in the trash bin.",
    headers: postsPurgeTrashHeadersSchemaRequest,
    responses: postsPurgeTrashSchemaResponses,
  },

  remindersSchedule: {
    method: "POST",
    path: v1.reminders,
    strictStatusCodes: true,
    summary: "Schedule a reminder",
    description: "Schedules a reminder with either an exact time or delay.",
    headers: remindersScheduleHeadersSchemaRequest,
    body: remindersScheduleBodySchemaRequest,
    responses: remindersScheduleSchemaResponses,
  },
});
```

Contract keys are operation ids and they are the single source of truth. If you ever have to guess what a schema or handler is called, you derive it from the operation id. You do not freehand names per file.

Boundary models are the typed shell around that contract. They live in `boundary/v1/models` and the folder layout mirrors the resource vocabulary: `_shared`, `health`, `users`, `posts`, `reminders`, `notifications`, `views`, and so on. Under each resource folder, you place one file per unique action, named in kebab case after the action part of the operation id. So `remindersSchedule` gets its models in `boundary/v1/models/reminders/schedule.ts`. `postsPurgeTrash` gets `boundary/v1/models/posts/purge-trash.ts`. There is no “posts-posts-purge-trash.ts”; the resource segment is already encoded by the parent folder.

Request schema naming is fully mechanical. Start with the operation id in camelCase and append the shape and role. Requests are always:

```ts
// operationId: remindersSchedule

export const remindersScheduleHeadersSchemaRequest = z.object({
  /* ... */
});
export const remindersScheduleQuerySchemaRequest = z.object({
  /* ... */
});
export const remindersScheduleParamsSchemaRequest = z.object({
  /* ... */
});
export const remindersScheduleBodySchemaRequest = z.object({
  /* ... */
});

export type RemindersScheduleHeadersRequest = z.infer<
  typeof remindersScheduleHeadersSchemaRequest
>;
export type RemindersScheduleQueryRequest = z.infer<
  typeof remindersScheduleQuerySchemaRequest
>;
export type RemindersScheduleParamsRequest = z.infer<
  typeof remindersScheduleParamsSchemaRequest
>;
export type RemindersScheduleBodyRequest = z.infer<
  typeof remindersScheduleBodySchemaRequest
>;
```

You can omit the shapes you don’t use, but you never rename them. It is always `<operationId><Headers|Query|Params|Body>SchemaRequest` for schemas, and `<OperationId><Headers|Query|Params|Body>Request` for types. Middleware-specific schemas like auth headers or rate-limiter headers live in `_shared` and follow the same pattern at that level: `authTokenHeaderSchemaRequest`, `AuthTokenHeaderRequest`, etc.

Response schemas are split in two layers: what the handler itself produces and what the client can actually see after middleware is accounted for. Middleware responses are usually shared pieces like `unauthorized`, `tooManyRequests`, `internalError`. They live in `_shared/responses.ts` and are grouped with a `SchemaResponse` suffix:

```ts
export const tokenAuthMiddlewareSchemaResponse = createSchemaResponses({
  401: httpErrorSchema.unauthorized().describe("Missing or invalid token"),
});

export const rateLimiterMiddlewareSchemaResponse = createSchemaResponses({
  429: httpErrorSchema
    .tooManyRequests()
    .describe("Too many requests in the current window"),
});

export const internalErrorSchemaResponse = createSchemaResponses({
  500: httpErrorSchema.internal().describe("Internal server error"),
});
```

For each operation id you define a private handler schema responses value and two public response types. The handler schema response value encodes exactly what the business logic for that operation can return, ignoring middleware. It is internal, so you prefix it with double underscore and keep it lower camelCase. The handler type is exported with a `HandlerResponses` suffix. The full schema responses value merges middleware and handler and is exported as `<operationId>SchemaResponses`. The full response type is exported as `<OperationId>Responses`.

```ts
const __remindersScheduleHandlerSchemaResponses = createSchemaResponses({
  201: z.object({
    created: z.discriminatedUnion("type", [
      z.object({
        type: z.literal("at"),
        id: z.string().min(1).max(255),
        at: isoDateTimeSchema,
      }),
      z.object({
        type: z.literal("delay"),
        id: z.string().min(1).max(255),
        delay: z.number().int().positive(),
      }),
    ]),
  }),
  502: httpErrorSchema.upstream().describe("Upstream scheduler error"),
});

export const remindersScheduleSchemaResponses = createSchemaResponses({
  ...rateLimiterMiddlewareSchemaResponse,
  ...tokenAuthMiddlewareSchemaResponse,
  ...__remindersScheduleHandlerSchemaResponses,
});

export type RemindersScheduleHandlerResponses = InferResponses<
  typeof __remindersScheduleHandlerSchemaResponses
>;

export type RemindersScheduleResponses = InferResponses<
  typeof remindersScheduleSchemaResponses
>;
```

Once a team learns this shape once, they can reconstruct any name without asking anybody. That is the point.

The boundary functions are the thin edge that actually implements the contract. They live under `boundary/v1/functions`. Folder layout again mirrors resources. Under each resource folder, there is one file per action, and a small `index.ts` that builds a resource object. Naming is straightforward: the file is named in kebab case after the action, and it exports a function whose name is the action part in camelCase. The index exports a single object named after the resource plural, which groups all actions.

```ts
// boundary/v1/functions/reminders/schedule.ts
export async function schedule(input: {
  body: RemindersScheduleBodyRequest;
  headers: RemindersScheduleHeadersRequest;
}): Promise<RemindersScheduleHandlerResponses> {
  // call ReminderService.remind and map core output to handler responses
}

// boundary/v1/functions/reminders/index.ts
import { schedule } from "./schedule";

export const reminders = {
  schedule,
};
```

At this layer you never name things `remindersSchedule` again, because the object name already carries the resource. You call `reminders.schedule(...)`, not `reminders.remindersSchedule(...)`. The operation id exists at the contract and router level, not inside the functions.

The HTTP router binds contract, middleware, and functions together. Its object keys are exactly the operation ids from the contract. It does not introduce new names, it only wires things. The pattern is always the same:

```ts
export const router = createRouterWithContext(contract)<Context>({
  health: async () => await health.check(),

  remindersSchedule: middleware()
    .use(
      rateLimiter({
        kind: "quota",
        limit: { every: "10s", hits: 2 },
      }),
    )
    .use(authed())
    .route(contract.remindersSchedule)(
    async ({ body, headers }) => await reminders.schedule({ body, headers }),
  ),

  postsPurgeTrash: middleware()
    .use(
      rateLimiter({
        kind: "interval",
        limit: { every: "4s" },
      }),
    )
    .use(authed())
    .route(contract.postsPurgeTrash)(async () => await posts.purgeTrash()),
});
```

Every router entry is “operation id → middleware chain → function call”. The handler function returns the `HandlerResponses` type for that operation. The router plus middleware layer is responsible for producing the full `Responses` type.

Inside the core, the vocabulary simplifies and drops transport concerns. The core speaks in terms of entities, DTOs, ROs, mappers, query-helpers, and services. Entities are your nouns again: User, Post, Session, Reminder, Notification, View, Oss, Newsletter, Tenant, whatever. DTOs are input shapes. ROs are output shapes. They use Zod schemas as the single source of truth for structure, and you infer runtime types from them.

DTO schemas are always named `<entity><Action>SchemaDto` and DTO types are `<Entity><Action>Dto`. Entity is singular PascalCase in the type name and lower camelCase at the schema level. Actions are verbs or verb phrases that describe what the caller is doing. For example, a typical user model DTO file looks like:

```ts
export const userLoginSchemaDto = z.object({
  email,
  password: passwordSchema,
});

export const userRegisterSchemaDto = userLoginSchemaDto.extend({
  name: z.string().min(2).max(30),
});

export const userChangePasswordSchemaDto = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
});
// additional refinements...

export type UserLoginDto = z.infer<typeof userLoginSchemaDto>;
export type UserRegisterDto = z.infer<typeof userRegisterSchemaDto>;
export type UserChangePasswordDto = z.infer<typeof userChangePasswordSchemaDto>;
```

Reminders DTOs do the same thing, even when they are more complex, with discriminated unions:

```ts
export const reminderSendEmailNotificationSchemaDto = z.object({
  schedule: z.discriminatedUnion("kind", [
    // at / delay branches...
  ]),
  headers: z.record(z.string(), z.string()),
  url: z.string().url(),
});

export type ReminderSendEmailNotificationDto = z.infer<
  typeof reminderSendEmailNotificationSchemaDto
>;
```

RO schemas describe the views of your data that leave the core, usually after some mapping or aggregation. Their naming is `<entity><View>SchemaRo` and `<Entity><View>Ro`. The “view” part is free text that describes what slice of the entity you’re returning: Card, Article, Detailed, Summary, AdminList, etc. The types mirror the schemas:

```ts
export const postCardSchemaRo = z.object({
  slug,
  title,
  tags,
  category,
  summary,
  firstModDate: z.date(),
  minutesToRead: z.union([z.string(), z.number()]),
  views: z.number().default(0),
});

export const postArticleSchemaRo = postCardSchemaRo.extend({
  isReleased: z.boolean(),
  lastModDate: z.date(),
  fontMatterMdxContent: fontMatterMdxContentSchemaRo,
});

export type PostCardRo = z.infer<typeof postCardSchemaRo>;
export type PostArticleRo = z.infer<typeof postArticleSchemaRo>;
```

Shared primitives live under a `models/shared` module and are always short lower camelCase schema names like `id`, `email`, `slug`, `token`. These primitives get reused everywhere to avoid subtle divergence. Enums are named `<Entity><Something>Enum` and live alongside their entity models when they are domain-specific, or in shared modules when truly global.

Mappers are the translation layer between persistence payloads and ROs. Their naming is `<Entity>Mapper`, and methods are always `to<Something>Ro`, where `<Something>Ro` is an existing RO type. They never guess shapes, they always return types derived from schemas. A mapper is allowed to know about database-specific representations but it never leaks Prisma types outside.

```ts
export class PostMapper {
  public static toCardRo({ post }: { post: PostCardQuery }): PostCardRo {
    return {
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      firstModDate: post.firstModDate,
      minutesToRead: post.minutesToRead,
      tags: post.tags,
      views: post.viewsCount,
      category: this._mapCategory({ category: post.category }),
    };
  }

  public static toArticleRo({
    post,
    fontMatterMdxContent,
  }: {
    post: PostArticleQuery;
    fontMatterMdxContent: FontMatterMdxContentRo;
  }): PostArticleRo {
    return {
      ...this.toCardRo({ post }),
      lastModDate: post.lastModDate,
      isReleased: post.isReleased,
      fontMatterMdxContent,
    };
  }
}
```

Query helpers live next to mappers and models. They normalize how you talk to your ORM. The class is `<Entity>QueryHelper`. Methods describe the selection, included relations, and generic where clauses. Types that represent ORM results are named `<Entity><View>Query`. This keeps the mapping from database structures to ROs explicit and strongly typed.

```ts
export type PostCardQuery = Prisma.PostGetPayload<{
  select: ReturnType<typeof PostQueryHelper.cardSelect>;
}>;

export class PostQueryHelper {
  public static cardSelect() {
    return {
      slug: true,
      category: true,
      tags: true,
      title: true,
      summary: true,
      firstModDate: true,
      minutesToRead: true,
      viewsCount: true,
    } satisfies Prisma.PostSelect;
  }

  public static whereReleasedToPublic() {
    return {
      isReleased: true,
      firstModDate: { lte: new Date() },
    } satisfies Prisma.PostWhereInput;
  }
}
```

Services are the actual core entry points. They carry the domain behavior. Their names are always `<Entity>Service` or `<Domain>Service` when an aggregate spans multiple entities. Methods read like real operations: `getPublicCards`, `getDetailed`, `create`, `update`, `trash`, `restoreFromTrash`, `trackView`, `remind`, `sendNotification`, `enableTwoFactor`, etc. They take DTOs as input, they return ROs wrapped in your error-handling abstraction (e.g. `runyx`-style `ok/err` pipelines). They never talk about HTTP or RPC concepts. No status codes, no headers, no query params in their names. Only domain language.

Each service carries a `serviceTag` constant that is equal to the class name. Error tags are always formatted as `"<ServiceTag><FailureName>"`, never as generic `"DatabaseError"`. That guarantees globally unique tags and makes logs and metrics searchable.

```ts
export class PostService {
  private readonly serviceTag = "PostService";

  public async getPublicCards() {
    /* returns ok<PostCardRo[]> or err */
  }

  public async getDetailed({ slug }: { slug: string }) {
    /* returns ok<PostArticleRo> or err with tag PostServiceDetailedNotFound, etc */
  }

  public async purgeTrash() {
    /* returns ok<void> or err with tag PostServiceDatabaseFailure */
  }
}
```

The RPC layer sits on the side and simply reuses core. It can be tRPC, an in-house RPC router, GraphQL resolvers, whatever. The rules are the same. Routers are grouped by entity, named `<entityPlural>Router` at the module level or `rpc.<entity>` at the callsite. Procedure names are plain action verbs or verb phrases in camelCase. They accept DTO types as input and return RO types. They call services directly. They do not invent new words.

An example in a tRPC-like environment looks like this:

```ts
export const postsRouter = t.router({
  listPublicCards: t.procedure
    .input(z.void())
    .output(postCardSchemaRo.array())
    .query(async () => (await new PostService().getPublicCards()).unwrap()),

  getDetailed: t.procedure
    .input(postGetSchemaDto)
    .output(postArticleSchemaRo)
    .query(async ({ input }) =>
      (await new PostService().getDetailed({ slug: input.slug })).unwrap(),
    ),
});
```

From the frontend, the naming stays consistent: `rpc.posts.listPublicCards()` maps to `PostService.getPublicCards()` and returns `PostCardRo[]`. `rpc.posts.getDetailed({ slug })` maps to `PostService.getDetailed({ slug })` and returns `PostArticleRo`. There is no place where that operation suddenly becomes `getPost`, `viewPost`, or `fetchArticle`. One verb, one meaning, across the entire call chain.

The pipeline from the edge to the core and back is now straightforward. Start with an operation id at the REST boundary, for example `remindersSchedule`. That id gives you:

A path constant `v1.reminders`.

Request schemas and types: `remindersScheduleHeadersSchemaRequest`, `RemindersScheduleHeadersRequest`, `remindersScheduleBodySchemaRequest`, `RemindersScheduleBodyRequest`.

Response schemas and types: `__remindersScheduleHandlerSchemaResponses`, `RemindersScheduleHandlerResponses`, `remindersScheduleSchemaResponses`, `RemindersScheduleResponses`.

A function entry point: `reminders.schedule`, living in `boundary/v1/functions/reminders/schedule.ts`, returning `RemindersScheduleHandlerResponses`.

A router key: `remindersSchedule`, which wires contract, middleware, and `reminders.schedule(...)`.

At the core you have a DTO and RO pair: `reminderSendEmailNotificationSchemaDto` and `ReminderSendEmailNotificationDto` on the input side, `reminderSendEmailNotificationSchemaRo` and `ReminderSendEmailNotificationRo` on the output side. The service method is `ReminderService.remind`, which accepts the DTO and returns the RO wrapped in your error-handling type. An RPC router can expose `rpc.reminders.scheduleEmailNotification`, which just calls `ReminderService.remind` and returns `ReminderSendEmailNotificationRo`.

Every layer is aligned on the same few names: Reminder, schedule, Notification. You can add more transports later (CLI, message queue consumers, background jobs) and each of them can just reuse the same DTOs, ROs, and services. You are not forced to re-derive logic from raw ORM calls in each entry point.

There are a few hard constraints that keep this whole thing from drifting. You never embed versioning in core names. `PostService`, `PostCardRo`, and `postCardSchemaRo` are versionless. Versioning is only a boundary concern. If you introduce a `v2` REST boundary, you create `boundary/v2` with its own `uris`, `contract`, `models`, and `functions`, but you still try to reuse the same core services and models as long as the domain meaning has not changed.

You never put transport words into core names. No “Http”, “Rest”, “GraphQL”, “Trpc” in DTO or RO names. Those are different projections of the same domain, not different concepts.

You never have two different names for the same operation in different layers. If the core method is `getDetailed`, then every external projection that represents that operation should also be `getDetailed`, maybe namespaced by resource. You do not call it `getPost`, `getPostBySlug`, and `viewPost` in three different routers.

You do not hide generic types behind vague names. DTO suffixes (`Dto`), RO suffixes (`Ro`), schema suffixes (`SchemaDto` and `SchemaRo`), handler suffixes (`HandlerResponses`), and full response suffixes (`Responses`) all exist to tell you exactly what you are looking at. Learn them once and everything becomes predictable.

Finally, you treat the naming rules as part of the public API. A new engineer should be able to open this RFC, see one operation id, and mechanically derive file names, type names, class names, and function names for any new resource and operation without asking anybody what is “idiomatic”. That is what makes this evergreen. The actual domain nouns will change per project, but the skeleton stays the same.
