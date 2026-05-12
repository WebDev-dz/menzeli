"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/api-config";
import { useAuth } from "@/components/providers/auth";

export type CoinPaymentMethod = "chargily";
export type CoinPurchaseStatus = "pending" | "paid" | "completed" | "failed";

export type CoinPackage = {
  id: string;
  coins: string;
  price: string;
  date_end_offer: string | null;
};

type PackagesResponse = {
  success: boolean;
  message: string | null;
  data: CoinPackage[];
};

type BuyCoinPackageResponse = {
  success: boolean;
  message?: string;
  data?: {
    purchase_id: number;
    checkout_url: string;
    amount: number;
    coins: number;
  };
};

type CoinPurchaseStatusResponse = {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    status: CoinPurchaseStatus;
    coins: number;
    payment_method: string;
  };
};

export type BuyCoinPackageResult = {
  purchaseId: number;
  checkoutUrl: string;
  amount: number;
  coins: number;
};

export const coinPaymentStorageKeys = {
  latestPurchaseId: "coin_purchase_latest_id",
} as const;

async function parseApiError(response: Response): Promise<string> {
  try {
    const json = await response.json();
    if (typeof json?.message === "string" && json.message.length > 0) {
      return json.message;
    }
    if (typeof json?.error === "string" && json.error.length > 0) {
      return json.error;
    }
  } catch {
    // Ignore JSON parsing errors and fall back to generic message.
  }
  return `Request failed (${response.status})`;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export function getStoredCoinPurchaseId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(coinPaymentStorageKeys.latestPurchaseId);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function clearStoredCoinPurchaseId() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(coinPaymentStorageKeys.latestPurchaseId);
}

export function useBuyCoinPackage() {
  const { token } = useAuth();

  return useMutation<
    BuyCoinPackageResult,
    Error,
    {
      packageId: number;
      paymentMethod?: CoinPaymentMethod;
      redirectToCheckout?: boolean;
    }
  >({
    mutationFn: async ({
      packageId,
      paymentMethod = "chargily",
      redirectToCheckout = true,
    }) => {
      if (!token) throw new Error("Not authenticated");
      if (!packageId || packageId <= 0) throw new Error("Invalid package id");

      const response = await fetch(
        `${API_URL}/api/members/coin-packages/${packageId}/buy`,
        {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify({ payment_method: paymentMethod }),
        },
      );

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const json = (await response.json()) as BuyCoinPackageResponse;
      const payload = json?.data;

      if (!payload?.checkout_url || !payload?.purchase_id) {
        throw new Error("Invalid payment response");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(
          coinPaymentStorageKeys.latestPurchaseId,
          String(payload.purchase_id),
        );
        if (redirectToCheckout) {
          window.location.assign(payload.checkout_url);
        }
      }

      return {
        purchaseId: payload.purchase_id,
        checkoutUrl: payload.checkout_url,
        amount: payload.amount,
        coins: payload.coins,
      };
    },
  });
}

export function useCoinPurchaseStatus(
  purchaseId?: number | null,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  },
) {
  const { token, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["coin-purchase-status", purchaseId, token],
    enabled:
      Boolean(purchaseId) &&
      Boolean(token) &&
      isAuthenticated &&
      (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
    queryFn: async () => {
      if (!token) throw new Error("Not authenticated");
      if (!purchaseId) throw new Error("Missing purchase id");

      const response = await fetch(
        `${API_URL}/api/members/coin-purchases/${purchaseId}/status`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const json = (await response.json()) as CoinPurchaseStatusResponse;
      if (!json?.data) {
        throw new Error("Invalid status response");
      }
      return json.data;
    },
  });
}

export function usePackages() {
  return useQuery({
    queryKey: ["coin-packages"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/members/coin-packages`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const json = (await response.json()) as PackagesResponse;
      return json.data || [];
    },
  });
}

