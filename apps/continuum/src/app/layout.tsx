import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import {
  createMetadata,
  JsonLdScript,
  organizationJsonLd,
  websiteJsonLd,
} from "@rccyx/seo";

import { AnalyticsProvider } from "@rccyx/analytics/client";
import { env } from "@rccyx/env";
import { DesignSystemProvider } from "@rccyx/design/provider";

import { RPCProvider } from "@rccyx/api/rpc-client";
import { GoBack } from "./components/pages/root";
import { StoreProvider } from "./stores";
import { siteName } from "@rccyx/constants";
import { FirstTimeVisitorBanner } from "@rccyx/components";

const siteUrl = env.NEXT_PUBLIC_BLOG_URL;

export const metadata: Metadata = createMetadata({
  metadataBase: new URL(siteUrl),
  title: siteName,
  description: "Public writings.",
});

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <>
      <JsonLdScript code={organizationJsonLd(siteUrl)} />
      <JsonLdScript code={websiteJsonLd(siteUrl)} />
      <DesignSystemProvider>
        <GoBack />
        <AnalyticsProvider>
          <RPCProvider>
            <StoreProvider>{children}</StoreProvider>
          </RPCProvider>
        </AnalyticsProvider>
        <FirstTimeVisitorBanner />
      </DesignSystemProvider>
    </>
  );
}
