import { cors as buildCors } from "headyx";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function cors(req: NextRequest, origins: string[]) {
  const origin = req.headers.get("origin");
  const isCors = !!origin;
  const isPreflight = req.method === "OPTIONS";
  const isAllowed = origins.includes(origin!);

  // mirror browser preflight ask, or fall back
  const requested = req.headers.get("access-control-request-headers");
  const allowedHeaders =
    (requested
      ?.split(",")
      .map((h) => h.trim())
      .filter(Boolean) as readonly string[] | undefined) ??
    (["content-type", "authorization"] as const);

  const methods = [
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ] as const;

  if (isPreflight) {
    const opts: Parameters<typeof buildCors>[0] = {
      origin: isAllowed ? origin! : "*",
      credentials: isAllowed,
      methods,
      allowedHeaders,
      maxAge: 600,
      varyOrigin: true,
    };
    const res = new Response(null, { status: 204 });
    for (const { key, value } of buildCors(opts)) res.headers.set(key, value);
    return res;
  }

  if (isCors && !isAllowed) {
    return new Response("Forbidden", {
      status: 403,
      headers: { Vary: "Origin" },
    });
  }

  const res = NextResponse.next();

  if (isCors) {
    const opts: Parameters<typeof buildCors>[0] = {
      origin: origin!, // safe here because isCors === true
      credentials: true,
      methods,
      allowedHeaders,
      maxAge: 600,
      varyOrigin: true,
    };
    for (const { key, value } of buildCors(opts)) res.headers.set(key, value);
    res.headers.append("Vary", "Origin");
  }

  return res;
}
