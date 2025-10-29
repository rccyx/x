import type {
  EnforceRunFn,
  EnforceRunSyncFn,
  NotPromise,
  Meta,
  RunOptions,
  Tag,
  RunResult,
} from "runyx";
import {
  run as baseRun,
  runSync as baseRunSync,
  err as baseErr,
  makeRunResult,
} from "runyx";

export type Severity = "warn" | "error" | "fatal";
type Jitter = "none" | "full";

export interface RetryPolicy<T extends Tag = Tag, O = unknown> {
  enabled?: boolean;
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: Jitter;
  totalDeadlineMs?: number;
  signal?: AbortSignal;
  shouldRetry?: (
    err: { ok: false; tag: T; message: string; meta?: Meta; cause?: unknown },
    attempt: number,
  ) => boolean;
  shouldRetryOk?: (value: O, attempt: number) => boolean;
}

export interface RunOps<T extends Tag, O = unknown> {
  message: string;
  severity: Severity;
  meta?: Meta;
  cause?: unknown;
  onError?: RunOptions<T>["onError"];
  retry?: RetryPolicy<T, O>;
}

function withSeverity(meta: Meta | undefined, severity: Severity): Meta {
  return meta ? { ...meta, severity } : { severity };
}

function normalizeMessage(msg: string): string {
  return msg.toLowerCase();
}

function withMeta(base: Meta | undefined, add: Meta): Meta {
  return base ? { ...base, ...add } : add;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  if (!signal) return new Promise((r) => setTimeout(r, ms));
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      const e = new Error("aborted");
      e.name = "AbortError";
      reject(e);
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function nextDelay(current: number, cap: number, jitter: Jitter): number {
  const raw = Math.min(current, cap);
  return jitter === "full" ? Math.floor(Math.random() * raw) : raw;
}

/** async run with retries and backoff, returns RunResult */
export async function run<O, T extends Tag>(
  fn: EnforceRunFn<() => O | Promise<O>>,
  tag: T,
  { severity, message, cause, meta, onError, retry }: RunOps<T, O>,
): Promise<RunResult<O, T>> {
  const m = normalizeMessage(message);
  const sevMeta = withSeverity(meta, severity);

  const {
    enabled = false,
    maxAttempts = 3,
    baseDelayMs = 200,
    maxDelayMs = 2000,
    factor = 2,
    jitter = "full",
    totalDeadlineMs,
    signal,
    shouldRetry,
    shouldRetryOk,
  } = retry ?? {};

  if (!enabled) {
    return baseRun<O, T>(fn, tag, {
      message: m,
      cause,
      meta: sevMeta,
      onError,
    });
  }

  if (signal?.aborted) {
    const e = new Error("aborted");
    e.name = "AbortError";
    return makeRunResult<O, T>({
      ok: false,
      tag,
      message: m,
      cause: e,
      meta: withMeta(sevMeta, {
        retry: {
          attempts: 0,
          aborted: true,
          maxAttempts,
          baseDelayMs,
          maxDelayMs,
          factor,
          jitter,
        },
      }),
    });
  }

  const started = Date.now();
  let delay = baseDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (
      totalDeadlineMs !== undefined &&
      Date.now() - started > totalDeadlineMs
    ) {
      return makeRunResult<O, T>({
        ok: false,
        tag,
        message: m,
        cause: new Error("retry deadline exceeded"),
        meta: withMeta(sevMeta, {
          retry: {
            attempts: attempt - 1,
            deadlineMs: totalDeadlineMs,
            maxAttempts,
            baseDelayMs,
            maxDelayMs,
            factor,
            jitter,
          },
        }),
      });
    }

    const res = await baseRun<O, T>(fn, tag, {
      message: m,
      cause,
      meta: withMeta(sevMeta, {
        retryAttempt: attempt,
        retryMaxAttempts: maxAttempts,
      }),
      onError,
    });

    if (res.ok) {
      const wantMore = shouldRetryOk
        ? shouldRetryOk(res.value, attempt)
        : false;
      if (!wantMore || attempt >= maxAttempts) return res;

      const waitMs = nextDelay(delay, maxDelayMs, jitter);
      try {
        await sleep(waitMs, signal);
      } catch (e) {
        return makeRunResult<O, T>({
          ok: false,
          tag,
          message: m,
          cause: e,
          meta: withMeta(sevMeta, {
            retry: { attempts: attempt, aborted: true },
          }),
        });
      }
      delay = Math.min(maxDelayMs, Math.floor(delay * factor));
      continue;
    }

    const more = attempt < maxAttempts;
    const allowed = shouldRetry ? shouldRetry(res, attempt) : true;

    if (!more || !allowed) {
      const finalMeta = withMeta(res.meta, {
        retry: {
          attempts: attempt,
          maxAttempts,
          strategy: `exp${factor}`,
          baseDelayMs,
          maxDelayMs,
          jitter,
          stoppedBy: more ? "classifier" : "exhausted",
        },
      });
      (res as { meta?: Meta }).meta = finalMeta;
      return res;
    }

    const waitMs = nextDelay(delay, maxDelayMs, jitter);
    try {
      await sleep(waitMs, signal);
    } catch (e) {
      return makeRunResult<O, T>({
        ok: false,
        tag,
        message: m,
        cause: e,
        meta: withMeta(sevMeta, {
          retry: { attempts: attempt, aborted: true },
        }),
      });
    }
    delay = Math.min(maxDelayMs, Math.floor(delay * factor));
  }

  return makeRunResult<O, T>({
    ok: false,
    tag,
    message: m,
    cause,
    meta: withMeta(sevMeta, { retry: { attempts: 0 } }),
  });
}

/** sync run with the same semantics, returns RunResult */
export function runSync<O, T extends Tag>(
  fn: EnforceRunSyncFn<() => NotPromise<O>>,
  tag: T,
  { severity, message, cause, meta, onError, retry }: RunOps<T, O>,
): RunResult<O, T> {
  const m = normalizeMessage(message);
  const sevMeta = withSeverity(meta, severity);

  const {
    enabled = false,
    maxAttempts = 3,
    shouldRetry,
    shouldRetryOk,
  } = retry ?? {};

  if (!enabled) {
    return baseRunSync<O, T>(fn, tag, {
      message: m,
      cause,
      meta: sevMeta,
      onError,
    });
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = baseRunSync<O, T>(fn, tag, {
      message: m,
      cause,
      meta: withMeta(sevMeta, {
        retryAttempt: attempt,
        retryMaxAttempts: maxAttempts,
      }),
      onError,
    });

    if (res.ok) {
      const wantMore = shouldRetryOk
        ? shouldRetryOk(res.value, attempt)
        : false;
      if (!wantMore || attempt >= maxAttempts) return res;
      continue;
    }

    const more = attempt < maxAttempts;
    const allowed = shouldRetry ? shouldRetry(res, attempt) : true;
    if (!more || !allowed) {
      const meta2 = withMeta(res.meta, {
        retry: {
          attempts: attempt,
          maxAttempts,
          strategy: "sync-immediate",
          stoppedBy: more ? "classifier" : "exhausted",
        },
      });
      (res as { meta?: Meta }).meta = meta2;
      return res;
    }
  }

  return makeRunResult<O, T>({
    ok: false,
    tag,
    message: m,
    cause,
    meta: withMeta(sevMeta, { retry: { attempts: 0 } }),
  });
}

/** severity-normalized err helper */
export function err<T extends Tag>({
  tag,
  message,
  cause,
  meta,
  severity,
}: {
  tag: T;
  message: string;
  cause?: unknown;
  meta?: Meta;
  severity: Severity;
}) {
  return baseErr({
    tag,
    message: normalizeMessage(message),
    cause,
    meta: withSeverity(meta, severity),
  });
}

export { runner, ok, expect, match, observer, unwrap, unwrapOr } from "runyx";
