import { auth } from "@ashgw/auth";

export const runtime = "nodejs";

export const { POST, GET } = auth.nextJsHandler;
