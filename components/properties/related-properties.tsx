"use client";

import { useMemo } from "react";
import { useListings } from "@/hooks/use-listings";
import PropertyRowCard from "./property-row-card";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

interface RelatedPropertiesProps {
  currentPropertyId: number;
  wilayaId?: number;
}

export function RelatedProperties({ currentPropertyId, wilayaId }: RelatedPropertiesProps) {
  const { t } = useTranslation("property-details");
  
  // Fetch properties in the same wilaya. If no wilayaId, don't fetch.
  // We fetch 4 items and will filter out the current property.
  const { data, isLoading } = useListings(wilayaId ? { wilayaId, perPage: 4 } : undefined);

  const relatedProperties = useMemo(() => {
    if (!data?.data?.listing) return [];

    return data.data.listing
      .filter((p) => p.id !== currentPropertyId) // Exclude the current property
      .slice(0, 3) // Only show up to 3 properties
      .map((p) => ({
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
        ratingAvg: 0,
        reviewsCount: 0,
        views: 0
      }));
  }, [data, currentPropertyId]);

  if (!wilayaId || (relatedProperties.length === 0 && !isLoading)) {
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
        <div className="grid grid-cols-1 gap-6">
          {relatedProperties.map((property) => (
            <PropertyRowCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
