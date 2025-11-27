import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { siteName } from "@rccyx/constants";
import {
  createMetadata,
  organizationJsonLd,
  websiteJsonLd,
  JsonLdScript,
} from "@rccyx/seo";
import { AnalyticsProvider } from "@rccyx/analytics/client";
import { DesignSystemProvider } from "@rccyx/design/provider";

import { env } from "@rccyx/env";
import { RestProvider } from "@rccyx/api/rest-client";

const description = "Modern renaissance spirit.";

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
          <RestProvider>{children}</RestProvider>
        </AnalyticsProvider>
      </DesignSystemProvider>
    </>
  );
}
