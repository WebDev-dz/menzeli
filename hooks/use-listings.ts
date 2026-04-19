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

const listingApi = new ListingApi(apiConfig);

export function useListings(params?: ListingsIndexRequest) {
  return useQuery({
    queryKey: ["listings", params],
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
