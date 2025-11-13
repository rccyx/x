import type {
  EnforceRunFn,
  EnforceRunSyncFn,
  Result,
  RunResult,
  RunOptions,
  Meta,
  Tag,
  NotPromise,
} from "runyx";
import { run as baseRun, runSync as baseRunSync, err as baseErr } from "runyx";

export type Severity = "warn" | "error" | "fatal";

interface BaseOps<T extends Tag, O> {
  message: string;
  severity: Severity;
  meta?: Meta;
  onOk?: RunOptions<O, T>["onOk"];
  onErr?: RunOptions<unknown, T>["onErr"];
}

const withSeverity = (meta: Meta | undefined, severity: Severity): Meta =>
  meta ? { ...meta, severity } : { severity };

export async function run<O, T extends Tag>(
  fn: EnforceRunFn<() => O | Promise<O>>,
  tag: T,
  { message, severity, meta, onOk, onErr }: BaseOps<T, O>,
): Promise<RunResult<O, T>> {
  return baseRun<O, T>(fn, tag, {
    message,
    meta: withSeverity(meta, severity),
    onOk,
    onErr,
  });
}

export function runSync<O, T extends Tag>(
  fn: EnforceRunSyncFn<() => NotPromise<O>>,
  tag: T,
  { message, severity, meta, onOk, onErr }: BaseOps<T, O>,
): RunResult<O, T> {
  return baseRunSync<O, T>(fn, tag, {
    message,
    meta: withSeverity(meta, severity),
    onOk,
    onErr,
  });
}

export function err<T extends Tag>({
  tag,
  message,
  severity,
  meta,
  cause,
}: {
  tag: T;
  message: string;
  severity: Severity;
  meta?: Meta;
  cause?: unknown;
}): Result<never, T> {
  return baseErr({
    tag,
    message,
    meta: withSeverity(meta, severity),
    cause,
  });
}
