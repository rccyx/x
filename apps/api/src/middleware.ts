import type { NextRequest } from "next/server";
import { cors } from "@rccyx/next/middlewares";

export function middleware(req: NextRequest) {
  return cors(req);
}

// run on every single path (api, pages, static, assets, etc.)
export const config = {
  matcher: ["/:path*"],
};
