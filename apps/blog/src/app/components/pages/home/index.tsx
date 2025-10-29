import { PostCardsPage } from "./components/PostCardsPage";
import { HydrateTrpcClient, trpcHttpServerSideClient } from "@ashgw/api/trpc";

export async function HomePage() {
  const posts = await trpcHttpServerSideClient.post.getPublicPostCards.query();
  return (
    <HydrateTrpcClient>
      <PostCardsPage posts={posts} />
    </HydrateTrpcClient>
  );
}
