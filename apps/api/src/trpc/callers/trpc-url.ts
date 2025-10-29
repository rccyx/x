import { env } from "@ashgw/env";
import { root } from "src/root-uris";

const isBrowser = typeof window !== "undefined";
const trpcUri = root.rpc;

export function getTrpcUrl(baseUrl?: string) {
  return isBrowser
    ? trpcUri
    : `${baseUrl ?? env.NEXT_PUBLIC_API_URL}${trpcUri}`;
}
