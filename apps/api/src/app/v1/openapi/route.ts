import { NextResponse } from "next/server";
import { generateOpenApi } from "@ts-rest/open-api";
import { contract } from "~/api/v1/contract";
import { apiV1endpoint } from "~/ts-rest/endpoint";
import { env } from "@ashgw/env";

export const runtime = "edge";
export const revalidate = 3600; // doesn't change often

export function GET() {
  const doc = generateOpenApi(
    contract,
    {
      info: {
        title: "www API v1",
        version: "1.0.0",
        description: "REST",
        contact: { email: "oss@ashgw.me" },
      },
      openapi: "3.1.0",
      servers: [
        { url: new URL(apiV1endpoint, env.NEXT_PUBLIC_WWW_URL).toString() },
      ],
    },
    {
      setOperationId: true,
    },
  );

  return NextResponse.json(doc, { status: 200 });
}
