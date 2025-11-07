"use client";

import type { ReactNode } from "react";
import type { Optional } from "typyx";
import { createContext, useMemo } from "react";

import { RootStore } from "./root-store";

export const StoreContext = createContext<Optional<RootStore>>(null);

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  // Create store instance on client side
  const store = useMemo(() => new RootStore(), []);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}
