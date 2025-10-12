import { AppError } from "./error";
import type { AppCode } from "./codes";
import { E } from "./factory";
import { toHttpFromUnknown } from "./http";
import { toTrpc, toTrpcFromUnknown } from "./trpc";
import type { TRPCErrorCtor } from "./trpc";

type Meta = Readonly<Record<string, unknown>>;

export function err(
  code: AppCode,
  message?: string,
  meta?: Meta,
  cause?: unknown,
): AppError {
  return new AppError({ code, message, meta, cause });
}

export function httpFrom(u: unknown): ReturnType<typeof toHttpFromUnknown> {
  return toHttpFromUnknown(u);
}

export function trpcFrom<TCtor extends TRPCErrorCtor<string>>(
  ctor: TCtor,
  u: unknown,
) {
  return u instanceof AppError ? toTrpc(ctor, u) : toTrpcFromUnknown(ctor, u);
}

export async function external<T>(
  fn: () => Promise<T>,
  ctx: { message?: string; service: string; operation: string },
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw E.upstreamError(
      ctx.message ?? `${ctx.service} ${ctx.operation} failed`,
      { upstream: { service: ctx.service, operation: ctx.operation } },
      err,
    );
  }
}

export async function internal<T>(
  fn: () => Promise<T>,
  ctx: { message?: string; service: string; op: string },
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw E.internal(
      ctx.message ?? `${ctx.service} ${ctx.op} failed`,
      { internal: { service: ctx.service, op: ctx.op } },
      err,
    );
  }
}

export { E, AppError };
