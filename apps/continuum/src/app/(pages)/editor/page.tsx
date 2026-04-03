import { createMetadata } from "@rccyx/seo";

import { EditorPage } from "~/app/components/pages/editor";

export const metadata = createMetadata({
  title: "Editor",
  description: "Editor",
});

export default function Page() {
  return <EditorPage />;
}
