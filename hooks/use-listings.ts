import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ListingApi,
  ListingResource,
  ListingResourceFromJSON,
  ListingsIndexRequest,
  MemberResource,
  MemberResourceFromJSON,
  Report200Response,
  ReportRequest,
} from "@/api";
import { apiConfig } from "@/lib/api-config";
import { useAuth } from "../components/providers/auth";
import { useMemo } from "react";
import { useParams } from "next/navigation";

const listingApi = new ListingApi(apiConfig);

export function useListings(params?: ListingsIndexRequest) {
  console.log({ listingsParams: params });
  const stableParams = useMemo(
    () => params,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)],
  );
  return useQuery({
    queryKey: ["listings", stableParams],
    // staleTime: 1000 * 60 * 5,      // ✅ 5 minutes (was 10000 * 60 * 5 = ~50min typo)
    refetchInterval: false, // ✅ remove — was causing repeated background fetches
    enabled: true, // ✅ was false, so query never ran intentionally
    queryFn: async () => {
      const response = await listingApi.index(params);
      return response;
    },
  });
}

export function useReportListing() {
  const { token } = useAuth();

  return useMutation<Report200Response, unknown, ReportRequest>({
    mutationFn: async (data) => {
      if (!token) {
        throw new Error("Not authenticated");
      }

      return await listingApi.report(data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
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

export interface ReviewResource {
  id: number;
  member_id: number;
  username: string;
  profile_image: string;
  is_verified: false;
  rating: number;
  review: string;
  date: string; // like 2026-05-04 09:48
}

export interface DTOResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ListingResourceDetails extends Omit<ListingResource, "members"> {
  reviews: ReviewResource [];
  member?: MemberResource
}

const ListingResourceDetailsFromJSON = (json: any) => {
  if (json == null) {
    return json;
  }
  const listing = ListingResourceFromJSON(json)
  return {
    ...listing,
    reviews: json?.reviews,
    member: MemberResourceFromJSON(json?.member),
  }
}

export function useListing(id: number) {
  const { locale } = useParams();
  return useQuery<
    DTOResponse<
      ListingResource & { member?: MemberResource; reviews: ReviewResource[] }
    >
  >({
    queryKey: ["listing", id],
    queryFn: async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept-Language": locale as string,
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
      let data : ListingResourceDetails = ListingResourceDetailsFromJSON(json?.data)
      return {...json, data} as DTOResponse<
        ListingResourceDetails
      >
;
    },
    enabled: !!id,
  });
}
