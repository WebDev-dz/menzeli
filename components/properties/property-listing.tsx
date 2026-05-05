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

import { useMemo, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useListings } from "@/hooks/use-listings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import PropertyFilters, { PropertyFiltersValues } from "./property-filters";
import {
  extractFiltersFromSearchParams,
  appendFiltersToSearchParams,
  listingsIndexRequestSchema,
} from "./utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import MainFilters from "./main-filter";
import Pagination from "../shared/pagination";
import PropertyRowCard from "./property-row-card";
import MapSearchView, { BoundsFilter } from "../map-search";

type ViewMode = "list" | "map";

export default function RealEstateFilterPage(props: any) {
  const { t } = useTranslation("filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const parsedParams = listingsIndexRequestSchema.parse({
    ...props,
    page: props.page ? Number(props.page) : 1,
    perPage: props.perPage || 10,
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
      perPage: 10,
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
    [router, pathname, searchParams]
  );

  const properties = useMemo(() => {
    if (!data?.data?.listing) return [];
    return data.data.listing.map((p: any) => ({
      original: p,
      id: p.id,
      title: p.title || "Untitled Property",
      location: p.location
        ? `${p.location.city}, ${p.location.wilaya}`
        : "Unknown Location",
      price: p.price,
      pricePerSqFt: p.surface ? Math.round(p.price / p.surface) : 0,
      area: p.surface || 0,
      areaDetails: p.surface ? `(${p.surface} sq.m.)` : "",
      bhk: p.numberRooms || 0,
      baths: 1,
      description: p.description || "No description available.",
      verified: p.moderationStatus === "published",
      postedDate: p.timePost
        ? new Date(p.timePost).toLocaleDateString()
        : new Date().toLocaleDateString(),
      owner: "Agent",
      image:
        p.image ||
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2940&auto=format&fit=crop",
      isReady: p.isReady,
      hasPhotos: !!p.image,
      features: p.features || [],
      ratingAvg: p.ratingAvg || 0,
      reviewsCount: p.reviewsCount || 0,
      views: p.views || 0,
      // 🗺️ Real coords from your API — add these fields to your listing model
      lat: p.latitude,
      lng: p.longitude,
    }));
  }, [data]);

  const pagination = useMemo(() => data?.data?.pagination, [data]);

  return (
    <>
      {/* Filters Bar */}
      <div className="w-full border-b bg-linear-to-b from-white to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6 xl:px-8">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <PropertyFilters
              resetFilters={resetFilters}
              form={form}
              onSubmit={onSubmitFilters}
              loading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`mx-auto w-full max-w-7xl px-4 py-4 lg:px-6 xl:px-8 ${
          viewMode === "map" ? "" : "grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:gap-10"
        }`}
      >
        {/* Sidebar filters — hidden in map mode */}
        {viewMode === "list" && (
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
        )}

        {/* Map / List view */}
        <main className="min-w-0">
          <MapSearchView
            properties={data?.data?.listing || []}
            isLoading={isLoading}
            onBoundsChange={handleBoundsChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            renderCard={(property) => (
              <PropertyRowCard
                key={property.id}
                property={(property as any).original ?? property}
              />
            )}
          />

          {/* Pagination — only in list mode */}
          {viewMode === "list" && pagination && (
            // @ts-ignore
            <Pagination {...pagination} />
          )}
        </main>
      </div>
    </>
  );
}