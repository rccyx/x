import Link from "next/link";
import { Views } from "~/app/components/shared/views";

import { DateService } from "@rccyx/cross-runtime";

import type { PostCardRo } from "@rccyx/api/rpc-models";
import { Button, SurfaceCard } from "@rccyx/design/ui";

export function PostCard({ postData }: { postData: PostCardRo }) {
  return (
    <div className="mx-auto mt-8 w-full max-w-[1280px] px-5 sm:mt-24 sm:px-10">
      <SurfaceCard animation={"glowScale"} size="default">
        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="text-muted-foreground flex items-center gap-2 px-1 text-sm font-semibold">
            <span>
              {DateService.formatDate({
                stringDate: postData.firstModDate.toISOString(),
              })}
            </span>
            <span className="mx-1 scale-150 select-none text-white/40">·</span>
            <Views
              slug={postData.slug}
              initial={postData.views}
              className="hidden items-center gap-1 opacity-70"
            />
          </div>

          <Link href={`/${postData.slug}`}>
            <h2 className="text-dim-400 text-2xl font-bold lg:text-[2.5rem]">
              {postData.title}
            </h2>
            <p className="text-dim-300 mt-3 lg:text-xl">{postData.summary}</p>
          </Link>

          <div className="text-dim-400 flex flex-wrap items-center gap-[0.625rem] text-sm font-semibold">
            {postData.tags.map((tag) => (
              <Button variant="outline:rounded" key={tag}>
                <Link href={`/tag/${tag}`} key={tag}>
                  {tag}
                </Link>
              </Button>
            ))}
            <div className="text-dim-200 flex items-center gap-2">
              <span>
                {postData.minutesToRead
                  ? `${postData.minutesToRead} minutes`
                  : "∞ minutes"}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/${postData.slug}`}
          className="relative h-full overflow-hidden rounded-[2rem]"
        />
      </SurfaceCard>
    </div>
  );
}
