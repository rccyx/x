"use client";

import { useState, useEffect } from "react";

import type { Optional } from "typyx";
import type { EntityViewState } from "@rccyx/design/ui";
import type { PostArticleRo } from "@rccyx/api/rpc-models";
import type { SortOptions } from "../components/header/components/SortOptions";

export function useEditorUIState() {
  const [selectedBlog, setSelectedBlog] =
    useState<Optional<PostArticleRo>>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isTrashingBlog, setIsTrashingBlog] = useState(false);

  const [editModal, setEditModal] = useState<EntityViewState<PostArticleRo>>({
    visible: false,
  });

  const [deleteModal, setDeleteModal] = useState<
    EntityViewState<PostArticleRo>
  >({
    visible: false,
  });

  const [sortOptions, setSortOptions] = useState<SortOptions>({
    sortField: "lastModDate",
    sortOrder: "desc",
    statusFilter: "all",
    categoryFilter: "all",
    tagFilter: null,
  });

  useEffect(() => {
    if (deleteModal.visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [deleteModal.visible]);

  const togglePreview = () => setIsPreviewMode((prev) => !prev);

  const openEditModal = (blog: PostArticleRo) => {
    setEditModal({ visible: true, entity: blog });
  };

  const closeEditModal = () => {
    setEditModal({ visible: false });
  };

  const openDeleteModal = (blog: PostArticleRo) => {
    setIsTrashingBlog(true);
    setDeleteModal({ visible: true, entity: blog });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ visible: false });
    setIsTrashingBlog(false);
  };

  return {
    selectedBlog,
    setSelectedBlog,
    isPreviewMode,
    togglePreview,
    isTrashingBlog,
    setIsTrashingBlog,
    editModal,
    openEditModal,
    closeEditModal,
    deleteModal,
    openDeleteModal,
    closeDeleteModal,
    sortOptions,
    setSortOptions,
  };
}
