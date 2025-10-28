import type { PostCardRo } from "@ashgw/api/rpc-models";
import { PostCardsPage } from "~/app/components/pages/home/components/PostCardsPage";
import { NoTagsFound } from "./components/NoTagsFound";

export function TagsPage({ posts, tag }: { posts: PostCardRo[]; tag: string }) {
  const postsWithTag: PostCardRo[] = [];

  const allAvailableTags = new Set<string>("");

  posts.forEach((post) => {
    if (post.tags.includes(tag)) {
      postsWithTag.push(post);
    }
    post.tags.forEach((tag) => allAvailableTags.add(tag));
  });

  if (postsWithTag.length > 0) {
    return <PostCardsPage posts={postsWithTag} />;
  }

  return <NoTagsFound validTags={allAvailableTags} />;
}
