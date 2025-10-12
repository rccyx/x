import { db } from "@ashgw/db";
import type { GlobalContext } from "../context";
import { logger } from "@ashgw/logger";
import { responseHandlersFn } from "ts-rest-kit/core";
import { createGlobalRequestMiddleware } from "ts-rest-kit/next";

const createGlobalContext = createGlobalRequestMiddleware<GlobalContext>(
  (request) => {
    request.ctx = { requestedAt: new Date(), db };
  },
);

export const setupRequestMiddleware = () => createGlobalContext;

export const setupResponseHandlers = responseHandlersFn<void, GlobalContext>(
  (_res, req) => {
    logger.info("[REST] took %sms", {
      took: new Date().getTime() - req.ctx.requestedAt.getTime(),
    });
  },
);
