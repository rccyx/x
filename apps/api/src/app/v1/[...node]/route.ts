import { createHandler } from "../../../adapters/restyx/framework/src/next";
import { contract } from "../../../boundary/v1/contract";
import { router } from "../../../boundary/v1/router";
import {
  setupRequestMiddleware,
  setupResponseHandlers,
} from "../../../adapters/restyx/middlewares";
import { root } from "../../../root-uris";

export const runtime = "nodejs";

const handler = createHandler(contract, router, {
  basePath: root.v1,
  handlerType: "app-router",
  responseValidation: true,
  jsonQuery: false,
  // cors: {}, // not needed
  requestMiddleware: [setupRequestMiddleware()],
  responseHandlers: [setupResponseHandlers],
});

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
