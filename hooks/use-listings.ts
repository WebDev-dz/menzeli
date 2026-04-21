import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ListingApi,
  ListingResource,
  ListingResourceFromJSON,
  ListingsStoreRequest,
  ListingsUpdateRequest,
  ListingsIndexRequest,
 
} from "@/api";
import { apiConfig } from "@/lib/api-config";
import { useAuth } from '../components/providers/auth';
import { useMemo } from "react";

const listingApi = new ListingApi(apiConfig);

export function useListings(params?: ListingsIndexRequest) {
  console.log({ params })
  const stableParams = useMemo(
    () => params,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  );
  return useQuery({
    queryKey: ["listings", stableParams],
    staleTime: 1000 * 60 * 5,      // ✅ 5 minutes (was 10000 * 60 * 5 = ~50min typo)
    refetchInterval: false,         // ✅ remove — was causing repeated background fetches
    enabled: true,                  // ✅ was false, so query never ran intentionally
    queryFn: async () => {
     
      const response = await listingApi.index(params);
      return response;
    },
  });
}



// export function useUpdateListing() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({  data }: { data: ListingsUpdateRequest }) =>
//       listingApi.listingUpdate(data),
//     onSuccess: (data, variables) => {
//       queryClient.invalidateQueries({ queryKey: ["listings"] });
//       queryClient.invalidateQueries({ queryKey: ["listing", variables.data] });
//     },
//   });
// }

// export function useDeleteListing() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (id: number) => listingApi.listingsDestroy({ listing: id }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["listings"] });
//     },
//   });
// }

export function useListing(id: number) {
  return useQuery<ListingResource>({
    queryKey: ["listing", id],
    queryFn: async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiConfig.basePath}/listings/${id}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch listing");
      }
      const json = await response.json();
      return ListingResourceFromJSON(json.data || json);
    },
    enabled: !!id,
  });
}
