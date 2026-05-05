"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useWalletData } from "@/hooks/use-wallet";

type WalletContextType = ReturnType<typeof useWalletData>;

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
  type?: string;
}

export function WalletProvider({ children, type }: WalletProviderProps) {
  const walletData = useWalletData(type);

  return (
    <WalletContext.Provider value={walletData}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
}
