import { db } from "@rccyx/db";
import type { TsrContext } from "../context";
import { logger } from "@rccyx/logger";
import { responseHandlersFn } from "restyx/core";
import { createGlobalRequestMiddleware } from "restyx/next";

const createGlobalContext = createGlobalRequestMiddleware<TsrContext>(
  (request) => {
    request.ctx = { requestedAt: new Date(), db };
  },
);

export const setupRequestMiddleware = () => createGlobalContext;

export const setupResponseHandlers = responseHandlersFn<void, TsrContext>(
  (_res, req) => {
    logger.info("[REST] took %sms", {
      took: new Date().getTime() - req.ctx.requestedAt.getTime(),
    });
  },
);
