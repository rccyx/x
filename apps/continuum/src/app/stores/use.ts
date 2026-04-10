"use client";

import { useContext } from "react";
import { StoreContext } from "./store-context";
import type { RootStore } from "./root-store";

export function useStore(): { store: RootStore } {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return { store };
}
