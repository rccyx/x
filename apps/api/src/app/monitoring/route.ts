import type { NextRequest } from "next/server";
import { tunnelHandler, tunnelHandlerHealthcheck } from "@rccyx/monitor/server";

export const runtime = "nodejs";

export function POST(request: NextRequest): Promise<Response> {
  const handle = tunnelHandler;
  return handle(request);
}

export function GET(): Response {
  const health = tunnelHandlerHealthcheck;
  return health();
}
