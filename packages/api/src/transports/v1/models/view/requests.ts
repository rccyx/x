import type { z } from "zod";
import { tokenAuthMiddlewareHeaderSchemaRequest } from "../shared";

// ========== Schemas ==========

export const viewWindowDeleteHeadersSchemaRequest =
  tokenAuthMiddlewareHeaderSchemaRequest.extend({});

export type ViewWindowDeleteHeadersRequest = z.infer<
  typeof viewWindowDeleteHeadersSchemaRequest
>;
