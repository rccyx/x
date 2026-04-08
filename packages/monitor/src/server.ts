import type { NextRequest } from "next/server";
import { logger } from "@rccyx/logger";
import { env } from "@rccyx/env";
import { z } from "zod";
import { init as sentryInit } from "./init";

export const initializeServer = () => {
  return sentryInit({
    runtime: "server",
  });
};

/**
 * Generic Next.js App Router handler for Sentry tunneling.
 * Can be re-used across apps to avoid duplicating logic.
 */
export async function tunnelHandler(request: NextRequest) {
  if (env.NEXT_PUBLIC_DISABLE_SENTRY_TUNNELING === "true") {
    return new Response("Sentry tunnel disabled", { status: 404 });
  }
  try {
    const envelope: string = await request.text();
    if (!envelope) {
      logger.warn("Sentry tunnel: Empty envelope body");
      return new Response("Bad Request: Empty body", { status: 400 });
    }

    const lines: string[] = envelope.split("\n");
    const headerLine: string | undefined = lines[0];
    if (!headerLine) {
      logger.warn("Sentry tunnel: Missing envelope header line");
      return new Response("Bad Request: Missing header", { status: 400 });
    }

    const headerUnknown: unknown = JSON.parse(headerLine);

    const headerSchema = z.object({ dsn: z.string().url() });
    const headerParse = headerSchema.safeParse(headerUnknown);
    if (!headerParse.success) {
      logger.warn("Sentry tunnel: Invalid header JSON", {
        issues: headerParse.error.issues,
      });
      return new Response("Bad Request: Invalid header", { status: 400 });
    }

    const dsn: string = headerParse.data.dsn;
    const dsnUrl: URL = new URL(dsn);
    const projectId: string | undefined = dsnUrl.pathname.split("/").pop();

    if (!projectId) {
      logger.warn("Sentry tunnel: Could not extract project ID from DSN");
      return new Response("Bad Request: Invalid DSN", { status: 400 });
    }

    const sentryIngestUrl = `https://${dsnUrl.host}/api/${projectId}/envelope/`;

    const response = await fetch(sentryIngestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
      },
      body: envelope,
    });

    if (!response.ok) {
      logger.error("Sentry tunnel: Failed to forward envelope", {
        status: response.status,
        statusText: response.statusText,
      });
      return new Response("Internal Server Error", { status: 500 });
    }

    logger.info("Sentry tunnel: Successfully forwarded envelope", {
      projectId,
      envelopeSize: envelope.length,
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    logger.error("Sentry tunnel: Error processing request", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export function tunnelHandlerHealthcheck() {
  return new Response("Sentry Tunnel Endpoint", { status: 200 });
}
