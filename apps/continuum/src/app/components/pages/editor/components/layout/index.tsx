"use client";

import { AnimatePresence } from "@rccyx/design/motion";
import { Skeleton } from "@rccyx/design/ui";

import { Header } from "../header";
import { BlogList } from "../list";
import { TrashList } from "../lists/ItemList";
import { ConfirmBlogDeleteModal } from "../list";
import { PostEditorForm } from "../form";
import { BlogPreview } from "../preview";

import type { UseEditorReturn } from "../../hooks/useEditor";

interface EditorLayoutProps {
  editor: UseEditorReturn;
}

export function EditorLayout({ editor }: EditorLayoutProps) {
  const showActiveView: boolean = editor.data.viewMode === "active";
  const showDeleteModalOverlay: boolean = editor.modals.delete.visible;

  return (
    <div className="layout mx-auto p-8">
      <Header
        onClick={editor.actions.startNewBlog}
        sortOptions={editor.sorting.options}
        onSortOptionsChange={editor.sorting.setOptions}
        blogs={editor.data.posts}
        isPreviewEnabled={editor.preview.isEnabled}
        onTogglePreview={editor.preview.toggle}
      />

      {showActiveView ? (
        <div
          className={`grid grid-cols-1 gap-8 lg:grid-cols-3 ${showDeleteModalOverlay ? "pointer-events-none" : ""}`}
        >
          <BlogList
            blogs={editor.data.posts}
            onEdit={editor.actions.editBlog}
            onDelete={editor.actions.deleteBlog}
            isLoading={
              editor.data.isLoadingPosts || editor.data.showEditorSkeleton
            }
            errorMessage={editor.data.postsError}
          />

          {editor.data.showEditorSkeleton ? (
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg border p-4">
                <Skeleton className="w-full" />
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait" initial={false}>
                <PostEditorForm
                  key="editor"
                  form={editor.form.formInstance}
                  onSubmit={editor.form.onSubmit}
                  isSubmitting={editor.form.isSubmitting}
                  isHidden={editor.preview.isEnabled}
                />
                {editor.preview.isEnabled ? (
                  <BlogPreview
                    key="preview"
                    isVisible={editor.preview.isEnabled}
                    form={editor.form.formInstance}
                    title={editor.preview.title}
                    creationDate={editor.preview.date}
                  />
                ) : null}
              </AnimatePresence>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <TrashList
            items={editor.data.trashedPosts}
            onRestore={editor.actions.restoreBlog}
            onPurge={editor.actions.purgeBlog}
            isLoading={editor.data.isLoadingTrashed}
          />
          <div className="lg:col-span-2">
            <div className="text-muted-foreground flex h-full items-center justify-center rounded-lg border p-4">
              Select an item to restore or purge.
            </div>
          </div>
        </div>
      )}

      {editor.modals.delete.visible ? (
        <ConfirmBlogDeleteModal
          continuum={editor.modals.delete.entity}
          onConfirm={editor.actions.confirmDelete}
          onCancel={editor.actions.cancelDelete}
          isDeleting={editor.actions.isDeletingPost}
        />
      ) : null}
    </div>
  );
}
