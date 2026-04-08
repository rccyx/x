import { PostCardsPage } from "./components/PostCardsPage";
import { HydrateRpcClient, rpcBare } from "@rccyx/api/rpc-server";

export async function HomePage() {
  const posts = await rpcBare.post.getPublicPostCards();
  return (
    <HydrateRpcClient>
      <PostCardsPage posts={posts} />
    </HydrateRpcClient>
  );
}
