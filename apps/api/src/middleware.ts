import type { NextRequest } from "next/server";

import { cors } from "headyx";

export function middleware(_request: NextRequest) {
  return cors({
    origin: ["https://yourfrontend.com", "https://exmaple.com"], // allowed origin
    methods: ["GET", "POST", "OPTIONS"], // allowed methods
    credentials: true, // we use cookies for authentication, so yes
  });
}

export const config = {
  matcher: ["/api/:path*"], // apply to API routes only
};
