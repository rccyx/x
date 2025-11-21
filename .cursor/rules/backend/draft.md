# Models

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

Notice how if you look at the Sysia query, which is a hot raw one that we got from our own external service, which is deployed somewhere in a pod somewhere, returns unsafe data like the tokens, secretive stuff, IP address, things that we don't want to actually use and want.
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

```

- Follow this naming convention for zod schemas and types
- <entity><action/view><Client?>SchemaDto for zod schemas
- <entity><action/view><Client?>Dto for the types of the dtos
- It can be a unique action, or a view of the entity
- now there's also the concept of a client (optional, may be empty), if we have many of our apps
- consuming the same resource but each need differnt fetching, or differen payloads
- then we introduce an optional client like MobileClient, WebClient, DashboardClient, PartnerClient
- these are basically apps our team uses, these are not made to be for external consumers, these are just for our team
- to fetch the correct payload of the correct thing at all times
- entity is the resource we are fetching, it can be a single entity or a collection of entities
- entities correlate to the database tables, and the resources we are fetching
