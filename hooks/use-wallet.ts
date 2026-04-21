"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  WalletAddCoins200Response,
  WalletAddCoinsRequest,
  WalletApi,
  WalletShow200Response,
  WalletTransactions200Response,
} from "@/api";
import { apiConfig } from "@/lib/api-config";
import { useAuth } from "@/components/providers/auth";

const walletApi = new WalletApi(apiConfig);

export const walletQueryKeys = {
  all: ["wallet"] as const,
  balance: (token: string | null) => ["wallet", "balance", token] as const,
  transactions: (token: string | null, type?: string) =>
    ["wallet", "transactions", token, type ?? "all"] as const,
};

export function useWallet() {
  const { token, isAuthenticated } = useAuth();

  return useQuery<WalletShow200Response>({
    queryKey: walletQueryKeys.balance(token),
    enabled: !!token && isAuthenticated,
    queryFn: async () => {
      return await walletApi.walletShow();
    },
  });
}

export function useWalletTransactions(type?: string) {
  const { token, isAuthenticated } = useAuth();

  return useQuery<WalletTransactions200Response>({
    queryKey: walletQueryKeys.transactions(token, type),
    enabled: !!token && isAuthenticated,
    queryFn: async () => {
      return await walletApi.walletTransactions({ type });
    },
  });
}

export function useAddWalletCoins() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation<
    WalletAddCoins200Response,
    unknown,
    WalletAddCoinsRequest
  >({
    mutationFn: async (data) => {
      if (!token) throw new Error("Not authenticated");
      return await walletApi.walletAddCoins({ walletAddCoinsRequest: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletQueryKeys.all });
    },
  });
}

export function useWalletData(type?: string) {
  const wallet = useWallet();
  const transactions = useWalletTransactions(type);
  const addCoins = useAddWalletCoins();

  return {
    wallet,
    transactions,
    addCoins,
  };
}
