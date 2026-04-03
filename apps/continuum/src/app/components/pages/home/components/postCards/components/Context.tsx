"use client";

import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import type { Optional } from "typyx";
import { createContext, useContext, useState } from "react";

interface PostsContextType {
  visibleNum: number;
  setVisibleNum: Dispatch<SetStateAction<number>>;
  scrollPosition: number;
  setScrollPosition: Dispatch<SetStateAction<number>>;
}

const PostsContext = createContext<Optional<PostsContextType>>(null);

export function PostsProvider({ children }: PropsWithChildren) {
  const [visibleNum, setVisibleNum] = useState<number>(10); // firstLoadVisibleNum
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  return (
    <PostsContext.Provider
      value={{
        visibleNum,
        setVisibleNum,
        scrollPosition,
        setScrollPosition,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePostsContext() {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePostsContext must be used within a PostsProvider");
  }
  return context;
}
