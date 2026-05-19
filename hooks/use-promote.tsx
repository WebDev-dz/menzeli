import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth";
import { apiConfig } from "@/lib/api-config";
import { walletQueryKeys } from "./use-wallet";

export interface PromoteListingRequest {
  listingId: number;
  coins: number;
}

export interface BoostResponseData {
  id: number;
  listing_id: number;
  member_id: number;
  coins_spent: number;
  status: string;
  started_at: string;
  expires_at: string;
  expired_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PromoteListingResponse {
  success: boolean;
  message: string | null;
  boost: BoostResponseData;
  listing_final_score: string;
}

export function usePromote() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation<PromoteListingResponse, Error, PromoteListingRequest>({
    mutationFn: async ({ listingId, coins }) => {
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${apiConfig.basePath}/members/listings/${listingId}/boost`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ coins }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to promote listing");
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: walletQueryKeys.all });
    },
  });
}
