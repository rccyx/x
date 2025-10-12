import { NextResponse } from "next/server";
import { generateOpenApi } from "@ts-rest/open-api";
import { contract } from "~/api/v1/contract";
import { env } from "@ashgw/env";
import { rootEndpoints } from "~/api/root-endpoints";
import { ossEmail } from "@ashgw/constants";

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
        contact: { email: ossEmail },
      },
      openapi: "3.1.0",
      servers: [
        { url: new URL(rootEndpoints.v1, env.NEXT_PUBLIC_WWW_URL).toString() },
      ],
    },
    {
      setOperationId: true,
    },
  );

  return NextResponse.json(doc, { status: 200 });
}
