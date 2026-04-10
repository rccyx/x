"use client";

import { useCallback } from "react";
import type { SubmitHandler } from "react-hook-form";
import { toast } from "@rccyx/design/ui";

import { logger } from "@rccyx/logger";
import type { PostArticleRo, PostEditorDto } from "@rccyx/api/rpc-models";
import { rpc } from "@rccyx/api/rpc-client";
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

  const createPost = rpc.post.createPost.useMutation({
    onSuccess: async () => {
      toast.success("Continuum post created successfully");
      await data.utils.post.getAllAdminPosts.invalidate();
      _resetToNewBlog();
    },
    onError: (error) => {
      logger.error("Failed to create post", { error });
      toast.error("Failed to create post", { description: error.message });
    },
  });

  const updatePost = rpc.post.updatePost.useMutation({
    onSuccess: async () => {
      toast.success("Continuum post updated successfully");
      await data.utils.post.getAllAdminPosts.invalidate();
      _resetToNewBlog();
    },
    onError: (error) => {
      logger.error("Failed to update post", { error });
      toast.error("Failed to update post", { description: error.message });
    },
  });

  const trashPost = rpc.post.trashPost.useMutation({
    onSuccess: async (_, variables) => {
      toast.success("Continuum post deleted successfully");
      store.editor.movePostToTrash(variables.slug);
      await data.utils.post.getAllAdminPosts.invalidate();
      await data.utils.post.getTrashedPosts.invalidate();
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

  const restorePost = rpc.post.restoreFromTrash.useMutation({
    onSuccess: async (_, variables) => {
      toast.success("Post restored successfully");
      store.editor.restorePostFromTrash(variables.trashId);
      await data.utils.post.getTrashedPosts.invalidate();
      await data.utils.post.getAllAdminPosts.invalidate();
    },
    onError: (error) => {
      logger.error("Failed to restore post", { error });
      toast.error("Failed to restore post", { description: error.message });
    },
  });

  const purgePost = rpc.post.purgeTrashPost.useMutation({
    onSuccess: async (_, variables) => {
      toast.success("Post permanently deleted");
      store.editor.purgePostFromTrash(variables.trashId);
      await data.utils.post.getTrashedPosts.invalidate();
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
    url.searchParams.delete("continuum");
    window.history.replaceState({}, "", url.toString());
  }, [form, ui]);

  const startNewBlog = useCallback(() => {
    _resetToNewBlog();
  }, [_resetToNewBlog]);

  const editBlog = useCallback(
    (continuum: PostArticleRo) => {
      if (ui.isTrashingBlog) return;
      ui.setSelectedBlog(continuum);
      ui.openEditModal(continuum);
      form.loadFromBlog(continuum);
      logger.info("Editing continuum", { slug: continuum.slug });
    },
    [form, ui],
  );

  const deleteBlog = useCallback(
    (continuum: PostArticleRo) => {
      ui.openDeleteModal(continuum);
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
