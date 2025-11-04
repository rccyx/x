import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type CorsOrigin = string | string[];

interface CorsConfig {
  origin: CorsOrigin;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * fully typed cors helper
 * supports multiple origins, wildcard, and automatic origin reflection
 */
function cors(req: NextRequest, config: CorsConfig): Response {
  const originHeader = req.headers.get("origin");
  const res = NextResponse.next();

  const origins = Array.isArray(config.origin)
    ? config.origin
    : config.origin === "*"
      ? ["*"]
      : [config.origin];

  const allowedOrigin =
    config.origin === "*"
      ? "*"
      : originHeader && origins.includes(originHeader)
        ? originHeader
        : (origins[0] ?? "");

  if (allowedOrigin)
    res.headers.set("Access-Control-Allow-Origin", allowedOrigin);

  res.headers.set(
    "Access-Control-Allow-Methods",
    (
      config.methods ?? ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    ).join(", "),
  );

  res.headers.set(
    "Access-Control-Allow-Headers",
    (config.allowedHeaders ?? ["Content-Type", "Authorization"]).join(", "),
  );

  if (config.exposedHeaders?.length)
    res.headers.set(
      "Access-Control-Expose-Headers",
      config.exposedHeaders.join(", "),
    );

  if (config.credentials)
    res.headers.set("Access-Control-Allow-Credentials", "true");

  if (config.maxAge)
    res.headers.set("Access-Control-Max-Age", config.maxAge.toString());

  // handle preflight requests fast
  if (req.method === "OPTIONS")
    return new Response(null, { headers: res.headers });

  return res;
}

export function middleware(req: NextRequest) {
  return cors(req, {
    origin: ["https://yourfrontend.com", "https://example.com"],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  });
}

export const config = {
  matcher: ["/api/:path*"],
};
