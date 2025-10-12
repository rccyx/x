import { logger } from "@ashgw/logger";
import { monitor } from "@ashgw/monitor";
import { createNextHandler } from "@ts-rest/serverless/next";
import { contract, router } from "@ashgw/api/v1";
import {
  setupRequestMiddleware,
  setupResponseHandlers,
} from "@ashgw/api/ts-rest";
import { rootUri } from "@ashgw/api/uri";

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
