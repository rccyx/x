import { PostCardsPage } from "./components/PostCardsPage";
import { HydrateRpcClient, rpcServer } from "@ashgw/api/rpc-server";

export async function HomePage() {
  const posts = await rpcServer.post.getPublicPostCards.query();
  return (
    <HydrateRpcClient>
      <PostCardsPage posts={posts} />
    </HydrateRpcClient>
  );
}
