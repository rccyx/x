"use client";

import { useMemo } from "react";
import { motion } from "@rccyx/design/motion";
import {
  Check,
  SortAsc,
  SortDesc,
  Type,
  History,
  Calendar,
  BadgeCheck,
  FilePen,
  ListChecks,
  FolderTree,
  Tag,
} from "@rccyx/design/icons";

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@rccyx/design/ui";

import type { PostArticleRo } from "@rccyx/api/rpc-models";
import { PostCategoryEnum } from "@rccyx/api/rpc-models";

export type SortField = "title" | "lastModDate" | "firstModDate";
export type SortOrder = "asc" | "desc";
export type StatusFilter = "all" | "released" | "draft";
export type CategoryFilter = PostCategoryEnum | "all";
export type TagFilter = string | null;

export interface SortOptions {
  sortField: SortField;
  sortOrder: SortOrder;
  statusFilter: StatusFilter;
  categoryFilter: CategoryFilter;
  tagFilter: TagFilter;
}

interface SortOptionsProps {
  options: SortOptions;
  onOptionsChange: (options: SortOptions) => void;
  blogs: PostArticleRo[];
}

const formatCategoryName = (category: string): string => {
  return category.charAt(0) + category.slice(1).toLowerCase();
};

export function SortOptions({
  options,
  onOptionsChange,
  blogs,
}: SortOptionsProps) {
  const allTags = useMemo(
    () => Array.from(new Set(blogs.flatMap((blog) => blog.tags))).sort(),
    [blogs],
  );

  const updateOptions = (newOptions: Partial<SortOptions>) => {
    onOptionsChange({ ...options, ...newOptions });
  };

  const toggleSortOrder = () => {
    updateOptions({ sortOrder: options.sortOrder === "asc" ? "desc" : "asc" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 150, damping: 15 },
    },
  };

  return (
    <motion.div
      className="flex flex-wrap items-center gap-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Sort Field and Order */}
      <motion.div variants={itemVariants}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              role="secondary"
              className="flex h-8 items-center gap-1"
              size="sm"
            >
              <span>Sort</span>
              {options.sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[180px]">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => updateOptions({ sortField: "title" })}
              className="flex items-center justify-between"
            >
              <span className="flex items-center">
                <Type className="mr-2 h-4 w-4" />
                Title
              </span>
              {options.sortField === "title" && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateOptions({ sortField: "lastModDate" })}
              className="flex items-center justify-between"
            >
              <span className="flex items-center">
                <History className="mr-2 h-4 w-4" />
                Last Modified
              </span>
              {options.sortField === "lastModDate" && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateOptions({ sortField: "firstModDate" })}
              className="flex items-center justify-between"
            >
              <span className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Created Date
              </span>
              {options.sortField === "firstModDate" && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleSortOrder}>
              <span className="flex items-center">
                {options.sortOrder === "asc" ? (
                  <>
                    <SortAsc className="mr-2 h-4 w-4" />
                    Ascending
                  </>
                ) : (
                  <>
                    <SortDesc className="mr-2 h-4 w-4" />
                    Descending
                  </>
                )}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Status Filter */}
      <motion.div variants={itemVariants}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              role="secondary"
              className="flex h-8 items-center gap-1"
              size="sm"
            >
              <span>Status</span>
              <ListChecks className="h-4 w-4" />
              {options.statusFilter !== "all" && (
                <Badge
                  appearance={"outline"}
                  className="ml-1 px-1 py-0 text-xs"
                >
                  {options.statusFilter === "released" ? "Released" : "Draft"}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[180px]">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => updateOptions({ statusFilter: "all" })}
              className="flex items-center justify-between"
            >
              <span>All</span>
              {options.statusFilter === "all" && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateOptions({ statusFilter: "released" })}
              className="flex items-center justify-between"
            >
              <span className="flex items-center">
                <BadgeCheck className="mr-2 h-4 w-4" />
                Released
              </span>
              {options.statusFilter === "released" && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateOptions({ statusFilter: "draft" })}
              className="flex items-center justify-between"
            >
              <span className="flex items-center">
                <FilePen className="mr-2 h-4 w-4" />
                Draft
              </span>
              {options.statusFilter === "draft" && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Category Filter */}
      <motion.div variants={itemVariants}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              role="secondary"
              className="flex h-8 items-center gap-1"
              size="sm"
            >
              <span>Category</span>
              <FolderTree className="h-4 w-4" />
              {options.categoryFilter !== "all" && (
                <Badge className="ml-1 px-1 py-0 text-xs">
                  {formatCategoryName(options.categoryFilter)}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[180px]">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => updateOptions({ categoryFilter: "all" })}
              className="flex items-center justify-between"
            >
              <span>All Categories</span>
              {options.categoryFilter === "all" && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
            {Object.values(PostCategoryEnum).map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => updateOptions({ categoryFilter: category })}
                className="flex items-center justify-between"
              >
                <span>{formatCategoryName(category)}</span>
                {options.categoryFilter === category && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Tag Filter */}
      {allTags.length > 0 ? (
        <motion.div variants={itemVariants}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                role="secondary"
                className="flex h-8 items-center gap-1"
                size="sm"
              >
                <span>Tag</span>
                <Tag className="h-4 w-4" />
                {options.tagFilter && (
                  <Badge className="ml-1 px-1 py-0 text-xs">
                    {options.tagFilter}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="max-h-[300px] w-[180px] overflow-y-auto"
            >
              <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => updateOptions({ tagFilter: null })}
                className="flex items-center justify-between"
              >
                <span>All Tags</span>
                {options.tagFilter === null && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              {allTags.map((tag) => (
                <DropdownMenuItem
                  key={tag}
                  onClick={() => updateOptions({ tagFilter: tag })}
                  className="flex items-center justify-between"
                >
                  <span>{tag}</span>
                  {options.tagFilter === tag && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
