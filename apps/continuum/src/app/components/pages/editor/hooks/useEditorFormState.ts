"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { PostArticleRo, PostEditorDto } from "@rccyx/api/rpc-models";
import { PostCategoryEnum, postEditorSchemaDto } from "@rccyx/api/rpc-models";

const DEFAULT_VALUES: PostEditorDto = {
  title: "",
  summary: "",
  category: PostCategoryEnum.SOFTWARE,
  tags: [],
  isReleased: false,
  mdxText: "",
};

export function useEditorFormState() {
  const form = useForm<PostEditorDto>({
    resolver: zodResolver(postEditorSchemaDto),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  const resetToEmpty = () => {
    form.reset(DEFAULT_VALUES);
  };

  const loadFromBlog = (continuum: PostArticleRo) => {
    form.reset({
      title: continuum.title,
      summary: continuum.summary,
      category: continuum.category,
      tags: continuum.tags,
      isReleased: continuum.isReleased,
      mdxText: continuum.fontMatterMdxContent.body,
    });
  };

  return {
    form,
    resetToEmpty,
    loadFromBlog,
  };
}
