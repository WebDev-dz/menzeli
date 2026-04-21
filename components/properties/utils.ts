import z from "zod";
import { PropertyFiltersValues } from "./property-filters";

export const extractFiltersFromSearchParams = (
  searchParams: URLSearchParams,
) => {
  return {
    perPage: Number(searchParams.get("perPage")) || 10,
    page: Number(searchParams.get("page")) || 1,
    typeId: searchParams.get("typeId")
      ? Number(searchParams.get("typeId"))
      : undefined,
    categoryId: searchParams.get("categoryId")
      ? Number(searchParams.get("categoryId"))
      : undefined,
    wilayaId: searchParams.get("wilayaId")
      ? Number(searchParams.get("wilayaId"))
      : undefined,
    cityId: searchParams.get("cityId")
      ? Number(searchParams.get("cityId"))
      : undefined,
    rentDurationId: searchParams.get("rentDurationId")
      ? Number(searchParams.get("rentDurationId"))
      : undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    minSurface: searchParams.get("minSurface")
      ? Number(searchParams.get("minSurface"))
      : undefined,
    maxSurface: searchParams.get("maxSurface")
      ? Number(searchParams.get("maxSurface"))
      : undefined,
    numberRooms: searchParams.get("numberRooms")
      ? Number(searchParams.get("numberRooms"))
      : undefined,
    numberPersons: searchParams.get("numberPersons")
      ? Number(searchParams.get("numberPersons"))
      : undefined,
    isReady: searchParams.get("isReady") === "true",
    isNegotiable: searchParams.get("isNegotiable") === "true",
    search: searchParams.get("search") || "",
    sortBy: (searchParams.get("sortBy") as any) || "price",
    sortDir: (searchParams.get("sortDir") as any) || "asc",
  };
};

export const appendFiltersToSearchParams = (
  filters: PropertyFiltersValues,
  searchParams: URLSearchParams,
) => {
  const appendIfDefined = (key: string, value: any) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  };

  appendIfDefined("perPage", filters.perPage);
  appendIfDefined("page", 1); // Reset to page 1 on filter change
  appendIfDefined("typeId", filters.typeId);
  appendIfDefined("categoryId", filters.categoryId);
  appendIfDefined("wilayaId", filters.wilayaId);
  appendIfDefined("cityId", filters.cityId);
  appendIfDefined("rentDurationId", filters.rentDurationId);
  appendIfDefined("minPrice", filters.minPrice);
  if (filters?.maxPrice && filters?.maxPrice > 0) {
    appendIfDefined("maxPrice", filters.maxPrice);
  }
  appendIfDefined("minSurface", filters.minSurface);
  if (filters?.maxSurface && filters?.maxSurface > 0) {
    appendIfDefined("maxSurface", filters.maxSurface);
  }
  if (filters?.numberRooms && filters?.numberRooms > 0) {
    appendIfDefined("numberRooms", filters.numberRooms);
  }
  if (filters?.numberPersons && filters?.numberPersons > 0) {
    appendIfDefined("numberPersons", filters.numberPersons);
  }
  if (filters.isReady) searchParams.append("isReady", "true");
  if (filters.isNegotiable) searchParams.append("isNegotiable", "true");
  appendIfDefined("search", filters.search);
  appendIfDefined("sortBy", filters.sortBy);
  appendIfDefined("sortDir", filters.sortDir);
};

export const listingsIndexRequestSchema = z.object({
  perPage: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
  typeId: z.coerce.number().optional(),
  categoryId: z.coerce.number().optional(),
  wilayaId: z.coerce.number().optional(),
  cityId: z.coerce.number().optional(),
  rentDurationId: z.coerce.number().optional(),
  minPrice: z.coerce.number().optional(),
  minSurface: z.coerce.number().optional(),
  maxPrice: z.coerce
    .number()
    .optional()
    .transform((val) => (val == 0 ? undefined : val)),
  maxSurface: z.coerce
    .number()
    .optional()
    .transform((val) => (val == 0 ? undefined : val)),
  numberRooms: z.coerce
    .number()
    .optional()
    .transform((val) => (val == 0 ? undefined : val)),
  numberPersons: z.coerce
    .number()
    .optional()
    .transform((val) => (val == 0 ? undefined : val)),

  isReady: z.coerce.boolean().optional(),
  isNegotiable: z.coerce.boolean().optional(),
  search: z.string().optional().nullable(),
  sortBy: z.enum(["price", "created_at", "surface"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});
