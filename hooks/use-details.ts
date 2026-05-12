import { useQuery } from "@tanstack/react-query";
import { DetailsApi } from "@/api";
import { apiConfig } from "@/lib/api-config";

const detailsApi = new DetailsApi(apiConfig);

const getDetailsQueryOptions = ({locale = "en"} : { locale : string}) => ({
  queryKey: ["details"],
  queryFn: async () => {
    const response = await detailsApi.detailsIndex({
      headers : {
        "Accept-Language" : locale
      }
    });
    return response.data;
  },
});

export const useDetails = ({ locale = "en" } : { locale : string}) => {
  return useQuery(getDetailsQueryOptions({ locale }));
};

export const useCategories = ({ locale = "en" } : { locale : string}) => {
  return useQuery({
    ...getDetailsQueryOptions({ locale }),
    select: (data) => data.categories,
  });
};

export const useFeatures = ({ locale = "en" } : { locale : string}) => {
  return useQuery({
    ...getDetailsQueryOptions({ locale }),
    select: (data) => data.features,
  });
};

export const usePropertyTypes = ({ locale = "en" } : { locale : string}) => {
  return useQuery({
    ...getDetailsQueryOptions({ locale }),
    select: (data) => data.types,
  });
};

export const useRentDurations = ({ locale = "en", type = 0 } : { locale : string, type : number}) => {
  return useQuery({
    ...getDetailsQueryOptions({ locale }),
    select: (data) => data.rentDurations,
    enabled: type !== 0,
  });
};

export const useNearPlaces = ({ locale = "en" } : { locale : string}) => {
  return useQuery({
    ...getDetailsQueryOptions({ locale }),
    select: (data) => data.nearPlaces,
  });
};

export const useWilayas = ({ locale = "en" } : { locale : "ar" | "fr" | "en"}) => {
  return useQuery({
    queryKey: ["wilayas"],
    queryFn: async () => {
      const response = await detailsApi.detailsWilayas({
        headers : {
          "Accept-Language" : locale
        }
      });
      return response.data;
    },
  });
};

export const useCities = (wilayaId?: number, locale = "en") => {
  return useQuery({
    queryKey: ["cities", wilayaId],
    queryFn: async () => {
      if (!wilayaId) throw new Error("Wilaya ID is required");
      const response = await detailsApi.detailsCities({ wilayaId }, {
        headers: {
          "Accept-Language" : locale
        }
      });
      return response.data;
    },
    enabled: !!wilayaId,
  });
};
