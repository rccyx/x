import { origins } from "@rccyx/constants";
import { cors as baseCors } from "headyx";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowed = origins;

export function cors(req: NextRequest) {
  const origin = req.headers.get("origin");
  const isAllowed = origin && allowed.includes(origin);

  // block immediately if origin not in allowlist
  if (!isAllowed) {
    return new Response("Forbidden", { status: 403 });
  }

  const res = NextResponse.next();

  const headers = baseCors({
    origin, // safe since we already validated
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  });

  for (const { key, value } of headers) res.headers.set(key, value);

  if (req.method === "OPTIONS")
    return new Response(null, { headers: res.headers });

  return res;
}
