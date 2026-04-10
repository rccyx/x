import type { Metadata } from "next";

import { createMetadata } from "@rccyx/seo";

import { HomePage } from "~/app/components/pages/home";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Continuum",
  description: "Welcome to my continuum.",
});

export default function Page() {
  return <HomePage />;
}
