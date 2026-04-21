"use client";

import { useTranslation } from "react-i18next";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { z } from "zod";
import { UseFormReturn } from 'react-hook-form';
import { useRouter, usePathname } from "next/navigation";
import MainFilters from './main-filter';
import { listingsIndexRequestSchema } from "./utils"
import {
  useCities,
} from "@/hooks/use-details";



export type PropertyFiltersValues = z.infer<typeof listingsIndexRequestSchema>;


type FiltersProps = {
  form: UseFormReturn<PropertyFiltersValues, any,PropertyFiltersValues >;
  onSubmit: (data: PropertyFiltersValues) => void;
  loading: boolean;
  resetFilters : () => void
}

const PropertyFilters = ({ form, onSubmit, loading = false, resetFilters }: FiltersProps) => {
  const { t } = useTranslation("filters");
  const [openSheet, setOpenSheet] = useState(false);
  const [openSheetMobile, setOpenSheetMobile] = useState(false);

  const handleCloseSheet = () => {setOpenSheet(false);}

  

  const selectedWilaya = form.watch("wilayaId");
  const { data: cities } = useCities(selectedWilaya);

  // Watch for changes and submit automatically for some fields or provide a button
  // For a better UX, we can debounce search or use a "Apply Filters" button.
  // Given the complexity, a "Apply" button is safer.

  const handleSubmit = (data: PropertyFiltersValues) => {
    handleCloseSheet();
    onSubmit(data);
  };

  

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit, console.error)} className="space-y-4">
          <div className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                
                {/* Search Bar */}
                {/* <div className="flex-1 max-w-sm">
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
                </div> */}

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
                  <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                    <SheetTrigger asChild>
                      <Button className="lg:hidden" variant="outline" size="icon">
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
                  
                  <Button disabled={loading} type="submit">
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
