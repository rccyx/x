import { db } from "@rccyx/db";
import { blogs } from "./../data/mdx";

export async function seedPosts() {
  for (const continuum of blogs) {
    await db.post.upsert({
      where: { slug: continuum.slug },
      update: {
        title: continuum.title,
        summary: continuum.summary,
        isReleased: continuum.isReleased,
        firstModDate: continuum.firstModDate,
        lastModDate: continuum.lastModDate,
        minutesToRead: continuum.minutesToRead,
        tags: continuum.tags,
        category: continuum.category,
        mdxText: continuum.mdxContentRaw,
      },
      create: {
        slug: continuum.slug,
        title: continuum.title,
        summary: continuum.summary,
        isReleased: continuum.isReleased,
        firstModDate: continuum.firstModDate,
        lastModDate: continuum.lastModDate,
        minutesToRead: continuum.minutesToRead,
        tags: continuum.tags,
        category: continuum.category,
        mdxText: continuum.mdxContentRaw,
      },
    });
    // eslint-disable-next-line no-restricted-syntax
    console.log(`[seed] upserted post: ${continuum.slug}`);
  }
}
