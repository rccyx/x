import type { NextRequest } from "next/server";
import { cors } from "./cors";

export function middleware(req: NextRequest) {
  return cors(req);
}

export const config = { matcher: ["/api/:path*"] };
