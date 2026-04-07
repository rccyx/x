import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "@rccyx/env";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/continuum")) {
    const targetBaseUrl = env.NEXT_PUBLIC_BLOG_URL;
    const cleanPath = pathname.replace(/^\/continuum/, "");
    const targetUrl = `${targetBaseUrl}${cleanPath}${search}`;
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/continuum/:path*", "/booking/:path*"],
};
