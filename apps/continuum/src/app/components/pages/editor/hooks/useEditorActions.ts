"use client";

import { useCallback } from "react";
import type { SubmitHandler } from "react-hook-form";
import { toast } from "@rccyx/design/ui";

import { logger } from "@rccyx/logger";
import type { PostArticleRo, PostEditorDto } from "@rccyx/api/rpc-models";
import { rpcClient } from "@rccyx/api/rpc-client";
import { useStore } from "~/app/stores";

import type { useEditorData } from "./useEditorData";
import type { useEditorFormState } from "./useEditorFormState";
import type { useEditorUIState } from "./useEditorUIState";

interface UseEditorActionsParams {
  data: ReturnType<typeof useEditorData>;
  form: ReturnType<typeof useEditorFormState>;
  ui: ReturnType<typeof useEditorUIState>;
}

export function useEditorActions({ data, form, ui }: UseEditorActionsParams) {
  const { store } = useStore();

  const createPost = rpcClient.post.createPost.useMutation({
    onSuccess: () => {
      toast.success("Blog post created successfully");
      void data.utils.post.getAllAdminPosts.invalidate();
      _resetToNewBlog();
    },
    onError: (error) => {
      logger.error("Failed to create post", { error });
      toast.error("Failed to create post", { description: error.message });
    },
  });

  const updatePost = rpcClient.post.updatePost.useMutation({
    onSuccess: () => {
      toast.success("Blog post updated successfully");
      void data.utils.post.getAllAdminPosts.invalidate();
      _resetToNewBlog();
    },
    onError: (error) => {
      logger.error("Failed to update post", { error });
      toast.error("Failed to update post", { description: error.message });
    },
  });

  const trashPost = rpcClient.post.trashPost.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Blog post deleted successfully");
      store.editor.movePostToTrash(variables.slug);
      void data.utils.post.getAllAdminPosts.invalidate();
      void data.utils.post.getTrashedPosts.invalidate();
      ui.closeDeleteModal();
      if (ui.editModal.visible && ui.editModal.entity.slug === variables.slug) {
        _resetToNewBlog();
      }
    },
    onError: (error) => {
      logger.error("Failed to delete post", { error });
      toast.error("Failed to delete post", { description: error.message });
      ui.setIsTrashingBlog(false);
    },
  });

  const restorePost = rpcClient.post.restoreFromTrash.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Post restored successfully");
      store.editor.restorePostFromTrash(variables.trashId);
      void data.utils.post.getTrashedPosts.invalidate();
      void data.utils.post.getAllAdminPosts.invalidate();
    },
    onError: (error) => {
      logger.error("Failed to restore post", { error });
      toast.error("Failed to restore post", { description: error.message });
    },
  });

  const purgePost = rpcClient.post.purgeTrashPost.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Post permanently deleted");
      store.editor.purgePostFromTrash(variables.trashId);
      void data.utils.post.getTrashedPosts.invalidate();
    },
    onError: (error) => {
      logger.error("Failed to purge post", { error });
      toast.error("Failed to purge post", { description: error.message });
    },
  });

  const _resetToNewBlog = useCallback(() => {
    ui.setSelectedBlog(null);
    ui.closeEditModal();
    form.resetToEmpty();
    const url = new URL(window.location.href);
    url.searchParams.delete("blog");
    window.history.replaceState({}, "", url.toString());
  }, [form, ui]);

  const startNewBlog = useCallback(() => {
    _resetToNewBlog();
  }, [_resetToNewBlog]);

  const editBlog = useCallback(
    (blog: PostArticleRo) => {
      if (ui.isTrashingBlog) return;
      ui.setSelectedBlog(blog);
      ui.openEditModal(blog);
      form.loadFromBlog(blog);
      logger.info("Editing blog", { slug: blog.slug });
    },
    [form, ui],
  );

  const deleteBlog = useCallback(
    (blog: PostArticleRo) => {
      ui.openDeleteModal(blog);
    },
    [ui],
  );

  const confirmDelete = useCallback(() => {
    if (ui.deleteModal.visible) {
      trashPost.mutate({ slug: ui.deleteModal.entity.slug });
    }
  }, [ui.deleteModal, trashPost]);

  const cancelDelete = useCallback(() => {
    ui.closeDeleteModal();
  }, [ui]);

  const submitForm: SubmitHandler<PostEditorDto> = useCallback(
    (formData) => {
      if (ui.editModal.visible) {
        updatePost.mutate({ slug: ui.editModal.entity.slug, data: formData });
      } else {
        createPost.mutate(formData);
      }
    },
    [ui.editModal, updatePost, createPost],
  );

  const restoreBlog = useCallback(
    (item: { id: string }) => {
      restorePost.mutate({ trashId: item.id });
    },
    [restorePost],
  );

  const purgeBlog = useCallback(
    (item: { id: string }) => {
      purgePost.mutate({ trashId: item.id });
    },
    [purgePost],
  );

  return {
    startNewBlog,
    editBlog,
    deleteBlog,
    confirmDelete,
    cancelDelete,
    submitForm,
    restoreBlog,
    purgeBlog,
    isSubmitting: createPost.isPending || updatePost.isPending,
    isDeletingPost: trashPost.isPending,
  };
}
