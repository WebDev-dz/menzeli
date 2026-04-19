"use client";

import { ListingsIndexRequest } from "@/api";
import { useTranslation } from "react-i18next";
import { Info, Search, Filter } from "lucide-react";
import React, { useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import MainFilters from './main-filter';
import {
  useCategories,
  useCities,
  usePropertyTypes,
  useRentDurations,
  useWilayas,
} from "@/hooks/use-details";

export const listingsIndexRequestSchema = z.object({
  perPage: z.number().optional(),
  page: z.number().optional(),
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

export type PropertyFiltersValues = z.infer<typeof listingsIndexRequestSchema>;

const PropertyFilters = () => {
  const { t } = useTranslation("filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Fetch options
  const { data: categories } = useCategories();
  const { data: propertyTypes } = usePropertyTypes();
  const { data: rentDurations } = useRentDurations();
  const { data: wilayas } = useWilayas();

  const form = useForm<PropertyFiltersValues>({
    // @ts-ignore
    resolver: zodResolver(listingsIndexRequestSchema),
    defaultValues: {
      perPage: Number(searchParams.get("perPage")) || 10,
      page: Number(searchParams.get("page")) || 1,
      typeId: searchParams.get("typeId") ? Number(searchParams.get("typeId")) : undefined,
      categoryId: searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined,
      wilayaId: searchParams.get("wilayaId") ? Number(searchParams.get("wilayaId")) : undefined,
      cityId: searchParams.get("cityId") ? Number(searchParams.get("cityId")) : undefined,
      rentDurationId: searchParams.get("rentDurationId") ? Number(searchParams.get("rentDurationId")) : undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      minSurface: searchParams.get("minSurface") ? Number(searchParams.get("minSurface")) : undefined,
      maxSurface: searchParams.get("maxSurface") ? Number(searchParams.get("maxSurface")) : undefined,
      numberRooms: searchParams.get("numberRooms") ? Number(searchParams.get("numberRooms")) : undefined,
      numberPersons: searchParams.get("numberPersons") ? Number(searchParams.get("numberPersons")) : undefined,
      isReady: searchParams.get("isReady") === "true",
      isNegotiable: searchParams.get("isNegotiable") === "true",
      search: searchParams.get("search") || "",
      sortBy: (searchParams.get("sortBy") as any) || "price",
      sortDir: (searchParams.get("sortDir") as any) || "asc",
    },
  });

  const selectedWilaya = form.watch("wilayaId");
  const { data: cities } = useCities(selectedWilaya);

  // Watch for changes and submit automatically for some fields or provide a button
  // For a better UX, we can debounce search or use a "Apply Filters" button.
  // Given the complexity, a "Apply" button is safer.

  const onSubmit = (data: PropertyFiltersValues) => {
    const params = new URLSearchParams();
    
    // Helper to append if value exists
    const appendIfDefined = (key: string, value: any) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    };

    appendIfDefined("perPage", data.perPage);
    appendIfDefined("page", 1); // Reset to page 1 on filter change
    appendIfDefined("typeId", data.typeId);
    appendIfDefined("categoryId", data.categoryId);
    appendIfDefined("wilayaId", data.wilayaId);
    appendIfDefined("cityId", data.cityId);
    appendIfDefined("rentDurationId", data.rentDurationId);
    appendIfDefined("minPrice", data.minPrice);
    appendIfDefined("maxPrice", data.maxPrice);
    appendIfDefined("minSurface", data.minSurface);
    appendIfDefined("maxSurface", data.maxSurface);
    appendIfDefined("numberRooms", data.numberRooms);
    appendIfDefined("numberPersons", data.numberPersons);
    if (data.isReady) params.append("isReady", "true");
    if (data.isNegotiable) params.append("isNegotiable", "true");
    appendIfDefined("search", data.search);
    appendIfDefined("sortBy", data.sortBy);
    appendIfDefined("sortDir", data.sortDir);

    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    form.reset({
        perPage: 10,
        page: 1,
        isReady: false,
        isNegotiable: false,
        search: ""
    });
    router.push(pathname);
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, console.error)} className="space-y-4">
          <div className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                
                {/* Search Bar */}
                <div className="flex-1 max-w-sm">
                  <FormField
                    control={form.control}
                    name="search"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder={t("search_placeholder") || "Search..."}
                              className="pl-9"
                              {...field}
                              value={field.value || ""}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap items-center gap-2">
                   <FormField
                    control={form.control}
                    name="isReady"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                            <Badge
                                variant={field.value ? "default" : "outline"}
                                className="cursor-pointer px-3 py-1 hover:bg-primary/90"
                                onClick={() => {
                                    field.onChange(!field.value);
                                    // Optionally submit immediately for toggles
                                    // form.handleSubmit(onSubmit)();
                                }}
                            >
                                {t("ready_to_move") || "Ready to Move"}
                            </Badge>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isNegotiable"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                            <Badge
                                variant={field.value ? "default" : "outline"}
                                className="cursor-pointer px-3 py-1 hover:bg-primary/90"
                                onClick={() => {
                                    field.onChange(!field.value);
                                }}
                            >
                                {t("negotiable") || "Negotiable"}
                            </Badge>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Sort By */}
                   <FormField
                    control={form.control}
                    name="sortBy"
                    render={({ field }) => (
                      <FormItem className="min-w-35">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("sort_by") || "Sort by"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="price">{t("price") || "Price"}</SelectItem>
                            <SelectItem value="created_at">{t("date") || "Date"}</SelectItem>
                            <SelectItem value="surface">{t("area") || "Area"}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Mobile Filters / More Filters Sheet */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>{t("all_filters") || "All Filters"}</SheetTitle>
                        <SheetDescription>
                          {t("refine_search") || "Refine your search results"}
                        </SheetDescription>
                      </SheetHeader>
                     <MainFilters 
                      form={form}
                      onSubmit={onSubmit}
                      resetFilters={resetFilters}
                      selectedWilaya = {selectedWilaya}
                      cities = {cities}
                     />
                    </SheetContent>
                  </Sheet>
                  
                  <Button  type="submit">
                    {t("search") || "Search"}
                  </Button>

                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PropertyFilters;
