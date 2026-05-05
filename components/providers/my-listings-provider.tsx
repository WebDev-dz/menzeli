"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useMemberListings } from "@/hooks/use-member-listings";
import { Index200Response } from "@/api";

interface MyListingsContextType {
  data: Index200Response | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

const MyListingsContext = createContext<MyListingsContextType | undefined>(
  undefined
);

export function MyListingsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError, error, refetch } = useMemberListings();

  return (
    <MyListingsContext.Provider
      value={{
        data,
        isLoading,
        isError,
        error: error as Error | null,
        refetch,
      }}
    >
      {children}
    </MyListingsContext.Provider>
  );
}

export function useMyListingsContext() {
  const context = useContext(MyListingsContext);
  if (context === undefined) {
    throw new Error(
      "useMyListingsContext must be used within a MyListingsProvider"
    );
  }
  return context;
}
