import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import {
  createMetadata,
  JsonLdScript,
  organizationJsonLd,
  websiteJsonLd,
} from "@ashgw/seo";

import { AnalyticsProvider } from "@ashgw/analytics/client";
import { env } from "@ashgw/env";
import { DesignSystemProvider } from "@ashgw/design/provider";

import { TRPCProvider } from "@ashgw/api/trpc";
import { GoBack } from "./components/pages/root";
import { StoreProvider } from "./stores";
import { siteName } from "@ashgw/constants";
import { FirstTimeVisitorBanner } from "@ashgw/components";

const siteUrl = env.NEXT_PUBLIC_BLOG_URL;

export const metadata: Metadata = createMetadata({
  metadataBase: new URL(siteUrl),
  title: siteName,
  description: "Blog",
});

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <>
      <JsonLdScript code={organizationJsonLd(siteUrl)} />
      <JsonLdScript code={websiteJsonLd(siteUrl)} />
      <DesignSystemProvider>
        <GoBack />
        <AnalyticsProvider>
          <TRPCProvider siteBaseUrl={siteUrl}>
            <StoreProvider>{children}</StoreProvider>
          </TRPCProvider>
        </AnalyticsProvider>
        <FirstTimeVisitorBanner />
      </DesignSystemProvider>
    </>
  );
}
