"use client";

/**
 * RealEstateFilterPage.tsx  (updated)
 *
 * Changes from original:
 * 1. Added viewMode state ("list" | "map")
 * 2. Bounding box params pushed to URL when map moves
 * 3. MapSearchView replaces the raw property list
 * 4. listingsIndexRequestSchema should include: swLat, swLng, neLat, neLng
 */

import { Suspense, useCallback } from "react";
import { useListings } from "@/hooks/use-listings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import PropertyFilters, { PropertyFiltersValues } from "./property-filters";
import {
  extractFiltersFromSearchParams,
  appendFiltersToSearchParams,
  listingsIndexRequestSchema,
} from "./utils";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import MainFilters from "./main-filter";
import Pagination from "../shared/pagination";
import PropertyRowCard from "./property-row-card";
import MapSearchView, { BoundsFilter } from "../map-search";
import PropertyCard from "./property-card";
import ListingWidget from "../shared/listing-widget";

function RealEstateFilterPageContent(props: any) {
  useTranslation("filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams<{ locale: string }>();
  const locale = (
    Array.isArray(params?.locale) ? params.locale[0] : params?.locale || "en"
  ) as "ar" | "en" | "fr";

  console.log({ listingsProps: props });
  const parsedParams = listingsIndexRequestSchema.parse({
    ...props,
    page: props.page ? Number(props.page) : 1,
    perPage: props.perPage || 8,
    // Pass bounding box from URL if present
    swLat: props.swLat ? Number(props.swLat) : undefined,
    swLng: props.swLng ? Number(props.swLng) : undefined,
    neLat: props.neLat ? Number(props.neLat) : undefined,
    neLng: props.neLng ? Number(props.neLng) : undefined,
  });

  const { data, isLoading } = useListings(parsedParams);

  const form = useForm<PropertyFiltersValues, any, PropertyFiltersValues>({
    // @ts-ignore
    resolver: zodResolver(listingsIndexRequestSchema),
    defaultValues: extractFiltersFromSearchParams(searchParams),
  });

  const onSubmitFilters = (data: PropertyFiltersValues) => {
    const params = new URLSearchParams();
    appendFiltersToSearchParams(data, params);
    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    form.reset({
      perPage: 8,
      page: 1,
      isReady: false,
      isNegotiable: false,
      search: "",
      cityId: 0,
      wilayaId: 0,
    });
    router.push(pathname);
  };

  // Called when the user moves/zooms the map
  const handleBoundsChange = useCallback(
    (bounds: BoundsFilter) => {
      const current = new URLSearchParams(searchParams.toString());
      current.set("swLat", bounds.swLat.toString());
      current.set("swLng", bounds.swLng.toString());
      current.set("neLat", bounds.neLat.toString());
      current.set("neLng", bounds.neLng.toString());
      current.set("page", "1"); // reset pagination on new area
      // Use router.replace so it doesn't stack history on every pan
      router.replace(`${pathname}?${current.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const pagination = data?.data?.pagination;
  const listings = data?.data?.listing || [];

  return (
    <>
      {/* Filters Bar */}
      <div className="w-full flex flex-col gap-10  bg-linear-to-b from-white to-muted/20">

        <ListingWidget
          withProvider
          defaultView="row-card"
          className="mx-auto w-full max-w-7xl px-4 pt-4 lg:px-6 xl:px-8"
          cardsView={
            <div className="grid gap-8 lg:grid-cols-[310px_minmax(0,1fr)] xl:gap-10">
              <aside className="hidden lg:block">
                <Form {...form}>
                  <div className="sticky top-24 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                    <MainFilters
                      form={form}
                      onSubmit={onSubmitFilters}
                      resetFilters={resetFilters}
                    />
                  </div>
                </Form>
              </aside>
              <main className="min-w-0">
                <div className="overflow-hidden mb-4 rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  <PropertyFilters
                    resetFilters={resetFilters}
                    form={form}
                    onSubmit={onSubmitFilters}
                    loading={isLoading}
                  />
                </div>
                <div className="grid gap-6 sm:grid-cols-2 [1560px]:grid-cols-3">
                  {listings.map((property) => (
                    <PropertyCard
                      key={property.id}
                      listing={(property as any).original ?? property}
                      locale={locale}
                    />
                  ))}
                </div>
              </main>
            </div>
          }
          rowCardsView={
            <div className="grid gap-8 lg:grid-cols-[350px_minmax(0,1fr)] xl:gap-10">
              <aside className="hidden lg:block">
                <Form {...form}>
                  <div className="sticky top-24 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                    <MainFilters
                      form={form}
                      onSubmit={onSubmitFilters}
                      resetFilters={resetFilters}
                    />
                  </div>
                </Form>
              </aside>
              <main className="min-w-0 space-y-4">
                <div className="mb-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  <PropertyFilters
                    resetFilters={resetFilters}
                    form={form}
                    onSubmit={onSubmitFilters}
                    loading={isLoading}
                  />
                </div>
                {listings.map((property) => (
                  <PropertyRowCard
                    key={property.id}
                    property={(property as any).original ?? property}
                  />
                ))}
              </main>
            </div>
          }
          mapView={
            <MapSearchView
              locale={locale}
              properties={listings}
              isLoading={isLoading}
              onBoundsChange={handleBoundsChange}
            />
          }
        />
        {pagination && (
          // @ts-ignore
          <div className="flex justify-center">
            <Pagination {...pagination} />
          </div>
        )}
      </div>
    </>
  );
}

export default function RealEstateFilterPage(props: any) {
  return (
    <Suspense fallback={null}>
      <RealEstateFilterPageContent {...props} />
    </Suspense>
  );
}
