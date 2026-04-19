import initTranslations from "@/app/i18n";
import TranslationsProvider from "@/components/providers/TranslationsProvider";
import Header from "@/components/shared/header";
import RealEstateFilterPage from "@/components/properties/property-listing";
import { ListingsIndexRequest } from "@/api";
import z from "zod";

export const listingsIndexRequestSchema = z.object({
  perPage: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
  typeId: z.coerce.number().optional(),
  categoryId: z.coerce.number().optional(),
  wilayaId: z.coerce.number().optional(),
  cityId: z.coerce.number().optional(),
  rentDurationId: z.coerce.number().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minSurface: z.coerce.number().optional(),
  maxSurface: z.coerce.number().optional(),
  numberRooms: z.coerce.number().optional(),
  numberPersons: z.coerce.number().optional(),
  isReady: z.boolean().optional(),
  isNegotiable: z.boolean().optional(),
  search: z.string().optional().nullable(),
  sortBy: z.enum(["price", "created_at", "surface"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export default async function ListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: ListingsIndexRequest;
}) {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, [
    "common",
    "listings",
    "filters",
  ]);
  

  const parsedSearchParams = listingsIndexRequestSchema.safeParse(await searchParams);

  console.log({ parsedSearchParams });
  
  return <RealEstateFilterPage {...parsedSearchParams.data ?? {}} />;
}
