import { NextResponse } from "next/server";
import { generateOpenApi } from "@ts-rest/open-api";
import { contract } from "../../../boundary/v1/contract";
import { env } from "@rccyx/env";
import { root } from "../../../root-uris";
import { email } from "@rccyx/constants";

export const runtime = "nodejs";
export const revalidate = 60; // 1 minute

export function GET() {
  const doc = generateOpenApi(
    contract,
    {
      info: {
        title: "API",
        version: "1.0.0",
        description: "REST",
        contact: { email: email.personal.address },
      },
      openapi: "3.1.0",
      servers: [{ url: new URL(root.v1, env.NEXT_PUBLIC_API_URL).toString() }],
    },
    {
      setOperationId: true, // important!
    },
  );

  return NextResponse.json(doc, { status: 200 });
}
