import { memo } from "react";
import { motion } from "@rccyx/design/motion";

import { Button } from "@rccyx/design/ui";

import type { PostArticleRo } from "@rccyx/api/rpc-models";

interface BlogItemProps {
  blog: PostArticleRo;
  index: number;
  onEdit: (blog: PostArticleRo) => void;
  onDelete: (blog: PostArticleRo) => void;
  shouldReduceMotion: boolean;
}

export const BlogItem = memo(
  ({ blog, index, onEdit, onDelete, shouldReduceMotion }: BlogItemProps) => {
    const initialAnimation = shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, x: -30 };

    const animateAnimation = shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 1, x: 0 };

    return (
      <motion.div
        key={blog.slug}
        initial={initialAnimation}
        animate={animateAnimation}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.4,
          delay: shouldReduceMotion ? 0 : index * 0.05,
          type: shouldReduceMotion ? "tween" : "spring",
          stiffness: shouldReduceMotion ? undefined : 100,
        }}
        className="rounded-md border-b p-3 pb-4 last:border-0 last:pb-0"
      >
        <h3 className="font-semibold">{blog.title}</h3>
        <div className="text-muted-foreground mb-2 flex text-xs font-semibold">
          <span className="mr-2 font-semibold">
            {blog.isReleased ? "Released" : "Draft"}
          </span>
          <span className="font-semibold">
            {new Date(blog.lastModDate).toLocaleDateString()}
          </span>
        </div>
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0.1 : 0.3,
            delay: shouldReduceMotion ? 0 : 0.1 + index * 0.05,
          }}
        >
          <Button role="secondary" onClick={() => onEdit(blog)}>
            Edit
          </Button>
          <Button
            appearance="outline"
            tone="danger"
            role="secondary"
            onClick={() => onDelete(blog)}
          >
            Delete
          </Button>
        </motion.div>
      </motion.div>
    );
  },
);

BlogItem.displayName = "BlogItem";
