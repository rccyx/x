import { cors as baseCors } from "headyx";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function cors(req: NextRequest, allowedOrigins: string[]) {
  const origin = req.headers.get("origin");

  // if there's no origin or it's not in the allowlist -> block it
  if (!origin || !allowedOrigins.includes(origin)) {
    return new Response("Forbidden", { status: 403 });
  }

  const res = NextResponse.next();

  const headers = baseCors({
    origin,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  });

  for (const { key, value } of headers) res.headers.set(key, value);

  if (req.method === "OPTIONS")
    return new Response(null, { headers: res.headers });

  return res;
}
