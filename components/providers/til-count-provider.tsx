"use client";

import { createContext, useContext, ReactNode } from "react";

const TilCountContext = createContext<number>(0);

export function TilCountProvider({
  children,
  count,
}: {
  children: ReactNode;
  count: number;
}) {
  return (
    <TilCountContext.Provider value={count}>
      {children}
    </TilCountContext.Provider>
  );
}

export function useTilCount() {
  return useContext(TilCountContext);
}
