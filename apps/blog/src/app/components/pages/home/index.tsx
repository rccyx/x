import { PostCardsPage } from "./components/PostCardsPage";
import { HydrateRpcClient, rpcHttpServer } from "@ashgw/api/rpc-server";

export async function HomePage() {
  const posts = await rpcHttpServer.post.getPublicPostCards.query();
  return (
    <HydrateRpcClient>
      <PostCardsPage posts={posts} />
    </HydrateRpcClient>
  );
}
