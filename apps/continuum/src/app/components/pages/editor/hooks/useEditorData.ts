"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { useStore } from "~/app/stores";
import { rpcClient } from "@rccyx/api/rpc-client";
import type { PostArticleRo } from "@rccyx/api/rpc-models";
import { UserRoleEnum } from "@rccyx/api/rpc-models";
import { useAuth } from "~/app/hooks/auth";

export function useEditorData() {
  const { store } = useStore();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const blogSlug = searchParams.get("continuum");

  const isLoggedIn = !!user;
  const isAdmin = user?.role === UserRoleEnum.ADMIN;

  // Only fetch these admin endpoints if logged in and admin, and tab is active
  const shouldFetchActive =
    isLoggedIn && isAdmin && store.editor.viewMode === "active";
  const shouldFetchTrash =
    isLoggedIn && isAdmin && store.editor.viewMode === "trash";

  const activePosts = rpcClient.post.getAllAdminPosts.useQuery(undefined, {
    enabled: shouldFetchActive,
    retry: false, // do not waste time retrying 401 or 403
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const trashedPosts = rpcClient.post.getTrashedPosts.useQuery(undefined, {
    enabled: shouldFetchTrash,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  // Public read, only useful in the editor when logged in and trying to jump to a slug
  const specificPost = rpcClient.post.getDetailedPublicPost.useQuery(
    { slug: blogSlug ?? "" },
    {
      enabled:
        isLoggedIn &&
        !!blogSlug &&
        activePosts.isSuccess &&
        !_findBlogInPosts(activePosts.data, blogSlug),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      staleTime: 60_000,
      gcTime: 5 * 60_000,
    },
  );

  // Keep MobX store in sync with query results
  useEffect(() => {
    if (activePosts.data) store.editor.setActivePosts(activePosts.data);
  }, [activePosts.data, store.editor]);

  useEffect(() => {
    if (trashedPosts.data) store.editor.setTrashedPosts(trashedPosts.data);
  }, [trashedPosts.data, store.editor]);

  // When logged out or not admin, clear lists to avoid stale items and kill spinners
  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      store.editor.setActivePosts([]);
      store.editor.setTrashedPosts([]);
    }
  }, [isLoggedIn, isAdmin, store.editor]);

  const blogFromUrl = blogSlug
    ? (_findBlogInPosts(activePosts.data, blogSlug) ?? specificPost.data)
    : null;

  const postsErrorMessage = !isLoggedIn
    ? "You must be logged in to view posts."
    : activePosts.error?.message;

  return {
    posts: store.editor.activePosts,
    trashedPosts: store.editor.trashedPosts,
    viewMode: store.editor.viewMode,
    blogFromUrl,
    blogSlug,
    isLoadingPosts: activePosts.isLoading,
    isLoadingTrashed: trashedPosts.isLoading,
    isLoadingSpecificPost: specificPost.isLoading && !!blogSlug,
    postsError: postsErrorMessage,
    utils: rpcClient.useUtils(),
  };
}

function _findBlogInPosts(
  posts: PostArticleRo[] | undefined,
  slug: string,
): PostArticleRo | undefined {
  return posts?.find((post) => post.slug === slug);
}
