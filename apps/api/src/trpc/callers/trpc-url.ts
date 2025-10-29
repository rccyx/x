import { env } from "@ashgw/env";
import { root } from "../../root-uris";

export function getTrpcUrl() {
  return env.NEXT_PUBLIC_API_URL + root.rpc;
}
