"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWilayas, usePropertyTypes } from '../../hooks/use-details';
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
type Props = {
   locale : "ar" | "en" | "fr"
};

export const SearchContent = ({ locale }: Props) => {
    const { t } = useTranslation("common");
    const { data: wilayas, isLoading: isLoadingWilayas } = useWilayas({locale})
    const { data: propertyTypes, isLoading: isLoadingPropertyTypes } = usePropertyTypes({locale})
    const [selectedWilayaId, setSelectedWilayaId] = useState("")
    const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState("")
    const [maxPrice, setMaxPrice] = useState<number>()
    const router = useRouter()
    const wilayaOptions = useMemo(() => wilayas?.wilayas ?? [], [wilayas])
    const propertyTypeOptions = useMemo(() => propertyTypes ?? [], [propertyTypes])
    const onSubmit = (e: any) => {
        e.preventDefault();
        const searchParams = new URLSearchParams()
        searchParams.append("wilayaId", selectedWilayaId)
        searchParams.append("propertyTypeId", selectedPropertyTypeId)
        searchParams.append("maxPrice", maxPrice?.toString() ?? "")
       
        router.push(`/listings/?${searchParams.toString()}`)
    }
  return (
    <div className="mx-auto mt-12 max-w-5xl rounded-2xl bg-white p-2 shadow-xl ring-1 ring-zinc-900/5 sm:rounded-full">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row items-center divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
        <div className="flex w-full items-center gap-3 px-6 py-4 sm:w-1/3">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-blue-50">
            <Image
              src="/images/mmb90ocl-m8ds0i6.svg"
              alt="Location"
              width={20}
              height={20}
              className="text-blue-600"
            />
          </div>
          <div className="w-full min-w-0">
            <input type="hidden" name="wilayaId" value={selectedWilayaId} />
            <Select
              value={selectedWilayaId}
              onValueChange={setSelectedWilayaId}
              disabled={isLoadingWilayas || wilayaOptions.length === 0}
            >
              <SelectTrigger className="h-auto rounded-none border-0 bg-transparent px-0 py-0 text-left text-zinc-900 shadow-none focus:ring-0 focus:ring-offset-0">
                <SelectValue
                  placeholder={
                    isLoadingWilayas
                      ? "Loading locations..."
                      : t("hero.search.location")
                  }
                />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-zinc-200">
                {wilayaOptions.map((wilaya) => (
                  <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                    {wilaya.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex w-full items-center gap-3 px-6 py-4 sm:w-1/4">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-blue-50">
            <Image
              src="/images/mmb90ocm-i8vdvdq.svg"
              alt="Type"
              width={20}
              height={20}
            />
          </div>
          <div className="w-full min-w-0">
            <input type="hidden" name="typeId" value={selectedPropertyTypeId} />
            <Select
              value={selectedPropertyTypeId}
              onValueChange={setSelectedPropertyTypeId}
              disabled={isLoadingPropertyTypes || propertyTypeOptions.length === 0}
            >
              <SelectTrigger className="h-auto rounded-none border-0 bg-transparent px-0 py-0 text-left text-zinc-900 shadow-none focus:ring-0 focus:ring-offset-0">
                <SelectValue
                  placeholder={
                    isLoadingPropertyTypes
                      ? "Loading property types..."
                      : t("hero.search.type")
                  }
                />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-zinc-200">
                {propertyTypeOptions.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex w-full items-center gap-3 px-6 py-4 sm:w-1/4">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-blue-50">
            <Image
              src="/images/mmb90ocm-tllla4r.svg"
              alt="Price"
              width={20}
              height={20}
            />
          </div>
          <Input
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            type="number"
            placeholder={t("hero.search.price")}
            className="w-full border-0 bg-transparent p-0 text-zinc-900 placeholder:text-zinc-400 focus:ring-0 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="p-2 w-full sm:w-auto">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors sm:w-auto"
          >
            <Image
              src="/images/mmb90ocm-o8ka6yb.svg"
              alt="Search"
              width={16}
              height={16}
              className="invert brightness-0"
            />
            {t("hero.search.button")}
          </button>
        </div>
      </form>
    </div>
  );
};
