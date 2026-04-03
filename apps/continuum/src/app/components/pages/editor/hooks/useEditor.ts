"use client";

import { useEditorData } from "./useEditorData";
import { useEditorFormState } from "./useEditorFormState";
import { useEditorUIState } from "./useEditorUIState";
import { useEditorActions } from "./useEditorActions";
import { useEditorDataProcessing } from "./useEditorDataProcessing";

export function useEditor() {
  const data = useEditorData();
  const form = useEditorFormState();
  const ui = useEditorUIState();
  const actions = useEditorActions({ data, form, ui });
  const processing = useEditorDataProcessing({ data, ui, actions });

  return {
    data: {
      posts: processing.filteredAndSortedPosts,
      trashedPosts: data.trashedPosts,
      viewMode: data.viewMode,
      isLoadingPosts: data.isLoadingPosts,
      isLoadingTrashed: data.isLoadingTrashed,
      postsError: data.postsError,
      showEditorSkeleton: processing.showEditorSkeleton,
    },
    form: {
      formInstance: form.form,
      onSubmit: actions.submitForm,
      isSubmitting: actions.isSubmitting,
    },
    preview: {
      isEnabled: ui.isPreviewMode,
      toggle: ui.togglePreview,
      title: processing.previewTitle,
      date: processing.previewDate,
    },
    modals: {
      edit: ui.editModal,
      delete: ui.deleteModal,
    },
    sorting: {
      options: ui.sortOptions,
      setOptions: ui.setSortOptions,
    },
    actions: {
      startNewBlog: actions.startNewBlog,
      editBlog: actions.editBlog,
      deleteBlog: actions.deleteBlog,
      confirmDelete: actions.confirmDelete,
      cancelDelete: actions.cancelDelete,
      restoreBlog: actions.restoreBlog,
      purgeBlog: actions.purgeBlog,
      isDeletingPost: actions.isDeletingPost,
    },
  };
}

export type UseEditorReturn = ReturnType<typeof useEditor>;
