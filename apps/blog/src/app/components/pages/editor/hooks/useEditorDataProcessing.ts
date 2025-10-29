"use client";

import { useMemo, useEffect } from "react";

import type { PostArticleRo } from "@ashgw/api/rpc-models";
import type { SortOptions } from "../components/header/components/SortOptions";

import type { useEditorData } from "./useEditorData";
import type { useEditorUIState } from "./useEditorUIState";
import type { useEditorActions } from "./useEditorActions";

interface UseEditorDataProcessingParams {
  data: ReturnType<typeof useEditorData>;
  ui: ReturnType<typeof useEditorUIState>;
  actions: ReturnType<typeof useEditorActions>;
}

export function useEditorDataProcessing({
  data,
  ui,
  actions,
}: UseEditorDataProcessingParams) {
  const filteredAndSortedPosts = useMemo(() => {
    return _filterAndSortPosts(data.posts, ui.sortOptions);
  }, [data.posts, ui.sortOptions]);

  useEffect(() => {
    if (
      data.blogFromUrl &&
      !ui.selectedBlog &&
      !ui.isPreviewMode &&
      !ui.isTrashingBlog &&
      data.viewMode === "active"
    ) {
      actions.editBlog(data.blogFromUrl);
    }
  }, [
    data.blogFromUrl,
    ui.selectedBlog,
    ui.isPreviewMode,
    ui.isTrashingBlog,
    data.viewMode,
    actions,
  ]);

  const showEditorSkeleton =
    data.isLoadingSpecificPost && !!data.blogSlug && !ui.isTrashingBlog;

  const previewTitle = ui.editModal.visible
    ? ui.editModal.entity.title
    : "Preview Title";
  const previewDate = ui.editModal.visible
    ? ui.editModal.entity.firstModDate.toISOString()
    : new Date().toISOString();

  return {
    filteredAndSortedPosts,
    showEditorSkeleton,
    previewTitle,
    previewDate,
  };
}

function _filterAndSortPosts(
  posts: PostArticleRo[] | undefined,
  sortOptions: SortOptions,
): PostArticleRo[] {
  if (!posts) return [];
  let filtered = [...posts];

  if (sortOptions.statusFilter !== "all") {
    const isReleased = sortOptions.statusFilter === "released";
    filtered = filtered.filter((post) => post.isReleased === isReleased);
  }

  if (sortOptions.categoryFilter !== "all") {
    filtered = filtered.filter(
      (post) => post.category === sortOptions.categoryFilter,
    );
  }

  if (sortOptions.tagFilter !== null) {
    const tagFilter = sortOptions.tagFilter;
    filtered = filtered.filter((post) => post.tags.includes(tagFilter));
  }

  return filtered.sort((a, b) => {
    const aValue = a[sortOptions.sortField];
    const bValue = b[sortOptions.sortField];

    if (
      sortOptions.sortField === "lastModDate" ||
      sortOptions.sortField === "firstModDate"
    ) {
      const dateA = new Date(aValue).getTime();
      const dateB = new Date(bValue).getTime();
      return sortOptions.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOptions.sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });
}
