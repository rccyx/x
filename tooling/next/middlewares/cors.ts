import { cors as baseCors } from "headyx";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function cors(req: NextRequest, allowedOrigins: readonly string[]) {
  const origin = req.headers.get("origin") ?? "";
  const isAllowed = allowedOrigins.includes(origin);

  // handle preflight first
  if (req.method === "OPTIONS") {
    const requested = req.headers
      .get("access-control-request-headers")
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = new Response(null, { status: 204 });
    const headers = baseCors({
      origin: isAllowed ? origin : "*", // "*" only on preflight for disallowed origins
      credentials: isAllowed, // creds only for allowed origins
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders:
        requested && requested.length
          ? requested
          : ["content-type", "authorization"],
      maxAge: 600,
    });
    for (const { key, value } of headers) res.headers.set(key, value);
    res.headers.set("Vary", "Origin");
    return res;
  }

  // block actual requests if not allowed
  if (!isAllowed) {
    return new Response("Forbidden", {
      status: 403,
      headers: { Vary: "Origin" },
    });
  }

  // allowed: continue and attach proper CORS
  const res = NextResponse.next();
  const headers = baseCors({
    origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization"],
    maxAge: 600,
  });
  for (const { key, value } of headers) res.headers.set(key, value);
  res.headers.set("Vary", "Origin");
  return res;
}
