"use client";

import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart, Check, Star, Eye } from "lucide-react";
import { useListings } from "@/hooks/use-listings";
import { API_URL } from "@/lib/api-config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { ApplicationModal } from "@/components/shared/application-modal";

import Link from "next/link";
import { FeatureResource, ListingResource } from "@/api";

type Props = {
  property: ListingResource;
};

const PropertyRowCard = ({ property }: Props) => {
  const { t } = useTranslation("filters");
  console.log({ property });
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
                  : `${property.image}`
              }
              alt={property.title}
              loading="lazy"
              className="aspect-square h-full w-full object-cover md:rounded-l-lg"
            />
            <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
              {/* {property.verified && (
                <Badge className="bg-white text-green-600 hover:bg-white border-none shadow-sm">
                  <Check className="w-3 h-3 mr-1" /> Verified
                </Badge>
              )} */}
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm text-zinc-500 hover:text-red-500"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(property);
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
                <div className="flex items-start justify-between">
                  <Link href={`/listings/${property.id}`}>
                    <h3 className="text-foreground text-lg font-semibold hover:text-primary transition-colors">
                      {property.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3 shrink-0">
                    {property.views > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{property.views}</span>
                      </div>
                    )}
                    {property.reviewsCount > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {property?.ratingAvg}
                        </span>
                        <span>({property.reviewsCount})</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  {/* {property.location} */}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                <div>
                  <p className="text-xl font-bold">
                    {formatPrice(property.price)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {Math.round(property.price / (property?.surface || 1)) > 0
                      ? `${Math.round(property.price / (property?.surface || 1))}/sq.ft.`
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xl font-bold">{property.surface} sq.m.</p>
                  <p className="text-muted-foreground text-xs">
                    {property.surface}
                  </p>
                </div>
                <div>
                  <p className="text-xl font-bold">
                    {property.numberRooms} {t("bhk") || "Rooms"}
                  </p>
                  {/* <p className="text-muted-foreground text-xs">
                    {property.baths} Baths
                  </p> */}
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
                          src={`${feature.iconPath}`}
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
                <ApplicationModal>
                  <Button className="w-full sm:w-auto">
                    {t("contact_owner") || "Contact Owner"}
                  </Button>
                </ApplicationModal>
                <div className="text-muted-foreground text-xs sm:text-right">
                  <p>
                    {t("posted_by").replace(
                      "{{date}}",
                      new Date(property.timePost || "").toLocaleString("en-US"),
                    ) ||
                      `Posted on ${new Date(property.timePost || "").toLocaleString("en-US")}`}
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
