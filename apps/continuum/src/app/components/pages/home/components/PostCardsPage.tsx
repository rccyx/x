import type { PostCardRo } from "@rccyx/api/rpc-models";
import { PostCards } from "~/app/components/pages/home/components/postCards";
import { PostsProvider } from "~/app/components/pages/home/components/postCards/components/Context";

export function PostCardsPage({ posts }: { posts: PostCardRo[] }) {
  return (
    <>
      <section className="layout mx-auto sm:max-w-xl md:max-w-3xl lg:max-w-3xl xl:max-w-3xl">
        <PostsProvider>
          <PostCards posts={posts} />
        </PostsProvider>
        <div className="h-full w-auto"></div>
      </section>
      <div className="py-6" />
    </>
  );
}
