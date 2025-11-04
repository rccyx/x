import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cors } from "headyx";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const corsHeaders = cors({
    origin: ["https://yourfrontend.com", "https://example.com"], // or "*"
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  });

  for (const { key, value } of corsHeaders) res.headers.set(key, value);

  if (req.method === "OPTIONS")
    return new Response(null, { headers: res.headers });

  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
