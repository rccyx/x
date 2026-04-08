import type {
  MiddlewareFn,
  MiddlewareRequest,
  ResponseHandlerResponse,
  ResponseHandlerRequest,
  ResponseHandlersFn,
  MiddlewareResponse,
} from "./types";
import type { GlobalContext } from "../ctx";

export function middlewareFn<
  Gtx extends GlobalContext,
  LocalCtx extends object,
>(fn: MiddlewareFn<Gtx, LocalCtx>) {
  return (req: MiddlewareRequest<Gtx, LocalCtx>) => {
    const res: MiddlewareResponse = {};
    return fn(req, res);
  };
}

export function responseHandlersFn<Rtype, Gtx extends GlobalContext>(
  fn: ResponseHandlersFn<Rtype, Gtx>,
) {
  return (res: ResponseHandlerResponse, req: ResponseHandlerRequest<Gtx>) => {
    return fn(res, req);
  };
}
