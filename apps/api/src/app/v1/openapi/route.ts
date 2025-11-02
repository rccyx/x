import { NextResponse } from "next/server";
import { generateOpenApi } from "@ts-rest/open-api";
import { contract } from "../../../transports/v1/contract";
import { env } from "@rccyx/env";
import { root } from "../../../root-uris";
import { email } from "@rccyx/constants";

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
        contact: { email: email.oss.address },
      },
      openapi: "3.1.0",
      servers: [{ url: new URL(root.v1, env.NEXT_PUBLIC_WWW_URL).toString() }],
    },
    {
      setOperationId: true,
    },
  );

  return NextResponse.json(doc, { status: 200 });
}
