"use client";

import { useMemo } from "react";
import { useListings } from "@/hooks/use-listings";
import PropertyRowCard from "./property-row-card";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import PropertyCard from './property-card';

interface RelatedPropertiesProps {
  currentPropertyId?: number;
  wilayaId?: number;
}

export function RelatedProperties({ currentPropertyId, wilayaId }: RelatedPropertiesProps) {
  const { t, i18n } = useTranslation("property-details");
  
  // Fetch properties in the same wilaya. If no wilayaId, don't fetch.
  // We fetch 4 items and will filter out the current property.
  const { data, isLoading } = useListings(wilayaId ? { wilayaId, perPage: 4 } : undefined);
  const relatedProperties = useMemo(() => data?.data?.listing?.filter(l => l.id !== currentPropertyId) || [], [data]);



  if (!wilayaId || (relatedProperties?.length === 0 && !isLoading)) {
    return null; // Don't show the section if no related properties are found
  }

  return (
    <div className="mt-12 border-t pt-10">
      <h2 className="text-2xl font-bold mb-6 text-zinc-900">
        {t("related_properties", "Related Properties in this area")}
      </h2>

      {isLoading ? (
        <div className="flex w-full justify-center items-center h-32">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
          {relatedProperties.map((property) => (
            <PropertyCard key={property.id} listing = {property} locale={i18n.language as "en"}  />
          ))}
        </div>
      )}
    </div>
  );
}
