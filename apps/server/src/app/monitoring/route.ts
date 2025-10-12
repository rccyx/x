import type { NextRequest } from "next/server";
import { monitor } from "@ashgw/monitor";

export const runtime = "nodejs";

/**
 * Shared Sentry tunnel endpoint using @ashgw/monitor.
 */
export function POST(request: NextRequest): Promise<Response> {
  const handle = monitor.next.tunnelHandler as (
    request: NextRequest,
  ) => Promise<Response>;
  return handle(request);
}

export function GET(): Response {
  const health = monitor.next.tunnelHandlerHealthcheck as () => Response;
  return health();
}
