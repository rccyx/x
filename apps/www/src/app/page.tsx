import type { Metadata } from "next";

import { createMetadata } from "@rccyx/seo";

import { HomePage } from "~/app/components/pages/home";

export const metadata: Metadata = createMetadata({
  title: "Home",
  description: "Welcome home.",
});

export default function Page() {
  return <HomePage />;
}
