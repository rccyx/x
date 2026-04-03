"use client";

import React, { memo } from "react";
import { motion, useReducedMotion } from "@rccyx/design/motion";

import { Button, ScrollArea, Skeleton } from "@rccyx/design/ui";

import type { PostArticleRo, PostTrashArticleRo } from "@rccyx/api/rpc-models";

interface BaseAction {
  label: string;
  variant?: "destructive:outline" | "outline" | "default";
  onClick: () => void;
}

interface BaseItemListConfig<T> {
  title: string;
  emptyMessage: string;
  renderMetadata: (item: T) => React.ReactNode;
  getActions: (item: T) => BaseAction[];
  getItemKey: (item: T) => string;
  getItemTitle: (item: T) => string;
}

interface ItemListProps<T> {
  items: T[];
  config: BaseItemListConfig<T>;
  isLoading?: boolean;
  errorMessage?: string;
}

const ListItem = memo(function ListItemComponent<T>({
  item,
  index,
  config,
  shouldReduceMotion,
}: {
  item: T;
  index: number;
  config: BaseItemListConfig<T>;
  shouldReduceMotion: boolean;
}) {
  const initialAnimation = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, x: -30 };

  const animateAnimation = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, x: 0 };

  const actions = config.getActions(item);

  return (
    <motion.div
      key={config.getItemKey(item)}
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
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">{config.getItemTitle(item)}</h3>
          <div className="text-muted-foreground mb-2 flex flex-wrap items-center gap-2 text-xs">
            {config.renderMetadata(item)}
          </div>
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
          {actions.map((action, actionIndex) => (
            <Button
              key={actionIndex}
              variant={action.variant ?? "default"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}) as <T>(props: {
  item: T;
  index: number;
  config: BaseItemListConfig<T>;
  shouldReduceMotion: boolean;
}) => React.ReactElement;

const ItemList = memo(function ItemListComponent<T>({
  items,
  config,
  errorMessage,
  isLoading,
}: ItemListProps<T>) {
  const shouldReduceMotion = useReducedMotion();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0.2 : 0.4 }}
        className="bg-card rounded-lg border p-4"
      >
        <h2 className="mb-4 text-lg font-semibold">{config.title}</h2>
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{
                duration: shouldReduceMotion ? 0.1 : 0.3,
                delay: shouldReduceMotion ? 0 : i * 0.05,
              }}
              className="border-b pb-4 last:border-0 last:pb-0"
            >
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="mb-1 h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0.2 : 0.4 }}
      className="bg-card rounded-lg border p-4"
    >
      <motion.h2
        initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0.1 : 0.3,
          delay: shouldReduceMotion ? 0 : 0.1,
        }}
        className="mb-4 text-lg font-semibold"
      >
        {config.title}
      </motion.h2>
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0.2 : 0.5,
            delay: shouldReduceMotion ? 0 : 0.2,
          }}
          className="text-muted-foreground py-8 text-center"
        >
          {errorMessage ? errorMessage : config.emptyMessage}
        </motion.div>
      ) : (
        <ScrollArea className="h-[850px] pr-4">
          <div className="space-y-4">
            {items.map((item, index) => (
              <ListItem
                key={config.getItemKey(item)}
                item={item}
                index={index}
                config={config}
                shouldReduceMotion={!!shouldReduceMotion}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </motion.div>
  );
}) as <T>(props: ItemListProps<T>) => React.ReactElement;

// Blog-specific configuration factory
export const createBlogListConfig = (
  onEdit: (blog: PostArticleRo) => void,
  onDelete: (blog: PostArticleRo) => void,
): BaseItemListConfig<PostArticleRo> => ({
  title: "Posts",
  emptyMessage:
    'No posts found. Create your first post by clicking "New Blog".',
  getItemKey: (blog) => blog.slug,
  getItemTitle: (blog) => blog.title,
  renderMetadata: (blog) => (
    <>
      <span className="mr-2 font-semibold">
        {blog.isReleased ? "Released" : "Draft"}
      </span>
      <span className="font-semibold">
        {new Date(blog.lastModDate).toLocaleDateString()}
      </span>
    </>
  ),
  getActions: (blog) => [
    {
      label: "Edit",
      variant: "outline",
      onClick: () => onEdit(blog),
    },
    {
      label: "Delete",
      variant: "destructive:outline",
      onClick: () => onDelete(blog),
    },
  ],
});

// Trash-specific configuration factory
export const createTrashListConfig = (
  onRestore: (item: PostTrashArticleRo) => void,
  onPurge: (item: PostTrashArticleRo) => void,
): BaseItemListConfig<PostTrashArticleRo> => ({
  title: "Trash",
  emptyMessage: "Trash is empty.",
  getItemKey: (item) => item.id,
  getItemTitle: (item) => item.title,
  renderMetadata: (item) => (
    <>
      <span>{new Date(item.deletedAt).toLocaleString()}</span>
    </>
  ),
  getActions: (item) => [
    {
      label: "Restore",
      variant: "outline",
      onClick: () => onRestore(item),
    },
    {
      label: "Purge",
      variant: "destructive:outline",
      onClick: () => onPurge(item),
    },
  ],
});

// Specific implementations to avoid TypeScript generic issues
export const BlogList = ({
  blogs,
  onEdit,
  onDelete,
  isLoading,
  errorMessage,
}: {
  blogs: PostArticleRo[];
  onEdit: (blog: PostArticleRo) => void;
  onDelete: (blog: PostArticleRo) => void;
  isLoading?: boolean;
  errorMessage?: string;
}) => {
  const config = createBlogListConfig(onEdit, onDelete);
  return (
    <ItemList
      items={blogs}
      errorMessage={errorMessage}
      config={config}
      isLoading={isLoading}
    />
  );
};

export const TrashList = ({
  items,
  onRestore,
  onPurge,
  isLoading,
}: {
  items: PostTrashArticleRo[];
  onRestore: (item: PostTrashArticleRo) => void;
  onPurge: (item: PostTrashArticleRo) => void;
  isLoading?: boolean;
}) => {
  const config = createTrashListConfig(onRestore, onPurge);
  return <ItemList items={items} config={config} isLoading={isLoading} />;
};

BlogList.displayName = "BlogList";
TrashList.displayName = "TrashList";
