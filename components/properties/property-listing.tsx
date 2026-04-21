"use client";

import { useMemo } from "react";
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

export default function RealEstateFilterPage(props: any) {
  const { t } = useTranslation("filters");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse props (search params) using the schema to ensure correct types (numbers vs strings)
  const parsedParams = listingsIndexRequestSchema.parse({
    ...props,
    // Ensure defaults or clean up empty strings if needed
    page: props.page ? Number(props.page) : 1,
    perPage: props.perPage || 10,
  });

  const { data, isLoading, refetch } = useListings(parsedParams);

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
          wilayaId: 0
      });
      router.push(pathname);
    };
  const properties = useMemo(() => {
    if (!data?.data?.listing) return [];

    return data.data.listing.map((p) => ({
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
      baths: 1, // Defaulting as API doesn't provide this yet
      description: p.description || "No description available.",
      verified: p.moderationStatus === "published",
      postedDate: p.timePost
        ? new Date(p.timePost).toLocaleDateString()
        : new Date().toLocaleDateString(),
      owner: "Agent", // Mocking owner
      image:
        p.image ||
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2940&auto=format&fit=crop",
      isReady: p.isReady,
      hasPhotos: !!p.image,
      features: p.features,
    }));
  }, [data]);

  const pagination = useMemo(() => {
    return data?.data?.pagination;
  }, [data]);

 

  return (
    <>
      {/* Filters Bar */}
      <div className="w-full border-b bg-gradient-to-b from-white to-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6 xl:px-8">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <PropertyFilters
              resetFilters={resetFilters}
              form={form}
              onSubmit={onSubmitFilters}
              loading = {isLoading}
            />
          </div>
        </div>
      </div>

      <div className="w-full border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6 xl:px-8">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-zinc-900">
              {isLoading
                ? "Loading..."
                : `${properties.length} ${t("title_results") || "Properties Found"}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("refine_search") || "Refine your search results"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 xl:gap-10 xl:px-8">
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
        {/* Property Listings */}
        <main className="min-w-0 space-y-6">
          {isLoading ? (
            <div className="flex w-full justify-center items-center h-64">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground text-lg">
                  {t("no_results")}
                </p>
              </CardContent>
            </Card>
          ) : (
            properties.map((property) => (
              <PropertyRowCard key={property.id} property={property} />
            ))
          )}
          {/* @ts-ignore */}
          {pagination && <Pagination {...pagination} />}
        </main>
      </div>
    </>
  );
}
