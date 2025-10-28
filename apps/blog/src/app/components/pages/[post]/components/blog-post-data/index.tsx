"use client";
import Link from "next/link";
import { Edit } from "@ashgw/design/icons";

import { DateService } from "@ashgw/cross-runtime";
import { Badge } from "@ashgw/design/ui";
import { Views } from "~/app/components/shared/views";

import { featuredComponents } from "~/app/components/shared/mdx-custom/featured/blog";
import { ScrollUp } from "~/app/components/pages/home/components/postCards/components/ScrollUp";
import { H1 } from "../../../../shared/mdx-custom/headers";
import { MDX } from "../../../../shared/mdx-custom/mdx";
import type { PostArticleRo } from "@ashgw/api/rpc-models";
import { ReleaseDate } from "./ReleaseDate";
import { ViewTracker } from "./ViewTracker";

interface BlogPostProps {
  postData: PostArticleRo;
}

export function BlogPostData({ postData }: BlogPostProps) {
  return (
    <section className="layout mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
      {/* client child */}
      <ViewTracker postSlug={postData.slug} />
      <div className="flex items-center justify-between">
        <H1 id={postData.title}>{postData.title}</H1>
        <Link
          href={`/editor?blog=${postData.slug}`}
          aria-label={`Edit blog post: ${postData.title}`}
          className="ml-2 transition-duration-100 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Edit className="h-4 w-4" />
        </Link>
      </div>

      <div className="mb-8 flex items-center justify-between text-sm font-semibold sm:max-w-[450px] md:max-w-[550px] lg:max-w-[650px] xl:max-w-[750px]">
        <div className="text-muted-foreground flex items-center gap-2">
          <ReleaseDate date={postData.firstModDate.toISOString()} />
          <span className="scale-150 select-none text-white/40">·</span>
          <Views
            slug={postData.slug}
            initial={postData.views}
            className="text-sm font-semibold opacity-70"
            titlePrefix=""
          />
        </div>
        <div>
          {DateService.isSameMonthAndYear({
            stringDate: postData.firstModDate.toISOString(),
          }) ? (
            <div className="opacity-0 hover:opacity-100 transition-opacity duration-[var(--ds-duration-normal)] ease-in-out">
              <Badge appearance="outline">Recent</Badge>
            </div>
          ) : (
            <div className="opacity-0 hover:opacity-100 transition-opacity duration-[var(--ds-duration-normal)] ease-in-out">
              <Badge appearance="outline">Archive</Badge>
            </div>
          )}
        </div>
      </div>
      <article className="text-wrap">
        <MDX
          source={postData.fontMatterMdxContent.body}
          components={featuredComponents}
        />
      </article>
      <ScrollUp />
    </section>
  );
}
