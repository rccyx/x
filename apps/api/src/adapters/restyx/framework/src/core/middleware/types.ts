import type { GlobalContext } from "../ctx";
import type { TsRestRequest, TsRestResponse } from "@ts-rest/serverless";

export type MaybePromise<T> = T | Promise<T>;

export type MergeTsrContextWith<Gtx extends GlobalContext, LocalCtx> = Gtx & {
  ctx: Gtx["ctx"] & LocalCtx;
};

export type MiddlewareRequest<
  Gtx extends GlobalContext,
  LocalCtx,
> = TsRestRequest & Gtx & MergeTsrContextWith<Gtx, LocalCtx>;

export type MiddlewareResponse = object;

export type ResponseHandlerRequest<Gtx extends GlobalContext> = TsRestRequest &
  Gtx;

export type ResponseHandlerResponse = TsRestResponse;

export type MiddlewareReturn<LocalCtx> = void | Response | { ctx: LocalCtx };

export type MiddlewareFn<Gtx extends GlobalContext, LocalCtx> = (
  req: MiddlewareRequest<Gtx, LocalCtx>,
  res: MiddlewareResponse,
) => MaybePromise<MiddlewareReturn<LocalCtx>>;

export type ResponseHandlersFn<FnReturntype, Gtx extends GlobalContext> = (
  res: ResponseHandlerResponse,
  req: ResponseHandlerRequest<Gtx>,
) => MaybePromise<FnReturntype>;

export interface SequentialMiddleware<Gtx extends GlobalContext, LocalCtx> {
  ctx: LocalCtx;
  mw: MiddlewareFn<Gtx, LocalCtx>;
}

export type SequentialMiddlewareFn<
  Gtx extends GlobalContext,
  LocalCtx,
> = MiddlewareFn<Gtx, LocalCtx>;

export type SequentialItem<Gtx extends GlobalContext, LocalCtx> =
  | SequentialMiddleware<Gtx, LocalCtx>
  | SequentialMiddlewareFn<Gtx, LocalCtx>;
