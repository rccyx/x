import type { NextRequest } from "next/server";
import { root } from "./root-uris";
import { cors } from "@rccyx/next/middlewares";
import { origins } from "@rccyx/constants";

export function middleware(req: NextRequest) {
  return cors(req, origins);
}

export const config = {
  matcher: Object.values(root).map((base) => `${base}/:path*`),
};
