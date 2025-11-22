# Architecture

The core idea is simple. You do not start from endpoints, or tables, or pages. You start from domains. A domain is a slice of reality you could theoretically put into its own repo, give to its own team, and let them evolve it without asking permission from the rest of the system. Identity, billing, posts, notifications, health, search. Each of those is a domain. Whether you deploy them all from a single monorepo or split them into a hundred repos later is irrelevant. NDD says: design as if each domain is sovereign from day one. The repo shape is an implementation detail. The domain boundary is the truth.

Inside a domain, you do not think in terms of “controllers” and “routes” first. You think in terms of language. Every domain has a vocabulary: entities, actions, workflows. In identity, you have accounts, sessions, devices, credentials. In posts, you have posts, drafts, comments, feeds. NDD forces you to stabilize that vocabulary before you touch edge frameworks. The words you choose here will bleed into every other layer: into REST operation ids, into RPC procedures, into type names, into database schema names. If you name things lazily, the whole system rots. So NDD starts with a brutal commitment: naming is not decoration, naming is infrastructure. The naming manifesto gets its own chapter because the architecture literally hangs off it.

Once you accept that domains are the first-class citizens, you can stop arguing about microservices versus monolith. You can have one repo, one deployment artifact, and still run with clear NDD boundaries. In the monorepo flavor we are documenting here, you treat each domain as if it could be ejected into its own repo in a weekend. That means you do not freely reach across domains just because the import path is convenient. You respect the boundary even inside the same tree. You import through contracts, not through random file paths. You keep the mental discipline of independent domains even though everything currently lives under one roof.

NDD splits the world into a pure core and a set of bridges. The core is where the actual business lives. It holds your domain models, your services, and your rules. The core does not know what HTTP is, what gRPC is, what Next.js is, or what your queue broker is. The core can be executed in a test, in a worker, in a script, without any web server up. Around that core you build bridges: REST, RPC, CLI, schedulers, consumers. Each bridge is a thin layer whose only job is to translate from some external protocol into core calls and then back to a response. When you see the system this way, frameworks stop being central and start being adapters that can be swapped or versioned without touching your business rules.

NDD is fractal. The same pattern repeats at every scale. At the top, you have an organization with many domains. Inside a monorepo, you have many packages. Inside a package, you have modules and folders. At each scale you are doing the same thing: draw a boundary, define a vocabulary, define contracts, and then define bridges to reach in. The same idea that separates identity from billing at the domain level is the same idea that separates core services from REST handlers at the package level.

The core of a domain is deliberately boring. It is mostly services operating over models, plus whatever policies and helpers are needed to express the rules cleanly. In posts you might have a PostService that knows how to create, update, publish, archive, and purge posts. It knows nothing about transports. It takes data in, returns data out, gets domain errors, and that is it. If you ever feel like you need to put HTTP concerns into core, NDD is there to tell you no. Wrap it in a bridge. If you feel like you need to read headers inside the business logic, NDD is there to tell you that header parsing belongs in the bridge, not in the heart.

For REST, NDD is strict. REST is public. REST is where your external consumers live: other teams, external clients, SDKs, third party integrators. Public means you do not get to break people just because you were lazy. That is why NDD draws a hard line between core models and REST models. Even if they are identical on day one, REST models are their own layer. They live in their own package, under their own versioned folder, and they map to the core through functions, not through imports. When you change core, you decide whether REST v1 stays stable and you add REST v2 next to it, or whether you can safely evolve v1 in place. That decision is explicit, not accidental.

RPC in NDD plays a different role. It is not for random third parties. It is your internal wiring between frontend and backend, and sometimes between services. That means it can be closer to core than REST, more honest about domain shapes, and more forgiving about change. You can pipe the models directly through core since the consumers are under your control. NDD uses RPC as the main bridge for apps to talk to core without having to re-model everything in public REST shape. You do not let the frontend import core directly, you let it talk to RPC which then calls core, even if RPC & core model 1:1 at this point.

The frontend is intentionally treated as the weakest boundary. It is allowed to be messy, to evolve fast, to be replaced. NDD keeps it honest by forcing it to consume only what the backend exposes through contracts. If a React component needs posts, it does not import a PostService from core. It calls a posts RPC procedure or a REST client that is generated from the contracts, which returns a stable `RO` or `Responses` in case of REST. This makes it impossible for random UI code to reach into business logic and mutate invariants. It also lets you swap backend implementations without rewriting half your frontend, because the contracts are stable and the transport is abstracted away, indeed everything is abstracted away, and I mean literlaly everything, RPC can be modleed through tRPC or Effect RPC or gRPC, or whatever, it's a simple stupid adapter, the api.acme.com, can be deployed through lambdas, express, fasity, the frontend can use Next, react router, remix or blitz, DB can postgress, mySQL or even mongo abstracted through prisma, email service can be using resend or sendgrid under the hood & the core doesn't know and doesn't care, storage can be AWS or R2 or even other niche things, it just sees `storage` and it has methods on it and it uses, it, there's no repositories, because effectively everything is swappable, we use `runyx` to model error to achieve 100% observabilty & error handling for the ultimate UX/DX and speed, and security.

One important part of NDD is that it never hides where things live. The structure in code mirrors the mental model. A resource called posts will appear as a directory called posts under models, under functions, under any relevant adapter. Actions over that resource become files like create post, purge trash bin, get public posts. The contract id that shows up in OpenAPI starts with the resource name and then the unique action. The function that implements that action inside the functions package follows the same naming rule. Nothing is magic, and nothing is named randomly. If you know the resource and the action, you know where to go and what to call.

In the monorepo flavor, this is even more important because everything is visible. The temptation is always to say “it is all in the same repo, I can just import this model or reuse that type”. NDD deliberately resists that. You can import the identity domain from the posts domain for internal operations if you want, but when you start building public bridges you still enforce the same discipline: define the contracts at the edge, define the thin function wrappers, call the core or other domains through those. You are allowed to optimize ergonomics inside the monorepo, you are not allowed to dissolve domain boundaries.

When you zoom out, NDD is really just about respecting reality. In reality you have teams, domains, and language. You do not have “controllers” in the real world. You have identity people, billing people, product people, each with their own mental model and cadence. NDD puts that structure into code. It lets you start in a single repo and then gradually peel out domains into their own repos, their own databases, their own services, without rewriting everything. If your monorepo ever becomes a distributed system, you are already halfway there because the boundaries were respected from day one.

## Overview

for the core package, since everything is pipeed through her,e aming should be important
Now, since we model resources basically directly from the database, it's not about domains because domains are abstract concepts.
For example, if we have an identity domain, it's an abstract concept. There's nothing in a database called identity.
But in the database, we have posts, we have the posts stable, we have the account table, we have whatever the thing is to construct the thing that we call identity.
So, when it comes to schemas and others, we don't actually call identity. There's nothing called identity.
This is something semantically nice for us to understand. What we call the directly database schemas, we call the directly database tables.
So we have a post table, we have a new, for example, notification table, so on and so forth.

they map 1:1 to tables

Now, they map on a one, which means they model them directly, meaning that if a table is
parallel, which is a bad design, then the fucking schema becomes parallel.
But since we have a good design, our tables are always singular tables.
For example, it's not posts, it's posts.
So they'll model posts directly.
Now this differs from REST APIs because REST are weird because you have to convey resources
in some kind of manner, so the HTTP makes sense.
But when it comes to core packages, when it comes to RPC, when it comes to anything internal
that is now facing REST directly, it's supposed to be a modern directory that it is.

Now, DTO means data transfer object, which is anything that is input.
Now, RO, which is return object, or whatever you want to think about, which is an easy simple
concept to think about this stuff, we don't call everything DTO.
This is the basic idea.
Everything should be typed.
Now, the thing is RPC pipes directly from the core, or anything that is for a sentinel
protocol.
That way the RPC, whatever, if we're using for our own dashboard, if we're using for
own whatever, yes, pipe it directly from the core, we don't matter, okay, good.
But we have, whenever we import it for the friend ends or whatever, we have to import
the models directly from the RPC, we don't part the models from the core.
Core is only consumed at the boundary levels, at the protocol, HTTP levels is whatever the
fuck levels we needed to.
So the friend ends or whatever the fuck other consumer can not see the core, but the core
contains all the functionalities, and the core has a simple mechanism, and it grows normally.

Now let's talk about mappers. Basically mappers help us. They're basically pure functions, and I have to emphasize the factor of a bunch of pure functions.
They didn't do any weird outside effects. They just take a concept, they just take a schema, sorry, they just take a type,
an object that is raw. Whether that would be from an external API, that would be from our databases, that would be from a storage,
but whatever the fuck that comes in. Okay, it comes raw. We don't want to expose this thing to our external consumers or anybody, by that matter.
What we do is basically use mappers. Mappers should be named that entity mapper, okay? It's super simple name. There's nothing special about the mappers.
Now we make the a bunch of functions like to return object to whatever, for example, if you have a bunch of enums coming directly from Prisma,
or types of the database, then we have to map the shit to actual enums of types group. We can use real values in whatever the fuck we want to expose.
For example, let's just say we have an internal API, we deployed somewhere, which takes care of all the return stuff like tokens and secrets and headers and all this stuff.
You don't want to expose this to our main user, so what we do is we have to use mappers. So we do API calls, but then we use the mappers to basically get the session,
which is raw session, from an off-queer, which has all this unsafe bullshit, and then we make it to become a session return object,
which is a base session object we use everywhere, which contains simple stuff like ID created at, is expired, user agent, simple stuff like that.
We're happy to expose our friend. So our friend never sees the shit that we see from API.
So we only see return objects and DTOs. That's all they have to give a fuck about.
And even then, like they don't see anything extra, they just pipes the things that we expose explicitly from RPC and others.

prime exmaple

```ts
import type { SessionRo } from "../models";
import type { SessionAuthQuery } from "../query-helpers/session";

export class SessionMapper {
  public static toRo({ session }: { session: SessionAuthQuery }): SessionRo {
    return {
      id: session.id,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      isExpired: new Date(session.expiresAt) < new Date(),
      userAgent: session.userAgent ? session.userAgent : undefined,
    };
  }
}
```

Notice how if you look at the Session query, which is a hot raw one that we got from our own external service, which is deployed somewhere in a pod somewhere, returns unsafe data like the tokens, secretive stuff, IP address, things that we don't want to actually use and want.
So this is what this stuff does, and you can expose it to other people.

```ts
(alias) type SessionAuthQuery = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null | undefined | undefined;
    userAgent?: string | null | undefined | undefined;
    userId: string;
}
```

By the way, we can use mappers with other mappers to map the other step, which is super simple. Look at the stuff, for example.

```ts
export class UserMapper {
  public static toUserRo({
    user,
    session,
  }: {
    user: UserAuthQuery;
    session: SessionAuthQuery;
  }): UserRo {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
      updatedAt: user.updatedAt,
      image: user.image ?? null,
      role: this._mapRoleFromAuthQuery(user.role),
      twoFactorEnabled: user.twoFactorEnabled ?? false,
      session: SessionMapper.toRo({ session }),
    };
  }
```

Now with this setup, whenever we get the user, we know 100% that the user is coming clean.
There is nothing extra, there is no weird stuff going on.
We actually control what the front end is, what the external APIs do, because we trust
them.
If you look at the setup for it, here is an example of the user service, what it is doing.
As you can see, it is inside the class, right?
If you look at the class, we have a bunch of methods.
As you can see, we know we get user accession, which we use as a runner, of course, and then
we get the user and everything being synthesized correctly.
As you can see, we get the return object directly, which pipes directly to our RPC models and
show exactly how it pops together, our RPC, for example, because RPC is consumed to other

```ts
export class UserService {
  private readonly serviceTag = "UserService";
  private readonly authApiTag = "AuthApi";

  private readonly requestHeaders: Headers;
  constructor({ requestHeaders }: { requestHeaders: Headers }) {
    this.requestHeaders = requestHeaders;
  }
  // ... other methods
  public async getUserWithSession() {
    logger.info("Getting user with session");
    return runner(
      run(
        () => api.getSession({ headers: this.requestHeaders }),
        `${this.serviceTag}${this.authApiTag}GetSession`,
        { severity: "error", message: "failed to get session" },
      ),
    ).next((res) => {
      if (!res?.user) {
        return err({
          severity: "warn",
          tag: `${this.serviceTag}${this.authApiTag}InvalidSession`,
          message: "no user found in session",
        });
      }
      return ok<UserRo>(
        UserMapper.toUserRo({ user: res.user, session: res.session }),
      );
    });
  }
}
```

```ts
export const userRouter = router({
  me: publicProcedure()
    .input(z.void())
    .output(userSchemaRo.nullable())
    .query(async ({ ctx }) => {
      const r = await userService(ctx).getUserWithSession();
      return r.ok ? r.value : null;
    }),
```

```ts
export const userSchemaRo = z.object({
  id,
  email,
  createdAt: z.date(),
  updatedAt: z.date(),
  emailVerified: z.boolean().default(false),
  name: z.string().min(1).max(30).nullable(),
  image: z.string().min(1).max(4096).nullable(),
  role: z.nativeEnum(UserRoleEnum),
  twoFactorEnabled: z.boolean(),
  session: sessionSchemaRo,
});

// ========== Types ==========
export type UserRo = z.infer<typeof userSchemaRo>;
```

```ts
import type { Optional } from "typyx";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

import type { UserRo } from "@rccyx/api/rpc-models";
import { rpcClient } from "@rccyx/api/rpc-client";

export function useAuth(): {
  user: Optional<UserRo>;
  isLoading: boolean;
  logout: () => Promise<void>;
} {
  const router = useRouter();
  const { data: user, isLoading } = rpcClient.user.me.useQuery();
  const utils = rpcClient.useUtils();
  const logoutMutation = rpcClient.user.logout.useMutation();

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    await utils.user.me.invalidate();
    router.refresh();
  }, [logoutMutation, router, utils.user.me]);

  return {
    user: user ?? null,
    isLoading,
    logout,
  };
}
```

Now if you look at the RPC being pipe-thruer, this is how we see it, right?
If the RPC is just being an RPC being pipe-thruer directly as it is, and as you can see by using
our runner library, we can see we can take check the value if it's okay or not, we can
return it or null.
This way we have either the user schema or null, and as you can see, everything pipes
out together because the user schema is literally defined as this, so everything like literally
goes up to come and show you in a minute, there's no mistakes being made because we
model the stuff, we only use it once, and as you can see we also have inference of types,
so the type is being used somewhere else, and as you can see we have a hook and react
that allows us to do the same shit.
Look at the off, for example, look at react, for example, it doesn't have to understand
anything, we just pipe-start the RPC, gets this stuff, and uses this hook, now everything
is serializable, everything is safe, and we can pipe this thing in every word we never
needed for, this is a prime example of it, how the name is should be convenient.

Now if you look at the RPC being pipe-thruer, this is how we see it, right?
If the RPC is just being an RPC being pipe-thruer directly as it is, and as you can see by using
our runner library, we can see we can take check the value if it's okay or not, we can
return it or null.
This way we have either the user schema or null, and as you can see, everything pipes
out together because the user schema is literally defined as this, so everything like literally
goes up to come and show you in a minute, there's no mistakes being made because we
model the stuff, we only use it once, and as you can see we also have inference of types,
so the type is being used somewhere else, and as you can see we have a hook and react
that allows us to do the same shit.
Look at the off, for example, look at react, for example, it doesn't have to understand
anything, we just pipe-start the RPC, gets this stuff, and uses this hook, now everything
is serializable, everything is safe, and we can pipe this thing in every word we never
needed for, this is a prime example of it, how the name is should be convenient.

For example, here's an example for the React doing the user profile, which is simple profile,
uses a bunch of stuff, piping directly as it is.
There's nothing major, there's nothing crazy going on, it's all just code that makes absolute
sense at all times.
Simple React stuff, everything is serializable, no notice how everything coming up directly
the way we want it to be.

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@rccyx/design/ui";

import { logger } from "@rccyx/logger";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Loading,
  Separator,
} from "@rccyx/design/ui";

import { useAuth } from "~/app/hooks/auth";
import { rpcClient } from "@rccyx/api/rpc-client";
import { ChangePasswordForm } from "./components/ChangePasswordForm";
import { SessionsList } from "./components/SessionsList";
import { UserInfo } from "./components/UserInfo";

import {
  TwoFactorEnableCard,
  TwoFactorRevealSecretCard,
  TwoFactorVerifyTotpCard,
  TwoFactorBackupCodesCard,
  TwoFactorDisableCard,
} from "./components/TwoFactorBlock";

export function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const utils = rpcClient.useUtils();

  // Perform redirect as a side effect, not during render
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, router, user]);

  // While waiting for auth state or redirecting, show nothing/spinner
  if (!isLoading && !user) {
    return null;
  }

  if (isLoading || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      await utils.user.me.invalidate();
      toast.success("Logged out");
    } catch (error) {
      logger.error("Logout failed", { error });
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account</h1>
          <p className="text-muted-foreground text-sm">
            Profile, security, sessions, and two factor settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge appearance="outline" className="text-sm font-semibold">
            {user.role}
          </Badge>
          <Badge appearance="soft" className="text-sm font-semibold">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </Badge>
          <Button
            variant="destructive:outline"
            onClick={handleLogout}
            className="ml-2"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px,1fr]">
        {/* Sidebar like Supabase */}
        <Card className="h-max sticky top-4">
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
            <CardDescription>Quick info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <UserInfo user={user} />
          </CardContent>
        </Card>

        {/* Main content */}
        <div className="space-y-6">
          {/* Security */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Security</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <ChangePasswordForm />
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Sessions</CardTitle>
              <CardDescription>Manage signed in devices</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <SessionsList currentSessionId={user.session.id} />
            </CardContent>
          </Card>

          {/* Two Factor */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Two Factor Authentication</CardTitle>
              <CardDescription>
                Enable TOTP, verify codes, manage backup codes, or disable
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-6">
              {/* Enable first */}
              <TwoFactorEnableCard />

              {/* Management */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <TwoFactorRevealSecretCard />
                <TwoFactorVerifyTotpCard />
                <div className="md:col-span-2">
                  <TwoFactorBackupCodesCard />
                </div>
                <TwoFactorDisableCard />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

Now, I also noticed that in the other file, in this kind of case, right here, we just
have a crazy thing, which is look how everything pipes directly from the RPC models directly.
They never really see anything from the core, because RPC piped directly from the models.
They got piped.
So RPC piped directly from the core, but we don't know this as consumers, we just see
RPC, which is serialized, which is fully safe, which is fully good.
There's a prime example of this.
In the setup, everything is composable, and clear, and good.

```tsx
"use client";

import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "@rccyx/design/ui";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@rccyx/design/ui";

import type { UserChangePasswordDto } from "@rccyx/api/rpc-models";
import { userChangePasswordSchemaDto } from "@rccyx/api/rpc-models";
import { rpcClient } from "@rccyx/api/rpc-client";

export function ChangePasswordForm() {
  const form = useForm<UserChangePasswordDto>({
    resolver: zodResolver(userChangePasswordSchemaDto),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = rpcClient.user.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed");
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit: SubmitHandler<UserChangePasswordDto> = (data) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 sm:grid-cols-2"
        autoComplete="off"
      >
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  inputMode="text"
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  inputMode="text"
                  autoComplete="new-password"
                  placeholder="At least 12 characters"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  inputMode="text"
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="sm:col-span-2 flex justify-end">
          <Button
            type="submit"
            variant="default"
            loading={changePasswordMutation.isPending}
            className="min-w-36"
          >
            {changePasswordMutation.isPending ? "Saving…" : "Change password"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

Now going back to the name and convention now imagine we have a bunch of apps, right? We have mobile apps. We have
Store apps. We have other apps. Maybe you have a business dashboard for you know partners or whatever and each one of them actually
Is a different thing because sometimes you need to fetch more we get a fetch less even if you look at the for example
If you look at the posts
Let's just say we model some blog application of some sort which is a very simple blog applications
How we do this is basically maybe we have a post for to be shown on the mobile application
We have another one for the admin team admins are basically customer success people many oversee everything to always have the oversee fraud
They were see whatever so the fetching differs thus the schema should differ now again like the service should take care of everything
The server there's no other services for backends and different backends for different apps
No, everything comes from the same back in the same app. Okay from the core the user service takes care of everything from the mobile
The dashboards whatever in this case the example is simple because we have one simple
Application which is our dashboard right here for the editor as in you saw these examples
But I would you imagine if we have a fintech company, whatever we have an application for our users
We also have partners. We have many many apps now the user service or whatever post service whatever the fuck even payment service
Whatever service you use has to take care of all of these now the only thing that differs is basically the naming right?
The naming should be a little bit precise because we have to add something what the client which is an option not everybody need this and now but
As soon as you mount other
Basically backends or sorry other applications you have to mount the client
So we know exactly what the fetch because a post being consumed from a mobile application is not the same for example
The user when they let's just say we have a fintech company, right and we want to see
basically the current the current I don't know bro, what's we call that shit. Let's say a
Super simple thing like maybe that would be
Like transactions if it's a mobile application you're gonna have to give them the exact rule of transactions and everything
You should just own the five days transaction you have to put every weird-ass thing from fucking model everything
You don't have to show everything in a simple transaction. You don't have to give full transaction
So the transaction is going to be basically transaction get transaction
Mobile that differs slightly from transaction get transaction
Dashboard because the dashboard differs because the transaction has to show more data, you know what I mean?
I'm talking about the single entity and not talking about rendering the database. I'm not talking about pagination or other shit
Not talking about the single entity and this only matters when we have a cross applications, right?
We have it but the rule is this we don't actually create different backends for different applications deploying somewhere
No, no, no, they all call the same API being bridged through RPC protocols
Being bridged through whatever now imagine if the payment service got too big
Let's just like okay fuck the payment service now. Let's look at the simple service like the user, right?
We only have user service right now, right? So let's just imagine we add to a fa
We add a single sign on we add off of all the fucking providers
This the service will become a thought like a 10,000 line service. There's probably a bad design
So we try to break it down. We have off service. We have to a face service. We have whatever service
So effectively it's not really an end user service anymore. It's an identity service
Which is a huge class now the class grows even more to 20,000 even 30,000
Aligns it becomes a pain in the ass to keep this thing in a single repository
So what we do is basically go separate this thing that to somewhere else
But this somewhere else doesn't know it's called an identity
It thinks it's just a normal service has user service off service whatever
But we only export when SDK that says identity inside of it
So if you do the dot scheme on notation so identity dot user dot get or identity dot terminate sessions
That whatever you get the same stuff
So we model the thing the things as we just could use to model them the core package
But except now we get these things from an extra model repo and we just import the stuff
you know what I mean we import it as it is right and
For our main model repo which the the main server package which is API that act me calm
What we do is basically instead of just using the user service now or the identity service
Which used to be in my model repo
We do just install the SDK the other team and keep using the same shit as if nothing fucking changed because effectively there's nothing has changed
We have effectively made a microservice, but we don't even know it was a microservice. There's no Kafka
There's no streams. There's nothing the schemas are the same
We pipe the same shit. We pipe the same things going on RPC protocols could be in the same
Whatever the fuck it is boom done
Even if we grow out of too much and we have front end teams or back end teams
It's a super simple thing like hey guys add a different schema for this and tell us about it boom
They add it pipes directly to the RPC protocol
We bump the fucking version if you want to and then boom or if we actually can afford it
We can make a huge moderate boat and we can put everything in a moderate boat
But again people would probably hate this so it effectively should have you know different SDK
So we look in a port and such and so on and so forth and that basically solves a huge fucking problem
First of all, there's separation of concerns
I never talked about here that I use next JS or TRPC or whatever the fuck doesn't really matter what we use
Doesn't matter if you use express or not
We're just using our API's being piped through a bunch of boundaries and people use them
You can switch to express next
Fastify whatever the fuck we can do whatever now if you look at the identity
We can even use rusting it and then I'll not fucking monitor repo package
And we never give a fuck because whenever you use rust and we should just expose one simple SDK with a bunch of fucking
Inference, I mean even if we actually separate the stuff to a bunch of other things
Only what we have to do right now is not even use their own models and mappers basically or you know schemas or whatever
We could just see with inference and make our own with TRPC in a local fucking API package
And export this thing to our front ends and shit on our consumers and rest and all
But rest differs a little bit

now for naming shcmeas in the core

```ts
import { send } from "@acme/email";
import type { EmailNotificationCreateSchemaDto } from "../../models/notification";

export class EmailNotificationService {
  public static async sendNotification(input: {
    body: EmailNotificationCreateSchemaDto;
  }) {
    return send.notification.notify({
      to: input.body.to,
      title: input.body.title,
      subject: input.body.subject,
      type: input.body.type,
      messageMd: input.body.message,
    });
  }
}
```

Now, the name scheme as in the core is supposed to be super simple, okay?
There's nothing special about this shit, right?
So we basically start with entities because everything models databases.
We don't model REST APIs because we don't give a fuck and the core package doesn't even
know where it's going to be used.
It's just like imagine it as like a package you use anywhere.
It doesn't really give a fuck.
It uses something called storage which itself doesn't even know.
The storage can be CloudFlare, R2, S3, Marcel, Glob, whatever the fuck, it sees an object
called storage and it's also sees an object called database.
It sees an object called email, doesn't even give a fuck what an email is, doesn't use
a recent or whatever.
It doesn't care.
Just the core package that uses a bunch of other shit that is also extravagant.
The funny part about this, whatever, you can literally be factor of whole setups from
scratch, not even lose anything, right?
And what I mean by this, the core package uses a bunch of services, it itself doesn't
even know what it is.
Now there's a small thing we did right here which we used Prisma which is cool because
if we try to abstract the database, we will have to worry about repositories and try to
make all this bullshit about repositories and fucking try to do 50 fucking different
things at the same time which is unnecessary in my opinion, like bro, if you model your
database on a fucking, I don't know, on Postgres or Prisma or Postgres or MySQL or fucking
MongoDB or whatever the fuck, it doesn't matter because Prisma abstracts all the shit
for you.
So it's effectively repository for it.
That's why we use Prisma.
Or even just LORMs basically abstract to what a database.
So we can keep piping the same fucking function method without raw dog SQL or having to worry
about the database.
We can just go to the main database package and switch the fucking database and no one
would know.
Also, we can you go to the email package and switch the fucking email and no one would
have fucking known, right?
And this is how crazy the examples are.
And everything is being abstracted to a fractional units, right?
The email can also be a huge fucking service.
We use recent, we use whatever the fuck, it fall back, whatever else we have mappers and
dt, whatever the fuck we need for making an email work on all the setups.
But again, the court package just imports email from acne slash email and doesn't even
go fuck what's going on.
Also it imports database from DB, it doesn't even go fuck what DB is.
So these methods are cool, let's me use this shit.
So there's no repositories and no unnecessary asks dependency injection at the fucking boundaries
and shit.
No dependency injection being injected at the fucking boundaries, nothing, okay?
Everything is in the court.
The only dependency we need to inject is like context and shit, which is like RBC takes
care of or maybe rest takes care of.
These are all we needed for the boundaries.
Stuff like the court should not be injected database into the court, then the fucking
court.
Of course it also, which is just how the database already we don't know fucking inject to shit
into classes and shit.
Makes no sense, right?
Now also about growment stuff.
You see how the classes grow from a simple service to a fucking distributed service and
they also do not care what they use, right?
I'm sure a couple of examples by this.
Now if you look at example right here, we have an email service in the court, right?
Look at the shit.
Look how it actually just uses the email from whatever the fuck email it is, it doesn't
even care what an email is.
It imports email from accurate email, right?
It doesn't even know.
It actually imports a function called send.
This function send has a bunch of things like send notifications, sends whatever, send
whatever, send things.
It doesn't even care if we have API keys for it, doesn't even care actually if this thing
actually exists inside our modern people or exists inside of another SDK with its own
database with its own shit, doesn't even give a fuck this by the way, then the court package
called an email notification service.
As you can see pipes directly through the notification service, there's nothing special.
Same thing for the schedule, we have something called schedule, as you can see this example
that basically pipes things for the schedule as it is, like it doesn't know what schedule
it is, doesn't know what service it uses under the hood, doesn't know shit about shit,
it just uses a simple thing which is hey, there's something called schedule from our
ACME package, fucking import that shit and use it, no one giving fuck what it is, no
one knows what it is because it's called an ACME package.
It could be a different package, could be inside the modern people of ours, could be a different
team, could be a different SDK which is installed, it doesn't really matter, there's something
called ACME import this shit, boom, done.
Now in this case it's just more repository so it's RCC YX, but you can get the point,
you can just replace this thing with your fucking credit.
And as you can see it uses runners, so for example, the scheduler uses the normal JavaScript
ecosystem, meaning it throws examples, it throws shit up, fucking throws and doesn't,
now right here we have to actually serialize it using a runner package, so we know exactly
what happens, as you can see we have DTOs and ROs being mapped correctly, we also handle
all the cases of all the errors, so our mind becomes a result of type, now if you look
at the promise of the type function of the reminder or whatever, becomes a result type.

```ts
import { scheduler } from "@rccyx/scheduler";
import type {
  ReminderSendEmailNotificationRo,
  ReminderSendEmailNotificationSchemaDto,
} from "../../models";
import { ok, runner } from "@rccyx/runner";

async function remind({
  headers,
  schedule,
  url,
}: ReminderSendEmailNotificationSchemaDto) {
  if (schedule.kind === "at") {
    return runner(
      scheduler
        .headers({
          ...headers,
        })
        .schedule({
          at: {
            datetimeIso: schedule.at,
          },
          url,
          payload: JSON.stringify(schedule.emailNotification),
        }),
    ).next((res) =>
      ok<ReminderSendEmailNotificationRo>({
        id: res.messageId,
      } as const),
    );
  } else {
    const delayObjectNormalizer = () => {
      const value = schedule.delay.value;
      const unitMap = {
        days: { days: value },
        hours: { hours: value },
        minutes: { minutes: value },
        seconds: { seconds: value },
      } as const;

      return unitMap[schedule.delay.unit];
    };

    return runner(
      scheduler
        .headers({
          ...headers,
        })
        .schedule({
          delay: { ...delayObjectNormalizer() },
          url,
          payload: JSON.stringify(schedule.emailNotification),
        }),
    ).next((res) =>
      ok<ReminderSendEmailNotificationRo>({
        id: res.messageId,
      } as const),
    );
  }
}

export const ReminderService = {
  remind,
};
```

look at the type here, it's full yserialized to be safe with our RPC & REST setup and even the CLI, ready, so the scheduler can r cannot use the `runyx` implentation, if it does cool, pipe it too, else we serialize with teh runner so the boundaries know what's happing, our frontends know what's going on, & our REST consumers don't see ugly ass 500 server error all the time

```ts
function remind({
  headers,
  schedule,
  url,
}: ReminderSendEmailNotificationSchemaDto): Promise<
  RunResult<
    {
      id: string;
    },
    "SchedulerServiceExternalApiPublishFailure"
  >
>;
```

here's the schama

Now, these are just basically prime examples of how the naming should work.
As you can see, now Reminder's send notification schema is super simple because we only have
one dashboard.
We only have one thing, but I would imagine if something drifts, for example, if we have
a mobile application, if we have a dashboard for business and finance or whatever, we can
append something to it.
For example, Reminder sent email notification app or mobile schema DTO, or Business Dashboard
schema DTO, and things change, but in this case, it's a notification, so notifications
are across the board.
Things change that are not a lot, actually, people think a lot of things change, but
they don't.
Very, very little things can change, but if they do change, I just already showed you
how the naming should go when it comes to changing the names and schemas and shit.

```ts
import { emailNotificationCreateSchemaDto } from "../../models";
import { z } from "zod";
import { isoDateTimeSchema } from "./shared";

const reminderEmailNotificationSchemaDto =
  emailNotificationCreateSchemaDto.omit({
    to: true,
    subject: true,
  });

const withNotification = <T extends z.ZodRawShape>(shape: T) =>
  z.object({
    ...shape,
    emailNotification: reminderEmailNotificationSchemaDto,
  });

const scheduleAtSchema = withNotification({
  kind: z.literal("at"),
  at: isoDateTimeSchema,
});

const scheduleDelaySchema = withNotification({
  kind: z.literal("delay"),
  delay: z.discriminatedUnion("unit", [
    z.object({
      unit: z.literal("seconds"),
      value: z.number().positive(),
    }),
    z.object({
      unit: z.literal("minutes"),
      value: z.number().positive(),
    }),
    z.object({
      unit: z.literal("hours"),
      value: z.number().positive(),
    }),
    z.object({
      unit: z.literal("days"),
      value: z.number().positive(),
    }),
  ]),
});

export const reminderSendEmailNotificationSchemaDto = z.object({
  schedule: z.discriminatedUnion("kind", [
    scheduleAtSchema,
    scheduleDelaySchema,
  ]),
  headers: z.record(z.string(), z.string()),
  url: z.string().url(),
});

export type ReminderSendEmailNotificationSchemaDto = z.infer<
  typeof reminderSendEmailNotificationSchemaDto
>;
```

Now, as you can see, this is just in a core package.
Okay?
Core package doesn't give a fuck.
There's no rest.
There's no responses.
There's no nothing.
Nobody gives a fuck what's going on right here.
Nobody cares.
Nobody cares at all.
Because this package is just a core package which uses a bunch of other packages that
doesn't even know where the fuck they come from.
It just provides us with return objects, data transfer objects, and a pipes thing through.
And people would say, "Hey man, with DDD, you have to outshocked everything."
Which is yet.
We are outshocked.
We can see the scheduler right here is important, but we never know what the fuck they're coming
from.
You know, importing the scheduler from PACME/Scheduler, this means that it can be in our repository.
It can be in our moderator repo.
It can be a fucking external SDK with its own database, and its own team, and its own
CI, its own secrets, and its own everything with 30 fucking teams.
We don't fucking know.
We just import something called scheduler, and we have to fucking use it.
That's all we have to fucking do.
There's nothing special about this shit.
Very easy, very fucking easy.

```ts
// apps/api/src/boundary/rpc/routes/view/index.ts
import { publicProcedure } from "../../../../adapters/trpc/procedures";
import { router } from "../../../../adapters/trpc/root";
import { trackViewSchemaRo, trackViewSchemaDto } from "../../models";
import { ViewService } from "../../services";

export const viewRouter = router({
  trackView: publicProcedure({
    limiter: {
      hits: 5,
      every: "10s",
    },
  })
    .input(trackViewSchemaDto)
    .output(trackViewSchemaRo)
    .mutation(async ({ input: { slug }, ctx: { req } }) => {
      return new ViewService()
        .trackView({
          slug,
          request: req,
        })
        .then((r) => r.unwrap());
    }),
});
```

Now, have a look at this example right here.
Have a look at the view service, okay?
This is actually inside the RPC Pro calls.
This is actually inside the API, basically.
I'm sure you have the exact total structure.
Now, if you look at the view,
this thing pipes directly, so we take the DTR schema
and the RO schema from the models.
But if you look at the models from TRPC,
they're basically piping the fucking...
There's nothing in the models.

```ts
export * from "@rccyx/core/models";
```

So, as you can see, it just directly pipes through the core models.
Now, if you look, go back to the ARPC example.
So, everything is actually pretty much found.
We have track of Usuki Meditio, which is the entity name, then we append schema, then
dto, which is data transfer object, which is a zod, and then track schema dto.
Now, if you look at it, it just puts us exactly what we need.

```ts
// other ...
export const trackViewSchemaDto = z.object({
  slug,
});

// other ...
export const trackViewSchemaRo = z.object({
  total: z.number().int().nonnegative(),
});
```

Now notice how we basically have the entity, then a basically unique action of some sort
and then the DTO. Now if this was for mobile, for example, we can append mobile before this
schema, for example, becomes track view, mobile schema or or track view, business dashboard,
whatever schema or whatever the fuck, but it doesn't make semantic sense right here.
So we just keep it the same because again, we have simple dashboard.

```ts
import { db } from "@rccyx/db";
import { logger } from "@rccyx/logger";
import type {
  TrackViewDto,
  TrackViewRo,
  ViewWindowPurgeWithCutoffDto,
  ViewWindowPurgeWithCutoffRo,
} from "../../models/view";
import { ok, run, runner, runSync } from "@rccyx/runner";
import { fingerprint } from "@rccyx/security";

export class ViewService {
  private readonly serviceTag = "ViewService";
  public async trackView({
    slug,
    request,
  }: TrackViewDto & { request: Request }) {
    return runner(
      runSync(
        () => this._fingerprint({ slug, request }),
        `${this.serviceTag}FingerprintFailure`,
        {
          severity: "error",
          message: "failed to fingerprint",
        },
      ),
    )
      .next(() => {
        const bucketStart = new Date(
          Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            new Date().getUTCDate(),
            0,
            0,
            0,
            0,
          ),
        );
        return ok(bucketStart);
      })
      .nextAcc((fingerprint, bucketStart) =>
        run(
          () => this._trackViewTransaction({ bucketStart, fingerprint, slug }),
          `${this.serviceTag}DatabaseTransactionFailure`,
          {
            message: "failed to track view",
            severity: "error",
          },
        ),
      )
      .next(({ total }) => ok<TrackViewRo>({ total }));
  }

  private async _trackViewTransaction({
    bucketStart,
    fingerprint,
    slug,
  }: {
    slug: string;
    fingerprint: string;
    bucketStart: Date;
  }) {
    let total = 0;
    await db.$transaction(async (tx) => {
      const inserted = await tx.postViewWindow.createMany({
        data: { postSlug: slug, fingerprint, bucketStart },
        skipDuplicates: true,
      });

      if (inserted.count > 0) {
        const updated = await tx.post.update({
          where: { slug },
          data: { viewsCount: { increment: 1 } },
          select: { viewsCount: true },
        });
        total = updated.viewsCount;
        logger.info("New view tracked", { slug });
      } else {
        const existing = await tx.post.findUnique({
          where: { slug },
          select: { viewsCount: true },
        });
        logger.info("User already saw the post, no view to track", {
          slug,
        });
        total = existing?.viewsCount ?? 0;
      }
    });
    return { total };
  }

  private _fingerprint({
    slug,
    request,
  }: {
    slug: string;
    request: Request;
  }): string {
    const a = fingerprint(request);
    return slug + ":" + a.hash;
  }

  public async purgeViewWindowWithCutoff({
    cutoff,
  }: ViewWindowPurgeWithCutoffDto) {
    logger.info("Cleaning up the view window prior to: ", {
      cutoffDate: cutoff.toISOString(),
    });

    return runner(
      run(
        () =>
          db.postViewWindow.deleteMany({
            where: { bucketStart: { lt: cutoff } },
          }),
        `${this.serviceTag}DatabaseDeleteManyFailure`,
        {
          severity: "fatal",
          message: "failed to purge view window",
        },
      ),
    ).next(({ count }) => {
      if (count > 0) {
        logger.info("View window records purged successfully!", {
          deleted: count,
          cutoff: cutoff.toISOString(),
        });
      } else {
        logger.info("No record to purge, view window is clean", {
          cutoff: cutoff.toISOString(),
        });
      }
      return ok<ViewWindowPurgeWithCutoffRo>({ deletedCount: count });
    });
  }
}
```

Now if you're looking closely at the view service and you see the track of you
Everything is basically abstracted away. This is PDD. This domain-driven development. Nothing knows about anything else
The database is abstracted. Yes, we use Prisma. People would say hey you use Prisma, which means you're not using repositories
You don't want some bad shit. Now, let me explain Prisma is basically like a bad abstracted thing because how the fuck are you gonna switch from?
Usually people switch from between Postgres to fucking autorocus, conjure some shit
They don't fuckin switch the drivers and ORMs around. Even if the fuckin switch Prisma is so easy for us to make a fuckin repository for it
But we don't need it now because NDD basically states that you can start fresh and start small
You can start whatever but you're gonna be speedy
So I don't need all these fucking unnecessary asked repositories and shit. Now if you want a really refactor database
Guess what? It's so fucking simple
Just go to the exact places the database has been called that and just change that and guess what?
You probably don't even gonna make a full refactor because by the time you need a refactor
the core became so shallow we just uses a bunch of other SDKs so we go to those SDKs and
Chances are they themselves use a different database. So the whole motion about doing repositories is fucking useless in here
Now notice how the logger is also obstructed. What's the logger? You don't know?
You don't know if it's a console log, logtail, whatever the fuck you never really know and guess what?
Runner, Brennax by design is
Making everything becomes nice. Notice how everything is handled precisely and uniquely, right?
And at the same time every error 100% we have observability when it comes to the library itself
There's many features because there's many features about basically runnax
Handles observability 100% for us but any error that happens across the application the only the failing node will happen

Notice basically how security is abstracted, logarithmic is abstracted, even the runner
is abstracted.
I don't report the runner directly from the runnix, I actually make a wrapper around it
and use the wrapper.
So even if I change runnix or update a bunch of things, I don't just import things from
the base library, anyways.
Everything is like this.
So this is peak engineering at this point.
Notice how everything goes with each other.
Now if you focus on it, this same core package can actually be piped through a REST API endpoint.

```ts
// apps/api/src/boundary/v1/functions/views/purge-with-cutoff.ts
import type { ViewsPurgeWithCutoffHandlerResponses } from "../../models";
import { ViewService } from "@rccyx/core/services";

const retainDays = 2;
const oneDayInMs = 1000 * 60 * 60 * 24;

export async function purgeWithCutoff(): Promise<ViewsPurgeWithCutoffHandlerResponses> {
  return new ViewService()
    .purgeViewWindowWithCutoff({
      cutoff: new Date(Date.now() - oneDayInMs * retainDays), // compute cutoff per function run
    })
    .then((r) =>
      r.match({
        ok: () => {
          return {
            status: 204,
            body: undefined,
          };
        },
        err: {
          ViewServiceDatabaseDeleteManyFailure: (e) => {
            return {
              status: 500,
              body: {
                message: e.message,
              },
            } as const;
          },
        },
      }),
    );
}
```

Now, if you look at it, for example, let's have a look at this file.
It's the same service being piped to a different fucking organisms.
It's by being piped through RPC, and it's also being pressed.
So in this case, as you can see, the view is being purged with cutoff.
Now as you can see, we have a different DTO, though.
It's not even called a DTO right now, because we've not any DTO land.
And notice how we really are not importing any mappers or any dumb models from the main
package.
We're not importing anything from core.
This is the simple file.
We're not importing anything special from core, which is nothing.
We just use the core as directly as it is, the services as they are, and then we pipe
the shit through them.
We handle the errors because Renix allows us to not try catch 50 fucking times across
boundaries and shit.
Because the only error, short-circus example, what it is, there's no try catch.
There's no catch-and-do errors and there's no fucking weird-ass shit.
There's nothing weird about this stuff.
Alright?
This is the example.
This is what I mean.
Notice how it's called the views purged with cutoff and their responses.
And this goes to the other document where we talk about the naming convention.
You don't have to worry about this now.
But this is the example.
It takes only the handle responses.
It doesn't cater to the middle-wears for now.
It doesn't really give a fuck.
But if you look at it, if you look close.

```ts
import type { z } from "zod";
import type { InferResponses } from "ts-rest-kit/core";
import { createSchemaResponses } from "ts-rest-kit/core";
import {
  tokenAuthMiddlewareSchemaResponse,
  internalErrorSchemaResponse,
  rateLimiterMiddlewareSchemaResponse,
  noContentSchemaResponse,
} from "../_shared/responses";

import { tokenAuthMiddlewareHeaderSchemaRequest } from "../_shared";

/* ------------------------- Request Schemas ------------------------- */

export const viewsPurgeWithCutoffHeadersSchemaRequest =
  tokenAuthMiddlewareHeaderSchemaRequest.extend({});

export type ViewsPurgeWithCutoffHeadersRequest = z.infer<
  typeof viewsPurgeWithCutoffHeadersSchemaRequest
>;

/* ------------------------- Response Schemas ------------------------- */

const mw = createSchemaResponses({
  ...rateLimiterMiddlewareSchemaResponse,
  ...tokenAuthMiddlewareSchemaResponse,
});

const viewPurgeWithCutoffHandlerSchemaResponses = createSchemaResponses({
  ...noContentSchemaResponse,
  ...internalErrorSchemaResponse,
});

export const viewsPurgeWithCutoffSchemaResponses = createSchemaResponses({
  ...mw,
  ...viewPurgeWithCutoffHandlerSchemaResponses,
});

// the handler type is always exported while it's schema isnt
export type ViewsPurgeWithCutoffHandlerResponses = InferResponses<
  typeof viewPurgeWithCutoffHandlerSchemaResponses
>;
```

Notice how it actually caters to the middle-wears. If you look at the contract, if you look at the methods,
now look at the methods directly, you can see that we cater for the middle-wears, and we can also
cater for the handle responses. Now, the handle is supposed to only take the message of the handle
responses. And this thing basically has all the middle-wears that we have, and also have no
content schema response, internal error response, just in case something fucks up. And it has
everything we need, right? Look at this shit. Look at these errors, for example. Boom, let's just peek.

```ts
// apps/api/src/boundary/v1/models/views/purge-with-cutoff.ts
import { c } from "../../../../adapters/ts-rest/root";
import { createSchemaResponses, httpErrorSchema } from "ts-rest-kit/core";

export const okSchemaResponse = createSchemaResponses({
  200: c.noBody(),
});

export const noContentSchemaResponse = createSchemaResponses({
  204: c.noBody(),
});

export const tokenAuthMiddlewareSchemaResponse = createSchemaResponses({
  401: httpErrorSchema
    .unauthorized()
    .describe("Missing or invalid x-api-token"),
});

export const rateLimiterMiddlewareSchemaResponse = createSchemaResponses({
  429: httpErrorSchema
    .tooManyRequests()
    .describe("Exceeded the allowed window to make requests"),
});

export const internalErrorSchemaResponse = createSchemaResponses({
  500: httpErrorSchema.internal().describe("Internal failure"),
});

// ========== Types ==========
// none for these
```

Now, basically, notice in the REST APIs, everything differs from the core.
There's no DTO.
There's no mappers.
There's no ROs.
There's nothing.
We just pipe things directly from the core.
We don't care if the core pipes directly from a moderiibo, pipes directly from a single
SDK.
We don't give a fuck.
We just see something from the core and we get out of inference so we see exactly what's
going on and that's it.
We give people boundaries.
We give people expectations.
We say, hey, this is the handle response.
These are the things that are supposed to be responded to as a REST API.
Other than that, don't do it, right?
So if you look at it, this is the views purged with cutoff schema response.
It starts with the entity in plural, which is the resources because REST API is a model
with a plural.
You don't say slash post, you slash, slash posts, okay?
You don't say slash whatever.
You say slash the fucking entity itself, all right, but it models the entities because
we have a views entity.
We have a post entity.
We have whatever fucking entity.
this case it's actually implorable because it models the actual structure of the folder.

```ts
apps/api/src/
├── adapters
│   ├── trpc
│   │   ├── callers
│   │   │   ├── client
│   │   │   │   ├── client.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── provider.tsx
│   │   │   │   └── query-client.ts
│   │   │   ├── server
│   │   │   │   ├── index.ts
│   │   │   │   └── server.ts
│   │   │   └── trpc-url.ts
│   │   ├── context.ts
│   │   ├── middlewares
│   │   │   ├── auth
│   │   │   │   ├── authentication.ts
│   │   │   │   ├── authorization.ts
│   │   │   │   └── index.ts
│   │   │   ├── index.ts
│   │   │   ├── rl
│   │   │   │   └── index.ts
│   │   │   └── timing
│   │   │       └── index.ts
│   │   ├── procedures.ts
│   │   ├── root.ts
│   │   └── transformer.ts
│   └── ts-rest
│       ├── callers
│       │   ├── client
│       │   │   ├── client.ts
│       │   │   ├── index.ts
│       │   │   ├── provider.tsx
│       │   │   └── query-client.ts
│       │   └── server
│       │       ├── index.ts
│       │       └── server.tsx
│       ├── context.ts
│       ├── middlewares
│       │   ├── authed
│       │   │   └── index.ts
│       │   ├── global-setup.ts
│       │   ├── index.ts
│       │   └── rateLimiter
│       │       └── index.ts
│       └── root.ts
├── app
│   ├── auth
│   │   └── [...node]
│   │       └── route.ts
│   ├── layout.tsx
│   ├── monitoring
│   │   └── route.ts
│   ├── page.tsx
│   ├── rpc
│   │   └── [node]
│   │       └── route.ts
│   └── v1
│       ├── [...node]
│       │   └── route.ts
│       └── openapi
│           └── route.ts
├── boundary
│   ├── rpc
│   │   ├── index.ts
│   │   ├── models
│   │   │   └── index.ts
│   │   ├── README.md
│   │   ├── router.ts
│   │   ├── routes
│   │   │   ├── index.ts
│   │   │   ├── newsletter
│   │   │   │   └── index.ts
│   │   │   ├── post
│   │   │   │   └── index.ts
│   │   │   ├── user
│   │   │   │   └── index.ts
│   │   │   └── view
│   │   │       └── index.ts
│   │   └── services
│   │       └── index.ts
│   └── v1
│       ├── contract.ts
│       ├── functions
│       │   ├── health
│       │   │   ├── check.ts
│       │   │   └── index.ts
│       │   ├── index.ts
│       │   ├── notifications
│       │   │   ├── index.ts
│       │   │   └── push-email-notif.ts
│       │   ├── oss
│       │   │   ├── gpg.ts
│       │   │   ├── index.ts
│       │   │   └── scripts.ts
│       │   ├── posts
│       │   │   └── index.ts
│       │   ├── reminders
│       │   │   ├── index.ts
│       │   │   └── push-reminder.ts
│       │   └── views
│       │       ├── index.ts
│       │       └── purge-with-cutoff.ts
│       ├── index.ts
│       ├── models
│       │   ├── health
│       │   │   └── index.ts
│       │   ├── index.ts
│       │   ├── notifications
│       │   │   ├── index.ts
│       │   │   └── push-email-notif.ts
│       │   ├── oss
│       │   │   ├── index.ts
│       │   │   ├── requests.ts
│       │   │   └── responses.ts
│       │   ├── posts
│       │   │   ├── index.ts
│       │   │   └── purge-trash-bin.ts
│       │   ├── reminders
│       │   │   ├── index.ts
│       │   │   └── push-reminder.ts
│       │   ├── _shared
│       │   │   ├── index.ts
│       │   │   ├── requests.ts
│       │   │   └── responses.ts
│       │   └── views
│       │       ├── index.ts
│       │       └── purge-with-cutoff.ts
│       ├── router.ts
│       └── uris.ts
├── middleware.ts
└── root-uris.ts

51 directories, 81 files
```

I noticed how it stays at the boundaries because nothing knows about anything else.
It's just the same shit you've played over and over.
And there's a name and mechanism because I've outlined in the other file how to name a mechanism.
But basically the naming for REST APIs should model REST exactly.
As you can see, we modeled the middlewares, we've also modeled a response handler.
That's why you think it's this.
Because we have basically a simple contract which is a single source of truth.
And this contract never deviates.
Notice how everything is actually super simple.
Now if you look at the V1, the V1 is super simple.
There's nothing complex about it.
You know what I mean?
It's just saying, hey guys, we have a V1.
These are the basically methods we have.
There's operational IDs.

```ts
import { createContract } from "ts-rest-kit/core";
import {
  healthSchemaResponses,
  gpgQuerySchemaRequest,
  gpgSchemaResponses,
  thyxQuerySchemaRequest,
  thyxSchemaResponses,
  whisperQuerySchemaRequest,
  remindersPushReminderBodySchemaRequest,
  remindersPushReminderHeadersSchemaRequest,
  remindersPushReminderSchemaResponses,
  notificationsPushEmailNotifBodySchemaRequest,
  notificationsPushEmailNotifHeadersSchemaRequest,
  notificationsPushEmailNotifSchemaResponses,
  bootstrapQuerySchemaRequest,
  bootstrapSchemaResponses,
  viewsPurgeWithCutoffHeadersSchemaRequest,
  viewsPurgeWithCutoffSchemaResponses,
  postPurgeTrashBinHeadersSchemaRequest,
  postsPurgeTrashBinSchemaResponses,
  whisperSchemaResponses,
} from "../../boundary/v1/models";
import { v1 } from "../../boundary/v1/uris";
import { c } from "src/adapters/ts-rest/root";

export const contract = createContract(c)({
  remindersPushReminder: {
    method: "POST",
    path: v1.reminders,
    strictStatusCodes: true,
    summary: "Create a reminder",
    description:
      "Creates a reminder using the provided headers and body payload.",
    headers: remindersPushReminderHeadersSchemaRequest,
    body: remindersPushReminderBodySchemaRequest,
    responses: remindersPushReminderSchemaResponses,
  },

  notificationsPushEmailNotif: {
    method: "POST",
    path: v1.notifications,
    strictStatusCodes: true,
    summary: "Send a notification",
    description:
      "Dispatches a system notification using the provided headers and body payload.",
    headers: notificationsPushEmailNotifHeadersSchemaRequest,
    body: notificationsPushEmailNotifBodySchemaRequest,
    responses: notificationsPushEmailNotifSchemaResponses,
  },

  viewsPurgeWithCutoff: {
    method: "DELETE",
    path: v1.views,
    strictStatusCodes: true,
    summary: "Purge the view window from all posts",
    description: "Deletes temporary view window data from all posts.",
    headers: viewsPurgeWithCutoffHeadersSchemaRequest,
    responses: viewsPurgeWithCutoffSchemaResponses,
  },

  postsPurgeTrashBin: {
    method: "DELETE",
    path: v1.posts,
    strictStatusCodes: true,
    summary: "Purge trashed posts",
    description: "Permanently deletes all posts currently in the trash bin.",
    headers: postPurgeTrashBinHeadersSchemaRequest,
    responses: postsPurgeTrashBinSchemaResponses,
  },

  health: {
    method: "GET",
    path: v1.health,
    strictStatusCodes: true,
    summary: "Health check",
    description: "Simple liveness probe to verify the API is running.",
    responses: healthSchemaResponses,
  },

  bootstrap: {
    method: "GET",
    path: v1.oss.bootstrap,
    strictStatusCodes: true,
    summary: "Fetch bootstrap script",
    description:
      "Returns a raw text bootstrap script for initializing dotfiles setup.",
    query: bootstrapQuerySchemaRequest,
    responses: bootstrapSchemaResponses,
  },

  gpg: {
    method: "GET",
    path: v1.oss.gpg,
    strictStatusCodes: true,
    summary: "Fetch public GPG key",
    description: "Returns my armored public GPG key as plain text.",
    query: gpgQuerySchemaRequest,
    responses: gpgSchemaResponses,
  },

  thyx: {
    method: "GET",
    path: v1.oss.thyx,
    strictStatusCodes: true,
    summary: "Fetch thyx setup script",
    description:
      "Returns a raw text script for initializing the custom thyx login screen screen theme.",
    query: thyxQuerySchemaRequest,
    responses: thyxSchemaResponses,
  },

  whisper: {
    method: "GET",
    path: v1.oss.whisper,
    strictStatusCodes: true,
    summary: "Fetch Whisper setup script",
    description:
      "Returns a raw text script for configuring OpenAI's Whisper locally.",
    query: whisperQuerySchemaRequest,
    responses: whisperSchemaResponses,
  },
});
```

Notice how we just use directly this stuff, and everything is modeled automatically.
So now let's look at the names.
Now let's look at the first one.
So reminders push reminder.
What does that mean?
This is the operational ID in the open API schema supposed to be unique across the resource.
Now the path is V1 slash reminders.
It's not a huge ask, this fucking name and shit, it's not necessarily.
Now look at the headers.
Everything is unique.
So it starts with the resources name, which is in for some resources and not plural like
health or some weird shit, which is really rare, but usually we model things based on
our data.
So it's like reminders.
And then we have the unique action name, which in this case push reminder.
And then we have either header or body or path or whatever, right?
These are rest things, parameters, right?
And then we say schema requests.
And this is what it is.
These are the headers going to get passed.
And then the body, which is a schema request bot.
And we use these things also in functions that's the crazy fucking part.
People forget now responses are automatically mapped to the open API schema, right?

Supersimple v1, there's no /v1/posts/purge-somthing, no everything is one level clean, super clean, easy on `curl` request

```ts
export const v1 = {
  health: "/health",
  reminders: "/reminders",
  notifications: "/notifications",
  views: "/views",
  posts: "/posts",
  oss: {
    bootstrap: "/bootstrap",
    gpg: "/gpg",
    thyx: "/thyx",
    whisper: "/whisper",
  },
};
```

Now operational IDs actually correlate directly with the open API
So open API gets modeled directly as they are and we cater for the middlewares because many APIs forget their fucking middlewares
They don't tell people we give fucking rate limiting. They don't tell people we do this
This is automatically modeled through us and I'm gonna show you the handler for the API by the way

Now if you look at the functions that are being carried through these, they automatically
error out if we add a new operation and we don't actually model it.
See, we actually supposed to model everything that we have.
Now if you look at it, look at the function.
Look at the simple function that I've replied to you before.
We have a simple cutoff and this function gets used like this.

```ts
import { purgeWithCutoff } from "./purge-with-cutoff";

export const views = {
  purgeWithCutoff,
};
```

```ts
import { contract } from "../../boundary/v1/contract";
import { rateLimiter, authed } from "../../adapters/ts-rest/middlewares";
import type { TsrContext } from "../../adapters/ts-rest/context";
import { createRouterWithContext, middleware } from "ts-rest-kit/next";

import {
  health,
  oss,
  notifications,
  reminders,
  views,
  posts,
} from "../../boundary/v1/functions";

export const router = createRouterWithContext(contract)<TsrContext>({
  remindersPushReminder: middleware()
    .use(
      rateLimiter({
        kind: "quota",
        limit: {
          every: "10s",
          hits: 2,
        },
      }),
    )
    .use(authed())
    .route(contract.remindersPushReminder)(
    async ({ body, headers }) =>
      await reminders.pushReminder({ body, headers }),
  ),

  notificationsPushEmailNotif: middleware()
    .use(
      rateLimiter({
        kind: "quota",
        limit: {
          every: "10s",
          hits: 10,
        },
      }),
    )
    .use(authed())
    .route(contract.notificationsPushEmailNotif)(
    async ({ body }) => await notifications.pushEmailNotif({ body }),
  ),

  viewsPurgeWithCutoff: middleware()
    .use(
      rateLimiter({
        kind: "interval",
        limit: {
          every: "4s",
        },
      }),
    )
    .use(authed())
    .route(contract.viewsPurgeWithCutoff)(
    async () => await views.purgeWithCutoff(),
  ),

  postsPurgeTrashBin: middleware()
    .use(
      rateLimiter({
        kind: "interval",
        limit: {
          every: "4s",
        },
      }),
    )
    .use(authed())

    .route(contract.postsPurgeTrashBin)(
    async () => await posts.postsPurgeTrashBin(),
  ),

  bootstrap: async ({ query }) =>
    await oss.bootstrap({
      query,
    }),

  thyx: async ({ query }) =>
    await oss.thyx({
      query,
    }),

  whisper: async ({ query }) =>
    await oss.whisper({
      query,
    }),

  gpg: async ({ query }) =>
    await oss.gpg({
      query,
    }),
  health: async () => await health.check(),
});
```

Now if you look at the router, the router is super simple.
Now the router is just by just functions through.
And without completion, you can see all the operational IDs
in the methods.
Now example, this is a very, very simple example
that demonstrates this thing in action.
Look at it.
So we get the boundaries from functions.
These functions contain a bunch of infinite methods,
views, posts, notifications.
These things literally map directly
to the slash we have on the top.
It's not like view, or reminder, or whatever.
It's actually in plural, which means REST API semantics.
Rest is the only exception.
We use plurals for database and stuff like this.
It's the only exceptions.
The core, and the RPC, and others, they don't give a fuck,
because it just pipes shit through, you know what I mean.
But for here, if you do the dot notation,
we do auto-completion.
Now of course, we have another middleware.
We don't actually care if we use TS REST
to whatever the fuck we can switch these frameworks
in an instant, because we have the same shit.
We have the same semantics anyway.
Now look at it.
We have the rate limiter, which goes first.
And then we have the authorization,
which goes second, which is the, uses the example token.
And then we have the method.
In the very, very simple example,
we have the full constics injected it.
And whenever we add a new operation
without adding it to the fucking router,
we get an automatic TS error.
In this case, if you look at it,
the REST API is actually pretty much set up.
And what I mean by this is, if we wanna,
like if we can test the models,
we can mess the models for return objects and all that,
for the requests and headers and bodies and shit,
without ever making mistakes because we can just test them
and put them in a fucking bunch of files
for backwards compatibility, if something breaks,
then we fucking, we fucking make a new version V2 in it.

```ts
import type { PostsPurgeTrashBinHandlerResponses } from "../../models";
import { PostService } from "@rccyx/core/services";

export async function postsPurgeTrashBin(): Promise<PostsPurgeTrashBinHandlerResponses> {
  return new PostService().purgeTrash().then((r) =>
    r.match({
      ok: () => ({
        status: 204,
        body: undefined,
      }),
      err: {
        PostServiceDatabaseFailure: (e) => {
          return {
            status: 500,
            body: {
              message: e.message,
            },
          } as const;
        },
      },
    }),
  );
}

export const posts = {
  postsPurgeTrashBin,
};
```

Notice in this case, the bridging happens automatically.
We just pipe the things from the core.
Rest in the AC are just basically dumbass layers.
They don't know if they don't see shit.
They don't know anything.
They don't care.
And even the core is actually dumb as fuck anyway.
Because the core can use all these services.
It doesn't even care about.
This is what I mean by fractal points.
Which is what I mean by distributed systems.
Which is what I mean by automatically distributed
everything and just use the atom to dissect it.
The infinite fucking times and no fucking problems at all.
Look at the shit.
We have match, exhaustive fucking matching.
In this case, we get the post service.
The purse trash and whatever.
And then we get the post service from the fucking services.
If you look at it from the core,
he uses the same other things.
He uses the same stuff.
It abstracts everything.

### Naming for the core

#### Models

- Follow this naming convention for zod schemas and types
- `<entity><action/view><Client?>SchemaDto` for zod schemas
- `<entity><action/view><Client?>Dto` for the types of the dtos
- It can be a unique action, or a view of the entity
- now there's also the concept of a client (optional, may be empty), if we have many of our apps
- consuming the same resource but each need differnt fetching, or differen payloads
- then we introduce an optional client like MobileClient, WebClient, DashboardClient, PartnerClient
- these are basically apps our team uses, these are not made to be for external consumers, these are just for our team
- to fetch the correct payload of the correct thing at all times
- entity is the resource we are fetching, it can be a single entity or a collection of entities
- entities correlate to the database tables, and the resources we are fetching

#### Query Helpers

Now again, we don't use repositories because that would be a pain in the fucking ass.
And not necessarily.
Again, because since every team can literally abstract their way into infinity, we don't
have to worry about shared database and we can just use Prisma directly, fuck it.
And Prisma is not really called Prisma, it's called a database, right?
Well Prisma is good since it's already abstracted since we can use a bunch of other stuff.
Like MongoDB, Postgres, MySQL, whatever, right?
But each team, even if we have, let's just say the user service stops using fucking SQL
all together and they use their own repository for their own fucking to use Reddit, so whatever,
we don't give a fuck.
We just see a user service and we fucking use it.
I don't know for everything.
But let's talk about the query helpers.
Now query helpers is basically a helper that allows us to not repeat ourselves.
And here's a prime example.
As you can see, we get the raw stuff from the database and we start abstracting the things.
For example, trash article select, where we'll lease the public.
For example, why would we need, where we'll lease the public?
We might have, I don't know, like, fucking 300 fucking implications where we release the
public setups.
We don't have to keep every time remembering how we did it.
We can just use the setup as it is, we can just use it.
Another example would be a mapper from, not just a database, because mappers can basically
or query helpers basically can help us query everything from the external databases, external
services, external APIs.
In this case, we have an example where we have an eternal API server, which is actually
an API resting point, which basically is unsafe because this raw exposes user data, exposes
token sessions, bullshit like that, you know what I mean?
Unsafe data.
So now we need to map it.
And we need to use the query helper name, right?
This is where the query helper is.
It's basically super simple.
It's the entity plus fucking query or whatever fucking thing we need.

Naming is like `<Entity><view/action><Query>` for the raw queries that will piped through the mappers and call it
`<Entity>/QueryHelper` for the class holding all the helpers

primae example

```ts
import type { PostCategory as DbPostCategory } from "@rccyx/db/raw";

import type {
  FontMatterMdxContentRo,
  PostCardRo,
  PostArticleRo,
  TrashPostArticleRo,
} from "../models";
import type {
  PostCardQuery,
  PostArticleQuery,
  TrashPostArticleQuery,
} from "../query-helpers";
import { PostCategoryEnum } from "../models";

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
      category: this._mapCategory({
        category: post.category,
      }),
    };
  }

  public static toArticleRo({
    post,
  }: {
    post: PostArticleQuery;
    fontMatterMdxContent: FontMatterMdxContentRo;
  }): PostArticleRo {
    return {
      ...this.toCardRo({ post }),
      lastModDate: post.lastModDate,
      isReleased: post.isReleased,
      slug: post.slug,
      fontMatterMdxContent: {
        body: post.mdxText,
        bodyBegin: 0,
      },
    };
  }
  public static toTrashRo({
    post,
  }: {
    post: TrashPostArticleQuery;
  }): TrashPostArticleRo {
    return {
      category: this._mapCategory({
        category: post.category,
      }),
      title: post.title,
      summary: post.summary,
      tags: post.tags,
      mdxText: post.mdxText,
      deletedAt: post.deletedAt,
      originalSlug: post.originalSlug,
      firstModDate: post.firstModDate,
      lastModDate: post.lastModDate,
      wasReleased: post.wasReleased,
      id: post.id,
    };
  }

  private static _mapCategory({
    category,
  }: {
    category: DbPostCategory;
  }): PostCategoryEnum {
    switch (category) {
      case "HEALTH":
        return PostCategoryEnum.HEALTH;
      case "PHILOSOPHY":
        return PostCategoryEnum.PHILOSOPHY;
      case "SOFTWARE":
        return PostCategoryEnum.SOFTWARE;
    }
  }
}
```

Notice how Latinos even get serialized everything gets serialized we are 100% safe that whatever the fuck we get is actually super secure

```ts
import type { api } from "@rccyx/auth";

export type SessionAuthQuery = Awaited<
  ReturnType<typeof api.listSessions>
>[number];
```

Other example

```ts
import type { Prisma } from "@rccyx/db/raw";

export type PostCardQuery = Prisma.PostGetPayload<{
  select: ReturnType<typeof PostQueryHelper.cardSelect>;
}>;

export type PostArticleQuery = Prisma.PostGetPayload<{
  include: ReturnType<typeof PostQueryHelper.articleInclude>;
}>;

export type PostAdminQuery = Prisma.PostGetPayload<{
  include: ReturnType<typeof PostQueryHelper.adminInclude>;
}>;

export type TrashPostArticleQuery = Prisma.TrashPostGetPayload<{
  select: ReturnType<typeof PostQueryHelper.trashArticleSelect>;
}>;

export class PostQueryHelper {
  public static articleInclude() {
    return {} satisfies Prisma.PostInclude;
  }

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

  public static adminInclude() {
    return {
      ...this.articleInclude(),
    } satisfies Prisma.PostInclude;
  }

  public static whereReleasedToPublic() {
    return {
      isReleased: true,
      firstModDate: { lte: new Date() },
    } satisfies Prisma.PostWhereInput;
  }

  public static trashArticleSelect() {
    return {
      id: true,
      originalSlug: true,
      title: true,
      summary: true,
      firstModDate: true,
      lastModDate: true,
      minutesToRead: true,
      wasReleased: true,
      tags: true,
      category: true,
      mdxText: true,
      deletedAt: true,
    } satisfies Prisma.TrashPostSelect;
  }
}
```

#### Mappers

named as `<Entity>/Mapper`

and has method to serialize to `RO`s basically, where we het unsafe raw data & output it into a serialized format

prime example

Notice how, actually, all the services basically have to return a bunch of return objects.
You never return raw fucking data.
That's the whole purpose of a mapper.
You can do a bunch of shenanigans inside the method, and then when you try to get data back,
you have to serialize it.
We can call it serializer, but a mapper is good since it's literally a mapper.
It's a pure function.
Basically, all of these functions are simple, pure functions.
They don't do any side effects, they don't do any weird shit.

```ts
// packages/core/src/mappers/post.ts
import type { PostCategory as DbPostCategory } from "@rccyx/db/raw";

import type {
  FontMatterMdxContentRo,
  PostCardRo,
  PostArticleRo,
  TrashPostArticleRo,
} from "../models";
import type {
  PostCardQuery,
  PostArticleQuery,
  TrashPostArticleQuery,
} from "../query-helpers";
import { PostCategoryEnum } from "../models";

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
      category: this._mapCategory({
        category: post.category,
      }),
    };
  }

  public static toArticleRo({
    post,
  }: {
    post: PostArticleQuery;
    fontMatterMdxContent: FontMatterMdxContentRo;
  }): PostArticleRo {
    return {
      ...this.toCardRo({ post }),
      lastModDate: post.lastModDate,
      isReleased: post.isReleased,
      slug: post.slug,
      fontMatterMdxContent: {
        body: post.mdxText,
        bodyBegin: 0,
      },
    };
  }
  public static toTrashRo({
    post,
  }: {
    post: TrashPostArticleQuery;
  }): TrashPostArticleRo {
    return {
      category: this._mapCategory({
        category: post.category,
      }),
      title: post.title,
      summary: post.summary,
      tags: post.tags,
      mdxText: post.mdxText,
      deletedAt: post.deletedAt,
      originalSlug: post.originalSlug,
      firstModDate: post.firstModDate,
      lastModDate: post.lastModDate,
      wasReleased: post.wasReleased,
      id: post.id,
    };
  }

  private static _mapCategory({
    category,
  }: {
    category: DbPostCategory;
  }): PostCategoryEnum {
    switch (category) {
      case "HEALTH":
        return PostCategoryEnum.HEALTH;
      case "PHILOSOPHY":
        return PostCategoryEnum.PHILOSOPHY;
      case "SOFTWARE":
        return PostCategoryEnum.SOFTWARE;
    }
  }
}
```

the `to` method basiclaly map to a `<view/action><Client?>`
e.g: `toCardRo(...)` where card is a view, if it were to be a mobile car then `toCardMobileRo` and so on,

#### Services

Now, service is a pretty much very fucking simple.
There's nothing really that special about services.
They basically call entity plus service, that's it.

`<Entity><Service>`

And basically when services grow up and if you come to a game
Let's just say a file becomes maybe a thousand lines and you're like all right
You know what?
Let's break the huge service into sub services prime example of this because I love to always circle back to the identity example
Because identity is one of these things because you start off with a user service and then you say okay
Let's add to a fake. Okay, you know what? Let's add password reset. So we have a password service. Okay, you know what?
Let's fucking add our mom
Oh, let's add get out of Google and then this shit becomes too fucking big. It cannot be one fucking directory
It should be like a big-ass shit
And then you start reaching for other stuff and other mechanisms and other stuff and then you so you know what?
Let's put this into a separate package and call this thing identity
Right and they expose something called identity service
Then maps through the user service to a face service all service fucking what it like you can click on them with that
Auditation so example identity that user or identity that to a fade or identity that password or whatever, right?
And then you know what? Let's you know what?
Let's just think got too fucking big and not necessarily be you know what?
Let's put this thing into a separate SDK and import it as is
And just put this shit into a separate pository with its own database with its own mappers with its own architecture with its own bullshit
It's like a self-replicating organism that even that grows infinitely literally

```json
{
  "name": "@rccyx/core",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "clean": "git clean -xdf .cache .next .turbo node_modules",
    "format": "prettier . --write",
    "format-check": "prettier --check .",
    "lint": "pnpm run lint:ts ",
    "lint-all": "pnpm run lint:ts && pnpm run lint:md && pnpm run format && pnpm run lint:knip && pnpm run lint:spelling",
    "lint:knip": "knip --production --strict --exclude exports,nsExports,types,nsTypes",
    "lint:md": "markdownlint \"**/*.md\" --config=.markdownlint.json --ignore-path=.markdownlintignore",
    "lint:spelling": "cspell \"**\" \".github/**/*\"",
    "lint:ts": "tsc --noEmit; eslint ."
  },
  "author": "",
  "dependencies": {
    "@rccyx/analytics": "workspace:*",
    "@rccyx/auth": "workspace:*",
    "@rccyx/constants": "workspace:*",
    "@rccyx/cross-runtime": "workspace:*",
    "@rccyx/db": "workspace:*",
    "@rccyx/email": "workspace:*",
    "@rccyx/env": "workspace:*",
    "@rccyx/logger": "workspace:*",
    "@rccyx/monitor": "workspace:*",
    "@rccyx/newsletter": "workspace:*",
    "@rccyx/runner": "workspace:*",
    "@rccyx/scheduler": "workspace:*",
    "@rccyx/security": "workspace:*",
    "@rccyx/storage": "workspace:*",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@rccyx/eslint-config": "workspace:*",
    "@rccyx/prettier-config": "workspace:*",
    "@rccyx/tsconfig": "workspace:*",
    "@rccyx/vitest-config": "workspace:*",
    "@vitest/ui": "catalog:",
    "typescript": "catalog:",
    "typyx": "catalog:",
    "vitest": "catalog:"
  },
  "engines": {
    "node": "20.x"
  },
  "exports": {
    "./models": "./src/models/index.ts",
    "./services": "./src/services/index.ts"
  },
  "keywords": [],
  "license": "ISC",
  "type": "module"
}
```

and notice how the actual package of JSON of the court basically is the one
responsible for importing all the crazy-ass shit now if you look at it email can
literally be its own fucking team one we don't fucking know if it's in workspace
or not yeah right now it's in the modern repo but it can't be a whole fucking
team worry about the shit the newsletter can be a simple thing and then we come
weird-ass thing also security we can have a whole security fucking team bro but in
this case it's a super simple you know package shit in this fucking case but
again it's self-replicating itself in organization because the security can
thing can be a simple package as well as a huge fucking team taking care of
everything from API fucking checks to all kinds of security stuff hashing
encryption or rotating secrets and all this bullshit

like a full micro sass on it's own, where you just use it's SDK

```json
// apps/api/package.json
  "exports": {
    "./rpc-models": "./src/boundary/rpc/models/index.ts",
    "./rpc-client": "./src/adapters/trpc/callers/client/index.ts",
    "./rpc-server": "./src/adapters/trpc/callers/server/index.ts",
    "./rest-client": "./src/adapters/ts-rest/callers/client/index.ts",
    "./rest-server": "./src/adapters/ts-rest/callers/server/index.ts"
  },
```

Now notice how the actual API JSON exports only a couple packages and it
doesn't really import a bunch of shit because all the logic is basically inside
the fucking inside the core it doesn't import security doesn't import weird
as shit it just imports the core uses it directly and notice what it exports
it exports RPC models which themselves fight from the core RPC client who sees
these things are supposed to take care of the you know RPC bridging whatever and
then RPC server and whatever and then rest client and S server doesn't really
do anything special anything weird anything at all at all like it's it's
simple we can export our own SDK for external people using our SDK from a
rest client and people can use this like important thing from this company
act me and use the shit normally from fucking their own machines and shit
that's how crazy it gets

```ts
// apps/api/instrumentation.ts
import { logger } from "@rccyx/logger";
import { monitor } from "@rccyx/monitor";
import { observer } from "runyx";

export function register() {
  monitor.next.initializeServer();
  observer((error) => {
    const severity = error.meta?.severity;

    if (severity === "warn") {
      logger.warn(error.message, {
        tag: error.tag,
        meta: error.meta,
        cause: error.cause,
      });
      return;
    }

    if (severity === "fatal") {
      logger.fatal(error.message, {
        tag: error.tag,
        meta: error.meta,
        cause: error.cause,
      });
      monitor.next.captureException({ error });
      return;
    }

    logger.error(error.message, {
      tag: error.tag,
      meta: error.meta,
      cause: error.cause,
    });

    monitor.next.captureException({ error });
  });
}
```

Also just one note by the way, notice how observability is hooked in automatically. Notice how observability doesn't really depend on the fucking
Packages or the services or whatever now. I told you that runnix actually automatically pushes observability
Automatically through like all the errors 100% of the errors. It's it's done through an application start
So if you look at it through the API basically, which is one of the things we use
Everything gets piped through it, you know what I mean?
I
Notice how many instrumentation we basically have it done because we have it a server
Meaning that every error across all the microservices that we have across all of the other shit automatically gets piped through us
It automatically gets piped only once we only log once and with all the features of the runner
We've already lucky enough to have observability. There's no double error
There's no tri-cache 50 fucking times if something errors out
We know exactly what it is because of short circuits regardless of how many runners we use and how many runs we fucking have in shit
Nested or not. It's one of the small features of the library
But anyways, this is guaranteed to give us observability all the fucking times
You can do this if you use express for example
You can switch from instrumentation because in this kind of case API actually uses an xjs
So now we can switch it and boom we have a we have an observer and only
Express to and then and express and it works fine
It's just a slight example, but anyways services based on gun wrappers and they grow up to become huge repos
We don't give a fuck. We just import the shit

I'll give you another example. Now notice how in the core we actually have a newsletter
service but in the core we don't know what it's using. We just import something from
the Acme/newsletter and in this case it just works fine.

```ts
// packages/core/src/services/newsletter/index.ts
export { NewsletterService } from "@rccyx/newsletter";
```

Now notice how we don't actually know if we look at the core package again, this is what we have, right?
Now notice how in the lose letter we just export something from something called
our CCOX slash newsletter, which is basically acne slash newsletter. We don't know what
this newsletter is coming from. Is it coming from a repository? Is it coming from the
minority vote? Is it coming from an SDK? We don't give a fuck. Now if you look at the
newsletter right here, notice this. Notice this example. Newsletter actually uses a bunch of
stuff we don't have to give a fuck about in the core because the core is basically a dump
fucking abstracted later over a bunch of shit. It can start off as big of course,
as first as a normal startup. We have a bunch of things like users,
auth, whatever, and then we extract these things to its own package in a minority vote or we
push the shit to a separate SDK. There's no Kafka's between shim. We just call the SDK and shit works.
Notice how in the core package you don't actually implement the SDK right there. We don't actually
implement the API keys, the service, whatever. Notice how it's only separate in the package.
Notice this difference. It's very important because the core is supposed to also be a dump fucking layer.

```ts
// packages/newsletter/src/newsletter.service.ts
import { env } from "@rccyx/env";
import { logger } from "@rccyx/logger";
import { ok, run, runner } from "@rccyx/runner";
import { Kit } from "@anthonyhagi/kit-node-sdk";

const kit = new Kit({ apiKey: env.KIT_API_KEY });

export class NewsletterService {
  private readonly SERVICE_TAG = "NewsletterService";
  private readonly client = kit;
  public async subscribe({ email }: { email: string }) {
    logger.info("creating/updating subscriber", { email });
    return runner(
      run(
        () =>
          this.client.subscribers.create({
            email_address: email,
          }),
        `${this.SERVICE_TAG}SubscribeApiFailure`,
        {
          message:
            "looks like something went wrong with our newsletter provider",
          severity: "error",
          meta: {
            email,
          },
        },
      ),
    ).next(({ subscriber }) => {
      logger.info("created/updated subscriber", {
        id: subscriber.id,
        at: subscriber.created_at,
      });
      return ok();
    });
  }
}
```

### Naming for RPC

Since RPC is supposed to be used internally, just pipe the models through it, meaning it just imports the core models directly thus there's no naming, since we use the stuff for our internal apps

### Naming for GrapghQL

Same for RPC, pipe directly unless it's extneral then we do teh same as REST BELOW:

### Naming for rest

now rest is different because we have a slight things they're just for so for
rest we basically should not be importing the models from the fucking core or
whatever we should just declare our own setup which I already outlined before
now there's a tricky thing which is we have to make sure that the fingers
version right v1 v2 v3 now this can scale easily because we can just you know
even if we grow to be a fucking billion dollar company and not even use v1 v2
before we can use the right the strike-based version where version by date for
example 2025 2026 that you know what I mean so it doesn't have to be v1 but
again we start off with v1 because it's super fucking scalable even billion dollar
companies still use v1 get up and others for sale and others all of them still use v1
but anyways the architecture is the same we start with a simple setup that
follow all the naming convention from all the other ones

Version objects are always named `v1`, `v2`, etc. Resource keys under them are lower-case and plural if they represent a collection (`users`, `posts`, `reminders`) or a stable singleton (`health` is fine). Nested groups like `oss` are just namespaces that logically cluster endpoints under the same base path. There is no trailing slash. All routes within that version must build their paths from this object. Nobody is allowed to hand-type `"/v1/posts"` in a random router.

Once paths exist, you define operation identifiers as the canonical API names. An operation id is the stable handle that all other layers align to. The pattern is `<resourcePlural><Action>` in camelCase for most operations. If your resource is `posts` and the operation is to purge the trash, the id is `postsPurgeTrash`. If the resource is `reminders` and the operation is to schedule one, the id is `remindersSchedule`. In some cases, when the resource is effectively a single thing (`health`) and the operation is obvious, you can use just the resource name as the operation id. That is a special case and should stay rare.

You can omit the shapes you don’t use, but you never rename them. It is always `<operationId><Headers|Query|Params|Body>SchemaRequest` for schemas, and `<OperationId><Headers|Query|Params|Body>Request` for types. Middleware-specific schemas like auth headers or rate-limiter headers live in `_shared` and follow the same pattern at that level: `authTokenHeaderSchemaRequest`, `AuthTokenHeaderRequest`, etc.

Response schemas are split in two layers: what the handler itself produces and what the client can actually see after middleware is accounted for. Middleware responses are usually shared pieces like `unauthorized`, `tooManyRequests`, `internalError`. They live in `_shared/responses.ts` and are grouped with a `SchemaResponse` suffix:

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

Inside the core, the vocabulary simplifies and drops transport concerns. The core speaks in terms of entities, DTOs, ROs, mappers, query-helpers, and services.
