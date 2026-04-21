"use client";

import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart, Check } from "lucide-react";
import { useListings } from "@/hooks/use-listings";
import { API_URL } from "@/lib/api-config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

import Link from "next/link";
import { FeatureResource, ListingResource } from "@/api";

type Props = {
  property: {
    original: ListingResource;
    id: number;
    title: string;
    location: string;
    price: number;
    pricePerSqFt: number;
    area: number;
    areaDetails: string;
    bhk: number;
    baths: number;
    description: string;
    verified: boolean;
    postedDate: string;
    owner: string;
    image: string;
    isReady: boolean;
    hasPhotos: boolean;
    features: FeatureResource[] | undefined;
  };
};

const PropertyRowCard = ({ property }: Props) => {
  const { t } = useTranslation("filters");

  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DZD",
      maximumFractionDigits: 0,
    }).format(price);
  };
  return (
    <Card key={property.id} className="py-0 shadow-none overflow-hidden">
      <CardContent className="p-0 ">
        <div className="grid md:grid-cols-[250px_1fr]">
          {/* Property Image */}
          <div className="relative">
            <img
              src={
                property.image.startsWith("http")
                  ? property.image
                  : `${API_URL}${property.image}`
              }
              alt={property.title}
              className="aspect-square h-full w-full object-cover md:rounded-l-lg"
            />
            <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
              {property.verified && (
                <Badge className="bg-white text-green-600 hover:bg-white border-none shadow-sm">
                  <Check className="w-3 h-3 mr-1" /> Verified
                </Badge>
              )}
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm text-zinc-500 hover:text-red-500"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(property.original);
                }}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite(property.id) ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
            </div>
          </div>

          {/* Property Details */}
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <Link href={`/listings/${property.id}`}>
                  <h3 className="text-foreground text-lg font-semibold hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                </Link>
                <p className="text-muted-foreground text-sm">
                  {property.location}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <div>
                  <p className="text-xl font-bold">
                    {formatPrice(property.price)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {property.pricePerSqFt
                      ? `$${property.pricePerSqFt}/sq.ft.`
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xl font-bold">{property.area} sq.m.</p>
                  <p className="text-muted-foreground text-xs">
                    {property.areaDetails}
                  </p>
                </div>
                <div>
                  <p className="text-xl font-bold">
                    {property.bhk} {t("bhk") || "Rooms"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {property.baths} Baths
                  </p>
                </div>
              </div>

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {property.features.slice(0, 3).map((feature) => (
                    <Badge
                      key={feature.id}
                      variant="secondary"
                      className="flex items-center gap-1 text-xs font-normal"
                    >
                      {feature.iconPath && (
                        <img
                          src={`${API_URL}${feature.iconPath}`}
                          alt=""
                          className="w-3 h-3"
                        />
                      )}
                      {feature.name}
                    </Badge>
                  ))}
                  {property.features.length > 3 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      +{property.features.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <p className="text-muted-foreground line-clamp-2 text-sm">
                {property.description}{" "}
                <Link href={`/listings/${property.id}`}>
                  <span className="text-primary cursor-pointer hover:underline">
                    {t("more") || "Read more"}
                  </span>
                </Link>
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Button className="w-full sm:w-auto">
                  {t("contact_owner") || "Contact Owner"}
                </Button>
                <div className="text-muted-foreground text-xs sm:text-right">
                  <p>
                    {t("posted_by").replace(
                      "{{date}}",
                      new Date(property.postedDate).toLocaleString("en-US"),
                    ) ||
                      `Posted on ${new Date(property.postedDate).toLocaleString("en-US")}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyRowCard;
