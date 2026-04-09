import { PostCardsPage } from "./components/PostCardsPage";
import { HydrateRpcClient, rpc } from "@rccyx/api/rpc-server";

export async function HomePage() {
  const posts = await rpc.post.getPublicPostCards();
  return (
    <HydrateRpcClient>
      <PostCardsPage posts={posts} />
    </HydrateRpcClient>
  );
}
