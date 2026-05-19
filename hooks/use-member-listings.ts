"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Index200Response,
  ListingsDestroyRequest,
  ListingsIndexRequest,
  ListingsShowRequest,
  ListingsStoreRequest,
  MemberListingsApi,
  PasswordResetRequestResetOtp403Response,
  Show200Response,
} from "@/api";
import { API_URL, apiConfig } from "@/lib/api-config";
import { useAuth } from "@/components/providers/auth";

const memberListingsApi = new MemberListingsApi(apiConfig);

function authInit(token: string | null): RequestInit {
  if (!token) return {};
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

function appendIfPresent(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null || value === "") return;
  formData.append(key, String(value));
}

function buildListingFormData(data: ListingsStoreRequest) {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("price", String(data.price));
  formData.append("surface", String(data.surface));
  formData.append("rent_duration_id", String(data.rentDurationId));
  formData.append("type_id", String(data.typeId));
  formData.append("main_image", data.mainImage);

  appendIfPresent(formData, "description", data.description);
  appendIfPresent(formData, "floor", data.floor);
  const boost_level = data.boostLevel && Number(data.boostLevel) >= 1 ? data.boostLevel : 1
  appendIfPresent(formData, "boost_level", boost_level);
  appendIfPresent(formData, "min_duration", data.minDuration);
  appendIfPresent(formData, "number_rooms", data.numberRooms);
  appendIfPresent(formData, "number_persons", data.numberPersons);

  formData.append("is_ready", data.isReady ? "1" : "0");
  formData.append("is_negotiable", data.isNegotiable ? "1" : "0");

  formData.append("location[latitude]", String(data.location.latitude));
  formData.append("location[longitude]", String(data.location.longitude));
  formData.append("location[city_id]", String(data.location.cityId));
  appendIfPresent(formData, "location[zip_code]", 1000);
  appendIfPresent(formData, "location[altitude]", data.location.altitude);

  data.categories?.forEach((id) => {
    formData.append("categories[]", String(id));
  });
  data.features?.forEach((id) => {
    formData.append("features[]", String(id));
  });
  data.nearPlaces?.forEach((id) => {
    formData.append("near_places[]", String(id));
  });
  data.images?.forEach((file) => {
    formData.append("images[]", file);
  });
  return formData;
}

export function useMemberListings(params: ListingsIndexRequest = {}) {
  const { token, isAuthenticated } = useAuth();

  return useQuery<Index200Response>({
    queryKey: ["member-listings", params, token],
    enabled: !!token && isAuthenticated,
    queryFn: async () => {
      return await memberListingsApi.listingsIndex(params, authInit(token));
    },
  });
}

export function useMemberListing(listingId: number) {
  const { token, isAuthenticated } = useAuth();

  return useQuery<Show200Response>({
    queryKey: ["member-listing", listingId, token],
    enabled: !!token && isAuthenticated && !!listingId,
    queryFn: async () => {
      const request: ListingsShowRequest = { listing: listingId };
      return await memberListingsApi.listingsShow(request, authInit(token));
    },
  });
}

export function useCreateMemberListing() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation<Show200Response, unknown, ListingsStoreRequest>({
    mutationFn: async (data) => {
      if (!token) throw new Error("Not authenticated");
      const url = `${API_URL}/api/members/listings`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Accept-Language": "en",
          Origin: API_URL,
        },
        redirect: "manual", // Don't follow — expose the 302
        body: buildListingFormData(data),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          json?.message || `Failed to create listing (${response.status})`,
        );
      }

      return json as Show200Response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-listings"] });
    },
  });
}

export function useUpdateMemberListing() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation<
    Show200Response,
    unknown,
    { listing: number; updateRequest: ListingsStoreRequest }
  >({
    mutationFn: async ({ listing, updateRequest }) => {
      if (!token) throw new Error("Not authenticated");

      const url = `${API_URL}/api/members/listings/${listing}`;
      const formData = buildListingFormData(updateRequest);
      formData.append("_method", "PUT");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Accept-Language": "en",
          Origin: API_URL,
        },
        redirect: "manual",
        body: formData,
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          json?.message || `Failed to update listing (${response.status})`,
        );
      }

      return json as Show200Response;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["member-listings"] });
      queryClient.invalidateQueries({
        queryKey: ["member-listing", variables.listing],
      });
    },
  });
}

export function useDeleteMemberListing() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation<
    PasswordResetRequestResetOtp403Response,
    unknown,
    ListingsDestroyRequest
  >({
    mutationFn: async (data) => {
      if (!token) throw new Error("Not authenticated");
      return await memberListingsApi.listingsDestroy(data, authInit(token));
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["member-listings"] });
      queryClient.removeQueries({
        queryKey: ["member-listing", variables.listing],
      });
    },
  });
}
