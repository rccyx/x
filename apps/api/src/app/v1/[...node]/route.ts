import { logger } from "@ashgw/logger";
import { createNextHandler } from "@ts-rest/serverless/next";
import { contract } from "~/api/v1/contract";
import { monitor } from "@ashgw/monitor";
import { router } from "~/api/v1/router";
import {
  setupRequestMiddleware,
  setupResponseHandlers,
} from "~/api/ts-rest/middlewares";
import { rootUri } from "~/api/uri";

export const runtime = "nodejs";

// Next.js App Router handler for ts-rest v3 contract
// - requestMiddleware/responseHandlers wired via local ts-rest-kit wrappers
// - responsesValidation enabled to align with strictStatusCodes
const handler = createNextHandler(contract, router, {
  basePath: rootUri.v1,
  handlerType: "app-router",
  responseValidation: true,
  jsonQuery: false,
  // cors: {}, // not needed
  requestMiddleware: [setupRequestMiddleware()],
  responseHandlers: [setupResponseHandlers],
  errorHandler: (error, { route }) => {
    logger.error(`>>> REST Error on ${route}`, error);
    monitor.next.captureException({
      error,
      hint: { extra: { route } },
    });
  },
});

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
