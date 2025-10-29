import type { Metadata } from "next";

import { createMetadata } from "@ashgw/seo";

import { TagsPage } from "~/app/components/pages/[tag]";
import { HydrateRpcClient, rpcHttpServer } from "@ashgw/api/rpc-server";

interface DynamicRouteParams {
  params: { tag: string };
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Blog",
  description: "Sort by tag.",
});

export default async function Tags({ params }: DynamicRouteParams) {
  const posts = await rpcHttpServer.post.getPublicPostCards.query();
  return (
    <HydrateRpcClient>
      <TagsPage posts={posts} tag={params.tag} />;
    </HydrateRpcClient>
  );
}
