import type { Metadata } from "next";

import { createMetadata } from "@rccyx/seo";

import { TagsPage } from "~/app/components/pages/[tag]";
import { HydrateRpcClient, rpc } from "@rccyx/api/rpc-server";

interface DynamicRouteParams {
  params: { tag: string };
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Continuum",
  description: "Sort by tag.",
});

export default async function Tags({ params }: DynamicRouteParams) {
  const posts = await rpc.post.getPublicPostCards();
  return (
    <HydrateRpcClient>
      <TagsPage posts={posts} tag={params.tag} />;
    </HydrateRpcClient>
  );
}
