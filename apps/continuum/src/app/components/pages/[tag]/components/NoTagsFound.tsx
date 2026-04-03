"use client";

import Link from "next/link";
import { motion } from "@rccyx/design/motion";

import { H2 } from "~/app/components/shared/mdx-custom/headers";

interface NoTagsFoundProps {
  validTags: Set<string>;
}

export function NoTagsFound({ validTags }: NoTagsFoundProps) {
  const randomTagCount = Math.floor(Math.random() * 3) + 4; // Returns 4, 5, or 6

  const shuffledTags = [...validTags].sort(() => 0.5 - Math.random());

  const suggestedTags = shuffledTags.slice(0, randomTagCount);

  return (
    <div className="mx-auto mt-8 w-full max-w-[1280px] px-5 sm:px-10">
      <motion.div
        className="group flex flex-col gap-4 rounded-[2rem] p-5 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex flex-col items-center">
          <H2>Try these instead</H2>
        </div>
        <div className="mt-4">
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {suggestedTags.map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, y: 50, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                <Link
                  href={`/tag/${tag}`}
                  className="relative scale-125 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold transition-all duration-200 ease-in-out hover:border-white/20"
                >
                  {tag}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
