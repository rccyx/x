"use client";

import type { UseFormReturn } from "react-hook-form";
import { motion } from "@rccyx/design/motion";

import { DateService } from "@rccyx/cross-runtime";
import { Badge, Skeleton } from "@rccyx/design/ui";

import type { PostEditorDto } from "@rccyx/api/rpc-models";
import { featuredComponents } from "~/app/components/shared/mdx-custom/featured/continuum";
import { H1 } from "../../../../shared/mdx-custom/headers";
import { ClientMDX } from "../../../../shared/mdx-custom/mdx/client";

interface BlogPreviewProps {
  isVisible: boolean;
  form: UseFormReturn<PostEditorDto>;
  title: string;
  creationDate: string;
}

export function BlogPreview({
  isVisible,
  form,
  title,
  creationDate,
}: BlogPreviewProps) {
  const mdxContent = form.watch("mdxText");
  const titleValue = form.watch("title");

  if (!isVisible) return null;

  const formattedDate = DateService.formatDate({ stringDate: creationDate });

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-card max-h-[850px] overflow-y-auto rounded-lg border p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.4,
          type: "spring",
          stiffness: 100,
        }}
      >
        <section className="layout mx-auto">
          <div className="flex items-center justify-between">
            <H1 id={titleValue || title}>{titleValue || title}</H1>
          </div>
          <div className="mb-8 flex items-center justify-between text-sm font-semibold">
            <div>{formattedDate}</div>
            <div>
              <div className="transition-duration-200">
                <Badge size={"lg"} appearance={"outline"} tone={"neutral"}>
                  Preview
                </Badge>
              </div>
            </div>
          </div>
          <article className="text-wrap">
            {mdxContent ? (
              <ClientMDX source={mdxContent} components={featuredComponents} />
            ) : (
              <Skeleton className="h-48 w-full" />
            )}
          </article>
        </section>
      </motion.div>
    </motion.div>
  );
}
