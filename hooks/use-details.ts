import { useQuery } from "@tanstack/react-query";
import { DetailsApi } from "@/api";
import { apiConfig } from "@/lib/api-config";

const detailsApi = new DetailsApi(apiConfig);

const detailsQueryOptions = {
  queryKey: ["details"],
  queryFn: async () => {
    const response = await detailsApi.detailsIndex();
    return response.data;
  },
};

export const useDetails = () => {
  return useQuery(detailsQueryOptions);
};

export const useCategories = () => {
  return useQuery({
    ...detailsQueryOptions,
    select: (data) => data.categories,
  });
};

export const useFeatures = () => {
  return useQuery({
    ...detailsQueryOptions,
    select: (data) => data.features,
  });
};

export const usePropertyTypes = () => {
  return useQuery({
    ...detailsQueryOptions,
    select: (data) => data.types,
  });
};

export const useRentDurations = () => {
  return useQuery({
    ...detailsQueryOptions,
    select: (data) => data.rentDurations,
  });
};

export const useNearPlaces = () => {
  return useQuery({
    ...detailsQueryOptions,
    select: (data) => data.nearPlaces,
  });
};

export const useWilayas = () => {
  return useQuery({
    queryKey: ["wilayas"],
    queryFn: async () => {
      const response = await detailsApi.detailsWilayas();
      return response.data;
    },
  });
};

export const useCities = (wilayaId?: number) => {
  return useQuery({
    queryKey: ["cities", wilayaId],
    queryFn: async () => {
      if (!wilayaId) throw new Error("Wilaya ID is required");
      const response = await detailsApi.detailsCities({ wilayaId });
      return response.data;
    },
    enabled: !!wilayaId,
  });
};
