"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api-config";
import Link from "next/link";
import { Heart, MapPin, Bed, Bath, Maximize } from "lucide-react";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

export default function FavoritesPage() {
  const { t } = useTranslation("dashboard");
  const { favorites, removeFavorite } = useFavoritesStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed rounded-lg border-zinc-200">
        <Heart className="w-12 h-12 text-zinc-300 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">{t("favorites_page.empty.title")}</h3>
        <p className="text-zinc-500 max-w-sm mb-6">
          {t("favorites_page.empty.description")}
        </p>
        <Button asChild>
          <Link href="/listings">{t("favorites_page.empty.action")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("favorites_page.title")}</h1>
        <p className="text-zinc-500">
          {t("favorites_page.subtitle", { count: favorites.length })}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {favorites.map((property) => (
          <Card key={property.id} className="overflow-hidden py-0 group hover:shadow-md transition-shadow relative">
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
              {property.image ? (
                <img
                  src={property.image.startsWith('http') ? property.image : `${property.image}`}
                  alt={property.title}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-400">
                  {t("favorites_page.card.no_image")}
                </div>
              )}
              
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-red-50 text-red-500 hover:text-red-600 shadow-sm rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    removeFavorite(property.id);
                  }}
                >
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
              </div>

              <div className="absolute bottom-2 left-2 flex gap-2">
                {property.type && (
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs font-medium text-zinc-900">
                    {property.type.name}
                  </Badge>
                )}
                {property.categories && property.categories.length > 0 && (
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-xs font-medium text-zinc-900">
                    {property.categories[0].name}
                  </Badge>
                )}
              </div>
            </div>

            <CardContent className="p-4">
              <Link href={`/listings/${property.id}`} className="block group-hover:underline mb-2">
                <h3 className="font-semibold text-zinc-900 line-clamp-1 text-lg">{property.title}</h3>
              </Link>
              
              <p className="text-xl font-bold text-primary mb-3">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "DZD",
                  maximumFractionDigits: 0,
                }).format(property.price)}
              </p>

              <div className="flex items-center gap-1 text-sm text-zinc-500 mb-4">
                <MapPin className="h-4 w-4 text-zinc-400" />
                <span className="truncate">
                  {property.location ? `${property.location.city}, ${property.location.wilaya}` : t("favorites_page.card.unknown_location")}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-t border-zinc-100 text-sm text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <Bed className="h-4 w-4 text-zinc-400" />
                  <span className="font-medium">{property.numberRooms || 0}</span>
                  <span className="text-zinc-400 text-xs">{t("favorites_page.card.beds")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4 text-zinc-400" />
                  <span className="font-medium">1</span>
                  <span className="text-zinc-400 text-xs">{t("favorites_page.card.bath")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Maximize className="h-4 w-4 text-zinc-400" />
                  <span className="font-medium">{property.surface || 0}</span>
                  <span className="text-zinc-400 text-xs">{t("favorites_page.card.area")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
