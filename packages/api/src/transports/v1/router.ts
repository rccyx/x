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
    await oss.bootstrap({
      query,
    }),

  debion: async ({ query }) =>
    await oss.debion({
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
