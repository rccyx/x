import { cors as baseCors } from "headyx";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function cors(req: NextRequest, allowedOrigins: readonly string[]) {
  // always generate a response so the middleware can continue normally
  const res = NextResponse.next();

  const origin = req.headers.get("origin");

  // strict allowlist check
  const isAllowed = !!origin && allowedOrigins.includes(origin);

  // delegate CORS header creation entirely to headyx
  const headers = baseCors({
    origin: isAllowed ? origin : undefined,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization"],
  });

  for (const { key, value } of headers) res.headers.set(key, value);

  // reply properly to preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: res.headers });
  }

  // reject non-preflight requests only when not allowed
  if (!isAllowed) {
    return new Response("Forbidden", { status: 403, headers: res.headers });
  }

  return res;
}
