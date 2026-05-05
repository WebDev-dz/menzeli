"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  useWilayas,
} from "@/hooks/use-details";
import { DetailsCities200ResponseData } from "@/api";

type Props = {
  form: UseFormReturn<PropertyFiltersValues>;
  onSubmit: (data: PropertyFiltersValues) => void;
  resetFilters: () => void;
  selectedWilaya?: number;
  cities?: DetailsCities200ResponseData;
};

const MainFilters = ({ form, onSubmit, resetFilters, selectedWilaya, cities }: Props) => {
  const { t, i18n } = useTranslation("filters");
  
  const { data: categories } = useCategories({ locale: i18n.language as "en" });
  const { data: propertyTypes } = usePropertyTypes({ locale: i18n.language as "en" });
  const { data: wilayas } = useWilayas({ locale: i18n.language as "en" });

  return (
    <div className="grid gap-4 py-4 px-4">
      {/* Property Type */}
      <FormField
        control={form.control}
        name="typeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("property_type")}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("select_type")} />
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
            <FormLabel>{t("category")}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("select_category")} />
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
              <FormLabel>{t("wilaya")}</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue("cityId", undefined);
                }}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_wilaya")} />
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
              <FormLabel>{t("city")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value?.toString()}
                disabled={!selectedWilaya}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_city")} />
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
        <FormLabel>{t("price_range")}</FormLabel>
        <div className="flex items-center gap-2">
          <FormField
            control={form.control}
            name="minPrice"
            render={({ field: { value, ...rest } }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("min")}
                    {...rest}
                    value={value ?? ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <span>-</span>
          <FormField
            control={form.control}
            name="maxPrice"
            render={({ field: { value, ...rest } }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("max")}
                    {...rest}
                    value={value ?? ""}
                  />
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
              <FormLabel>{t("rooms")}</FormLabel>
              <FormControl>
                <Input type="number" placeholder={t("number_rooms_placeholder")} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="numberPersons"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("persons")}</FormLabel>
              <FormControl>
                <Input type="number" placeholder={t("number_persons_placeholder")} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={resetFilters}>
          {t("reset")}
        </Button>
        <Button onClick={() => form.handleSubmit(onSubmit)()} type="submit" className="flex-1">
          {t("apply_filters")}
        </Button>
      </div>
    </div>
  );
};

export default MainFilters;