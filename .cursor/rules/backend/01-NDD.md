Most teams build software like they are decorating an apartment they secretly plan to abandon in a year.

They pick a framework, follow whatever folder structure the docs suggest, wire some controllers, talk directly to the database, throw in a queue, and hope the whole thing magically turns into a “platform” later. Six months in, nobody knows what talks to what, the database is shared by everything, and changing one line of code feels like kicking a hornet nest. Every new feature is “quick” in theory and a slow-motion disaster in practice.

Napoleon-Driven Development is a direct attack on that entire style of thinking.

It is what happens when you stop treating frameworks as gods, stop treating the codebase as a single object, and start running your company like an empire made of sovereign domains. Each domain has its own army, its own land, and its own law. The only thing they all agree on is a set of treaties: typed contracts, shipped as SDKs. Everything else is free to change.

The goal is simple: you should be able to replace a framework, rewrite a whole domain, or split a monolith into separate services without begging the entire company for permission, without global migrations, and without side effects you only discover at 3 a.m. on a Saturday.

That is Napoleon-Driven Development: a way to design systems so that you can win campaigns, not just ship endpoints.

## Frameworks are not your boss

The starting point for NDD is very boring and very violent: frameworks have no authority over how you shape your system.

They are adapters. They are not the architecture.

You do not build your company around “Next”, “Nest”, “Rails”, “Django”, or whatever the hype cycle is serving today. You build your company around domains. Identity, billing, posts, notifications, search, health, analytics. Real pieces of reality you could, in theory, give to a separate team and let them run like a mini business.

The framework’s job is to stand at the edge and translate HTTP, WebSockets, queues, cron, or CLI arguments into a typed contract, then pass that into your domain. That is it. It does not get a vote on the shape of your models, your services, your invariants, or your boundaries.

If tomorrow you decide that your main API is no longer Next.js but some custom Rust gateway, the contracts should stay the same and everything should keep working. You swap the adapter, not your entire mental model.

If tomorrow you want to experiment with a different stack for one domain, you should be able to do that inside that domain, behind the same contract surface, without anybody else caring.

Napoleon-Driven Development assumes, from day zero, that you will change frameworks, change storage engines, and change infrastructure. The system must be built so that nothing meaningful breaks when you do.

## The frontier is boring, the empire is not

Outside, the world should only see one thing.

`api.acme.com`.

A single public face. Whether your actual product is a mobile app, a web dashboard, a public API, some CLI, or all of them at once does not matter. The consumer does not care which internal service is doing what. They want one front door that always works.

In NDD, that front door is a dumb gateway on purpose. Its job is to:

1. Authenticate the caller.
2. Validate the input using contract DTOs.
3. Enforce limits and quotas.
4. Call the correct domain SDK.
5. Validate the output and send it back.

That is it.

No business logic. No cross-domain orchestration. No “we will just quickly stick this rule here in the middleware for now”. The gateway is border control, not the general staff.

All the interesting work happens behind that border, inside domains.

## Domains as sovereign units

Now the fun part.

In Napoleon-Driven Development, each domain is its own little country. It has:

- Its own codebase or folder.
- Its own database, cache, queues, and background workers.
- Its own CI, release rhythm, and on-call rotation.
- Its own internal topology.

If the domain is “identity”, that one unit owns logins, signups, sessions, password resets, multi-factor, access tokens, fraud checks, user bans, device history, everything. No other domain touches its database. No other domain reaches into its internals. They talk to it the same way an external customer would talk to your API: through a typed surface.

Inside a TypeScript ecosystem, that surface is a versioned SDK. Something like:

`@acme/core/identity`

That package exports DTOs, response objects, and actual callable functions. It might be talking to a local in-process implementation in your monorepo. It might be talking over HTTP to a separate service. It might be talking to some gRPC demon in the basement. Nobody cares. The treaty is stable: inputs, outputs, and error shapes.

This is domain sovereignty. A domain owns its data, its invariants, and its errors. No one else can bypass that by hitting its tables or queues directly. If you want to ask Identity a question, you go through Identity’s SDK.

You know what that buys you? The ability to grow without dragging every domain into the same mud pit.

## The “spin it out” identity story

Imagine you start small. One repo, one app, one database. You follow NDD rules anyway. So instead of sprinkling user logic everywhere, you create a small “identity” domain inside your monolith.

You give it a shape:

- Identity models, DTOs, and response objects.
- Identity services with pure logic.
- Identity mappers between database rows and response objects.
- Identity adapter files for HTTP routes, workers, whatever.

You export a tiny SDK from it and have your application call that SDK instead of reaching for the database directly. In your API routes, you do something like:

```ts
import { identity } from "@acme/core/identity";

const result = await identity.auth.login(ctx, dto);
```

You keep doing this for a while. Product grows, features ship, traffic increases. Over time, the identity logic gets heavier. Maybe you want a separate replica set, a separate database, or even a different runtime for it. You want it on its own infra.

If you did not follow NDD, this is usually where people suffer. They have user tables referenced everywhere. Foreign keys all over the place. Queries that embed business logic. Helpers that half live in controllers and half in services. Extracting identity becomes a year of painful migrations and scary PRs.

With NDD, the play is boring.

You create a new repo, or a new service under `identity.<region>.internal`. You implement the same SDK surface there. Same DTOs and response objects. Same function signatures, same error envelope. Internally you wire it to a new database. You run your migrations one time, cleanly, from the old database to the new one. You test the living daylight out of it.

Then, in the monolith, you flip where `@acme/core/identity` points.

Before, it imported a local implementation. After, it calls the external service installed through a private package. The rest of the application does not even know this happened. It still imports the SDK, still calls the same functions, still handles the same errors. You changed a world under their feet, but the treaty held and nobody panicked.

That is the entire point. You do not wait until things are enormous to start drawing borders. You draw the borders when it is small, so you can keep playing this move over and over as you grow.

## Fractals

The other core piece of NDD is shape.

The system must look the same at every level of zoom.

If I open `services/user.service.ts` in a tiny repo, and then I open a giant “identity” platform that powers five products, I should see the same kind of structure.

In NDD, every unit follows the same pattern:

- Contracts: DTOs for inputs, ROs response objects for outputs, explicit error shapes.
- Models: schema objects and inferred types used across the unit.
- Services: pure domain logic operating on the models.
- Mappers: pure functiontranslators between external shapes and output shapes.
- Adapters: thin layers that talk HTTP, queues, CLI, cron, or whatever.
- Versioned transports: a layer that maps versioned routes or RPC endpoints onto contract versions.

A “unit” can be a file, a folder, a package, a whole repo, or a multi-team domain. The important thing is that the shape keeps repeating.

This fractal structure is not aesthetic. It is survival.

If every domain is organized differently, every team needs a guide to enter each part of the system. If everything shares a shape, new engineers and future AI agents can land in any domain and find their way within minutes. Models here, services there, mappers here, adapters there. No guessing.

It is also what makes the spin-out story possible. If domains always look like this, then turning a folder into a repo is mechanical work, not a creative act.

## Contracts as treaties, types as law

If domains are countries, the contracts are treaties.

Contracts are not an afterthought, not “we will document this later”. They are the single shared truth between domains. Everything else is local.

A contract, at minimum, is:

- The input shapes you accept.
- The output shapes you return.
- The error shapes you promise to use.

In TypeScript, that usually means schema definitions that give you runtime validation and static types in one place. You export those from the SDK so callers can validate inputs and understand outputs without guesswork.

There are a few rules that turn this into something powerful.

Every external entrypoint into a domain validates the inputs against the contract DTOs. No raw JSON crosses into domain services. Every exit validates against the response objects. No half-baked objects leak out.

Contracts are versioned. If you need to break something, you create a new version. Old versions can stay online while consumers migrate. You do not secretly break shapes behind people’s backs.

Internal implementation details never leak into the contracts. Your database fields, your internal flags, your “temp_x” hacks stay behind mappers. The treaty is clean, the battlefield can be messy.

Naming is treated as law. Field names and type names are not random. They are public. Once they escape into other repos and teams, you will live with them for years. NDD forces you to treat that very seriously.

When you do this right, the contracts become living documentation. You do not need to read Notion pages or tribal Slack threads. You explore SDK types in your editor and you see everything that matters.

## The dumb, stateless gateway

Let us come back to the public gateway for a moment.

In most companies, the gateway is where complexity goes to hide. Authentication logic, authorization, input shaping, cross-domain orchestration, feature flags, AB tests, ad-hoc “temporary” checks, all jammed into middlewares and controllers. It works until it does not, and then nobody is brave enough to touch it.

In NDD, the gateway is intentionally dumb.

It does not:

- Store business data.
- Implement business rules.
- Reach into domain storage.
- Manage background jobs.

It only wires requests to domain SDK calls. It is stateless. That means you can scale it horizontally and globally without much thinking. It also means its blast radius is tiny. If you need to roll back a gateway change, you roll it back. The domains are untouched.

Versioning happens here too. You can have `/v1` and `/v2` mapping to different SDK versions. For example:

- `/v1` might use `@acme/core/identity@3.x`.
- `/v2` might use `@acme/core/identity@4.x`.
  (Notice how identity tells you if it had a breaking change through it's version)

Domains can release minor and patch versions freely, keeping their contracts intact. The gateway chooses when to bump its dependencies. If something breaks after a bump, you revert the dependency version. No cross-team fire drills.

**This is how you keep the frontier boring so the empire can do interesting things.**

## Human-friendly now, AI-native later

The last angle of NDD is not optional. It is the one that will matter most over the next decade.

Your codebase will not only be for humans.

If your system is built as one big framework-driven monolith with hidden state and implicit behavior, AI agents will be just as scared of touching it as your junior engineers are. Every change becomes risky. Every refactor is a gamble.

In NDD, domains are small universes with clear boundaries, strong typing, and explicit contracts. That is exactly the kind of environment where AI tooling can operate safely.

An agent can:

- Add new routes or handlers on top of existing DTOs and response objects.
- Swap an internal implementation while keeping the SDK contract intact.
- Propose refactors inside one domain without touching others.
- Help you split a folder into a separate repo by following conventions.
- Run migrations as coordinated contract version bumps instead of raw schema edits.

Humans set the rules. Agents do mechanical work inside those rules. That is the natural direction. NDD simply prepares the terrain for it.

You want to be the company where a handful of strong engineers and many agents can move fast without burning the system down. NDD gives you that by design.

## What you trade in to get this

Adopting Napoleon-Driven Development means you consciously give up certain habits.

You stop dumping everything into one big “shared” library that eventually becomes a dependency trap for the whole company. You stop letting different teams sneak into each other’s databases because you “just need this one field”. You stop centralizing more and more logic in the gateway because “it is easier if we do it in the middle”.

You also stop letting frameworks dictate your mental model. Next, Nest, Rails, Django, whatever. They are tools. They come and go. Your domains and contracts stay.

In exchange, you get:

- A single clean public face for all of your products.
- Domains with clear ownership and boundaries.
- Typed contracts that act as treaties inside the company.
- The ability to spin out domains into separate services without chaos.
- A codebase that is friendly to both humans and AI agents.

You build an empire of domains instead of one gigantic, fragile capital city.

## Short thesis

Napoleon-Driven Development is a domain-first, contract-centric way of building systems that are meant to survive success.

You treat domains as sovereign units. You treat contracts as the only shared truth. You treat frameworks and transports as adapters you can replace. You enforce the same internal shape everywhere so that growth is just repeating the pattern at a larger scale.

The gateway stays thin so the blast radius of change is small. Domains stay sovereign so teams keep their speed. Contracts stay strict so integration becomes predictable and boring.

Most architectures try to fight complexity by centralizing everything under one giant roof. NDD does the opposite. It draws hard borders, hands autonomy to strong units, and connects them through clear treaties. Every domain is an SDK. Every SDK is a promise. That is the whole game.

Once you see your system like that, you cannot unsee it.
