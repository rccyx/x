import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { siteName } from "@ashgw/constants";
import {
  createMetadata,
  organizationJsonLd,
  websiteJsonLd,
  JsonLdScript,
} from "@ashgw/seo";
import { AnalyticsProvider } from "@ashgw/analytics/client";
import { DesignSystemProvider } from "@ashgw/design/provider";

import { env } from "@ashgw/env";
import { TsrProvider } from "@ashgw/api/ts-rest";

const description = "Building the future.";

const siteUrl = env.NEXT_PUBLIC_WWW_URL;

export const metadata: Metadata = createMetadata({
  title: siteName,
  description,
  metadataBase: new URL(siteUrl),
});

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <>
      <JsonLdScript code={organizationJsonLd(siteUrl)} />
      <JsonLdScript code={websiteJsonLd(siteUrl)} />
      <DesignSystemProvider>
        <AnalyticsProvider>
          <TsrProvider>{children}</TsrProvider>
        </AnalyticsProvider>
      </DesignSystemProvider>
    </>
  );
}
