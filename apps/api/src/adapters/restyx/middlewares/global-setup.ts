import { db } from "@rccyx/db";
import type { RestyxContext } from "../context";
import { logger } from "@rccyx/logger";
import { responseHandlersFn } from "../../../adapters/restyx/framework/src/core";
import { createGlobalRequestMiddleware } from "../../../adapters/restyx/framework/src/next";

const createGlobalContext = createGlobalRequestMiddleware<RestyxContext>(
  (request) => {
    request.ctx = { requestedAt: new Date(), db };
  },
);

export const setupRequestMiddleware = () => createGlobalContext;

export const setupResponseHandlers = responseHandlersFn<void, RestyxContext>(
  (_res, req) => {
    logger.info("[REST] took %sms", {
      took: new Date().getTime() - req.ctx.requestedAt.getTime(),
    });
  },
);
