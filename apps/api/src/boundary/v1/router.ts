import { contract } from "../../boundary/v1/contract";
import { rateLimiter, authed } from "../../adapters/ts-rest/middlewares";
import type { TsrContext } from "../../adapters/ts-rest/context";
import { createRouterWithContext, middleware } from "restyx/next";

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
