import { setupAuth } from "@ashgw/auth";
import { siteName } from "@ashgw/constants";
import { env } from "@ashgw/env";
import { rootUri } from "~/api/uri";

export const { auth, authApi, nextJsHandler } = setupAuth({
  appName: siteName,
  baseURL: env.NEXT_PUBLIC_API_URL,
  disableSignUp: true,
  basePath: rootUri.auth,
  trustedProductionOrigins: [
    env.NEXT_PUBLIC_BLOG_URL,
    env.NEXT_PUBLIC_WWW_URL,
    env.NEXT_PUBLIC_API_URL,
  ],
});
