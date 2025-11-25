import type { NextRequest } from "next/server";
import { monitor } from "@rccyx/monitor";

export const runtime = "nodejs";

export function POST(request: NextRequest): Promise<Response> {
  const handle = monitor.next.tunnelHandler;
  return handle(request);
}

export function GET(): Response {
  const health = monitor.next.tunnelHandlerHealthcheck;
  return health();
}
