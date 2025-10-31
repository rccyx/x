import { auth } from "@rccyx/auth";

export const runtime = "nodejs";

export const { POST, GET } = auth.nextJsHandler;
