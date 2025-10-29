/**
 * Lightweight, sync fingerprint for anonymous callers.
 *
 * What it does
 *  - Builds a stable string from request traits (IP, UA, Accept-Language, optionally path or method)
 *  - Hashes that string with FNV-1a 64 by default to get a short hex id
 *  - If you pass `secret`, it is mixed into the input (pepper). This is not a true HMAC.
 *
 * Defaults
 *  - varyBy: ["ip", "ua", "acceptLanguage"]
 *  - ipHeaders order: x-forwarded-for, cf-connecting-ip, x-real-ip, fly-client-ip, fastly-client-ip, x-client-ip
 *
 * Example
 *  ```ts
 *  import { getFingerprint } from "./getFingerprint";
 *
 *  const id = getFingerprint({
 *    req,
 *    secret: process.env.RL_FINGERPRINT_SECRET ?? "dev",
 *    prefix: "anon:",
 *  });
 *  ```
 */

export interface GetFingerprintOptions {
  req: Request;
  /** Optional pepper mixed into the input. Keep per env. */
  secret?: string;
  /**
   * Which fields to include. Defaults to ["ip", "ua", "acceptLanguage"].
   * Add "path" or "method" if you want per route or per method keys.
   */
  varyBy?: ("ip" | "ua" | "acceptLanguage" | "path" | "method")[];
  /**
   * Ordered list of headers to try for IP detection.
   * Defaults to common proxy or CDN headers.
   */
  ipHeaders?: string[];
  /** Optional prefix to namespace the output, for example "anon:" or "ip:" */
  prefix?: string;
  /**
   * Custom hash function override.
   * Input: concatenated fingerprint string
   * Output: hex string
   *
   * Defaults to fnv1a64Hex.
   */
  hashFn?: (input: string) => string;
}

export function getFingerprint(opts: GetFingerprintOptions): string {
  const { req, hashFn = fnv1a64Hex } = opts;
  const varyBy = opts.varyBy ?? ["ip", "ua", "acceptLanguage"];
  const ipHeaders = opts.ipHeaders ?? [
    "x-forwarded-for",
    "cf-connecting-ip",
    "x-real-ip",
    "fly-client-ip",
    "fastly-client-ip",
    "x-client-ip",
  ];

  const h = req.headers;

  const ip = pickIp(h, ipHeaders);
  const ua = h.get("user-agent") ?? "";
  const al = h.get("accept-language") ?? "";
  const path = safeUrlPath(req.url);
  const method = (req as unknown as { method?: string }).method ?? "";

  const parts: string[] = [];
  if (varyBy.includes("ip")) parts.push(`ip=${ip}`);
  if (varyBy.includes("ua")) parts.push(`ua=${ua}`);
  if (varyBy.includes("acceptLanguage")) parts.push(`al=${al}`);
  if (varyBy.includes("path")) parts.push(`path=${path}`);
  if (varyBy.includes("method")) parts.push(`m=${method}`);

  if (opts.secret && opts.secret.length > 0) {
    parts.push(`pepper=${opts.secret}`);
  }

  const input = parts.join("|");
  const hex = hashFn(input);

  return opts.prefix ? `${opts.prefix}${hex}` : hex;
}

/* --------------------------------- helpers --------------------------------- */

function pickIp(headers: Headers, order: string[]): string {
  for (const name of order) {
    const v = headers.get(name);
    if (!v) continue;
    // x-forwarded-for can be a list: client, proxy1, proxy2
    const first = v.split(",")[0]?.trim();
    if (first) return first;
  }
  // last resort: do not throw, just return empty to keep determinism
  return "";
}

function safeUrlPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname;
  } catch {
    return "";
  }
}

/**
 * FNV-1a 64-bit hash, output as 16-char hex.
 * Not cryptographic. Fast and stable for keys.
 */
function fnv1a64Hex(str: string): string {
  let hash = BigInt("0xcbf29ce484222325"); // offset basis
  const prime = BigInt("0x100000001b3");

  for (const ch of str) {
    const cp = ch.codePointAt(0);
    const n = cp ?? ch.charCodeAt(0);
    const code = BigInt(n);

    hash ^= code;
    hash = (hash * prime) & BigInt("0xffffffffffffffff");
  }

  return hash.toString(16).padStart(16, "0");
}
