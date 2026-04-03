import type { Metadata } from "next";

import { createMetadata } from "@rccyx/seo";

import { HomePage } from "~/app/components/pages/home";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Blog",
  description: "Welcome to my blog.",
});

export default function Page() {
  return <HomePage />;
}
