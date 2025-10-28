import { cache } from "react";
import type { Metadata } from "next";
import { NotFound } from "@ashgw/components";
import { createMetadata } from "@ashgw/seo";
import { BlogPostPage } from "~/app/components/pages/[post]";
import { trpcHttpServerSideClient, HydrateTrpcClient } from "@ashgw/api/trpc";

const getPostCached = cache((slug: string) =>
  trpcHttpServerSideClient.post.getDetailedPublicPost.query({ slug }),
);

export async function generateMetadata({
  params,
}: {
  params: { post: string };
}): Promise<Metadata> {
  const postData = await getPostCached(params.post);
  if (!postData) {
    return {
      title: "Post not found",
      description: `The post (${params.post}) was not found`,
      robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
      },
    };
  }
  const isDraft = !postData.isReleased;
  return createMetadata({
    title: postData.title,
    robots: isDraft
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        }
      : undefined,
    description: postData.summary,
    keywords: postData.tags,
  });
}

export default async function Page({ params }: { params: { post: string } }) {
  const postData = await getPostCached(params.post);
  if (!postData)
    return <NotFound message={`No post found that matches /${params.post}`} />;

  return (
    <HydrateTrpcClient>
      <BlogPostPage postData={postData} />
    </HydrateTrpcClient>
  );
}
