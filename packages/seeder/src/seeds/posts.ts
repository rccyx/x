import { db } from "@rccyx/db";
import { blogs } from "./../data/mdx";

export async function seedPosts() {
  for (const blog of blogs) {
    await db.post.upsert({
      where: { slug: blog.slug },
      update: {
        title: blog.title,
        summary: blog.summary,
        isReleased: blog.isReleased,
        firstModDate: blog.firstModDate,
        lastModDate: blog.lastModDate,
        minutesToRead: blog.minutesToRead,
        tags: blog.tags,
        category: blog.category,
        mdxText: blog.mdxContentRaw,
      },
      create: {
        slug: blog.slug,
        title: blog.title,
        summary: blog.summary,
        isReleased: blog.isReleased,
        firstModDate: blog.firstModDate,
        lastModDate: blog.lastModDate,
        minutesToRead: blog.minutesToRead,
        tags: blog.tags,
        category: blog.category,
        mdxText: blog.mdxContentRaw,
      },
    });
    // eslint-disable-next-line no-restricted-syntax
    console.log(`[seed] upserted post: ${blog.slug}`);
  }
}
