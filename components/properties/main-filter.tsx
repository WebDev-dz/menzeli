"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { PropertyFiltersValues } from "./property-filters";
import {
  useCategories,
  usePropertyTypes,
  useRentDurations,
  useWilayas,
} from "@/hooks/use-details";
import { DetailsCities200ResponseData } from "@/api";

type Props = {
  form: UseFormReturn<PropertyFiltersValues>;
  onSubmit: (data: PropertyFiltersValues) => void;
  resetFilters: () => void;
  selectedWilaya?: number
  cities?: DetailsCities200ResponseData 
};

const MainFilters = ({ form, onSubmit, resetFilters, selectedWilaya, cities }: Props) => {
  const { t } = useTranslation("filters");
  const { data: categories } = useCategories();
  const { data: propertyTypes } = usePropertyTypes();
  const { data: rentDurations } = useRentDurations();
  const { data: wilayas } = useWilayas();

  return (
    <div className="grid gap-4 py-4 px-4">
      {/* Property Type */}
      <FormField
        control={form.control}
        name="typeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("property_type") || "Property Type"}</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {propertyTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {/* Category */}
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("category") || "Category"}</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {/* Location */}
      <div className="grid grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name="wilayaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("wilaya") || "Wilaya"}</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue("cityId", undefined); // Reset city when wilaya changes
                }}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wilaya" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {wilayas?.wilayas?.map((wilaya) => (
                    <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                      {wilaya.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("city") || "City"}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value?.toString()}
                disabled={!selectedWilaya}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cities?.cities?.map((city) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <FormLabel>{t("price_range") || "Price Range"}</FormLabel>
        <div className="flex items-center gap-2">
          <FormField
            control={form.control}
            name="minPrice"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input type="number" placeholder="Min" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <span>-</span>
          <FormField
            control={form.control}
            name="maxPrice"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input type="number" placeholder="Max" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Surface Range */}
      <div className="space-y-2">
        <FormLabel>{t("surface_range") || "Surface (m²)"}</FormLabel>
        <div className="flex items-center gap-2">
          <FormField
            control={form.control}
            name="minSurface"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input type="number" placeholder="Min" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <span>-</span>
          <FormField
            control={form.control}
            name="maxSurface"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input type="number" placeholder="Max" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Rooms & Persons */}
      <div className="grid grid-cols-2 gap-2">
        <FormField
          control={form.control}
          name="numberRooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("rooms") || "Rooms"}</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="numberPersons"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("persons") || "Persons"}</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1 "
          onClick={resetFilters}
        >
          {t("reset") || "Reset"}
        </Button>
        <Button
          onClick={() => form.handleSubmit(onSubmit, console.error)()}
          type="submit"
          className="flex-1"
        >
          {t("apply") || "Apply Filters"}
        </Button>
      </div>
    </div>
  );
};

export default MainFilters;
