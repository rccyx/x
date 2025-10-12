import { contract } from "~/api/v1/contract";
import { gpg } from "@ashgw/constants";
import { rateLimiter, authed } from "~/ts-rest/middlewares";
import type { GlobalContext } from "~/ts-rest/context";
import { createRouterWithContext, middleware } from "ts-rest-kit/next";

import { health, oss, notification, reminder, post } from "~/api/v1/functions";

export const router = createRouterWithContext(contract)<GlobalContext>({
  reminderCreate: middleware()
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
    .route(contract.reminderCreate)(
    async ({ body, headers }) => await reminder.create({ body, headers }),
  ),

  notificationCreate: middleware()
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
    .route(contract.notificationCreate)(
    async ({ body }) => await notification.create({ body }),
  ),

  postDeleteViewWindow: middleware()
    .use(
      rateLimiter({
        kind: "interval",
        limit: {
          every: "4s",
        },
      }),
    )
    .use(authed())
    .route(contract.postDeleteViewWindow)(
    async () => await post.deleteViewWindow(),
  ),

  postDeleteTrash: middleware()
    .use(
      rateLimiter({
        kind: "interval",
        limit: {
          every: "4s",
        },
      }),
    )
    .use(authed())
    .route(contract.postDeleteTrash)(async () => await post.deleteTrash()),

  bootstrap: async ({ query }) =>
    await oss.fetchText({
      query,
      fetchUrl: {
        github: { repo: "dotfiles", scriptPath: "install/bootstrap" },
      },
      opts: {
        defaultRevalidate: 3600,
        cacheControl: "s-maxage=3600, stale-while-revalidate=300",
      },
    }),

  debion: async ({ query }) =>
    await oss.fetchText({
      query,
      fetchUrl: { github: { repo: "debion", scriptPath: "setup" } },
      opts: {
        defaultRevalidate: 3600,
        cacheControl: "s-maxage=3600, stale-while-revalidate=300",
      },
    }),

  whisper: async ({ query }) =>
    await oss.fetchText({
      query,
      fetchUrl: { github: { repo: "whisper", scriptPath: "setup" } },
      opts: {
        defaultRevalidate: 3600,
        cacheControl: "s-maxage=3600, stale-while-revalidate=300",
      },
    }),

  gpg: async ({ query }) =>
    await oss.fetchText({
      query,
      fetchUrl: { direct: { url: gpg.publicUrl } },
      opts: {
        defaultRevalidate: 86400,
        cacheControl: "s-maxage=86400, stale-while-revalidate=86400",
      },
    }),
  health: async () => await health.check(),
});
