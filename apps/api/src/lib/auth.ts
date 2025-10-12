import { setupAuth } from "@ashgw/auth";
import { siteName } from "@ashgw/constants";
import { env } from "@ashgw/env";

export const { auth, authApi, handler } = setupAuth({
  appName: siteName,
  baseURL: env.NEXT_PUBLIC_BLOG_URL,
  disableSignUp: true,
  basePath: "/api/auth",
  trustedProductionOrigins: [env.NEXT_PUBLIC_BLOG_URL, env.NEXT_PUBLIC_WWW_URL],
});
