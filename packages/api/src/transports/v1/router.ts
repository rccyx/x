import { contract } from "../../transports/v1/contract";
import { rateLimiter, authed } from "../../ts-rest/middlewares";
import type { GlobalContext } from "../../ts-rest/context";
import { createRouterWithContext, middleware } from "ts-rest-kit/next";

import {
  health,
  oss,
  notification,
  reminder,
  views,
  post,
} from "../../transports/v1/functions";

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

  viewsDeleteWindowWithCutoff: middleware()
    .use(
      rateLimiter({
        kind: "interval",
        limit: {
          every: "4s",
        },
      }),
    )
    .use(authed())
    .route(contract.viewsDeleteWindowWithCutoff)(
    async () => await views.deleteViewWindowWithCutoff(),
  ),

  postsDeleteTrash: middleware()
    .use(
      rateLimiter({
        kind: "interval",
        limit: {
          every: "4s",
        },
      }),
    )
    .use(authed())
    .route(contract.postsDeleteTrash)(async () => await post.deleteTrash()),

  bootstrap: async ({ query }) =>
    await oss.fetchScript({
      script: {
        path: "install/bootstrap",
        repo: "dotfiles",
      },
      revalidateSeconds: query?.revalidateSeconds,
    }),

  debion: async ({ query }) =>
    await oss.fetchScript({
      script: {
        path: "setup",
        repo: "debion",
      },
      revalidateSeconds: query?.revalidateSeconds,
    }),

  whisper: async ({ query }) =>
    await oss.fetchScript({
      script: {
        path: "setup",
        repo: "whisper",
      },
      revalidateSeconds: query?.revalidateSeconds,
    }),

  gpg: async ({ query }) =>
    await oss.fetchGpg({
      revalidateSeconds: query?.revalidateSeconds,
    }),
  health: async () => await health.check(),
});
