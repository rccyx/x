export { E, trpcFrom, httpFrom } from "erryx";
import { throwable as erryxThrowable } from "erryx";

export type ServiceKind =
  | "db"
  | "email"
  | "storage"
  | "internal"
  | "oss"
  | "analytics"
  | "monitoring"
  | "scheduler"
  | "auth"
  | "post"
  | "reminder"
  | "billing"
  | "notification"
  | "newsletter"
  | "http";

type MaybePromise<T> = T | Promise<T>;

interface TypedCtx<TErr = Error> {
  /** free text to describe the failure in logs and errors */
  message?: string;
  /** which boundary failed. keep this consistent for clean logs and alerts */
  service: ServiceKind;
  /** operation name or method you attempted, like "post.findMany" or "emails.send" */
  operation: string;
  /** hook to run whenever an error happens. good for logging or telemetry */
  onError?: (error: TErr) => MaybePromise<void>;
}

/**
 * run a function that may throw and rethrow it as your unified app error using erryx.
 * default kind is "internal". pass "external" only when the failure boundary is an upstream api or sdk.
 *
 * examples:
 *
 * default internal usage:
 * ```ts
 * const posts = await throwable(
 *   () => db.post.findMany({ where: { isReleased: true } }),
 *   { service: "db", operation: "post.findMany", message: "failed to fetch posts" },
 * );
 * ```
 *
 * explicit external usage:
 * ```ts
 * const sent = await throwable(
 *   "external",
 *   () => resend.emails.send({ to, subject, html }),
 *   { service: "email", operation: "emails.send", message: "failed to send email" },
 * );
 * ```
 *
 * with onError for logging:
 * ```ts
 * await throwable(
 *   () => db.trashPost.deleteMany(),
 *   {
 *     service: "db",
 *     operation: "trashPost.deleteMany",
 *     message: "failed to purge trashed posts",
 *     onError: (e) => logger.error("purge failed", { errMessage: e.message }),
 *   },
 * );
 * ```
 *
 * both call styles are valid:
 * ```ts
 * await throwable(() => doWork(), { service: "internal", operation: "doWork" });
 * await throwable("internal", () => doWork(), { service: "internal", operation: "doWork" });
 * ```
 *
 * @template T result type of the function
 * @returns the resolved value of fn if it succeeds
 * @throws app error shaped by erryx if fn throws
 */
export function throwable<T>(
  fn: () => MaybePromise<T>,
  ctx: TypedCtx,
): Promise<T>;

/**
 * same as the 2 arg form but lets you force the kind explicitly.
 * see main docs above for examples.
 *
 * @template T
 */
export function throwable<T>(
  kind: "internal" | "external",
  fn: () => MaybePromise<T>,
  ctx: TypedCtx,
): Promise<T>;

export async function throwable<T>(
  ...args:
    | readonly [fn: () => MaybePromise<T>, ctx: TypedCtx]
    | readonly [
        kind: "internal" | "external",
        fn: () => MaybePromise<T>,
        ctx: TypedCtx,
      ]
): Promise<T> {
  if (typeof args[0] === "function") {
    const [fn, ctx] = args;
    return erryxThrowable("internal", fn, ctx);
  } else {
    const [kind, fn, ctx] = args;
    return erryxThrowable(kind, fn, ctx);
  }
}
