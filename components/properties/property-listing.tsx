"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart, Check } from "lucide-react";
import { useListings } from "@/hooks/use-listings";
import { API_URL } from "@/lib/api-config";
import { useTranslation } from "react-i18next";
import Link from 'next/link';
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { ListingsIndexRequest } from '@/api';
import PropertyFilters, { listingsIndexRequestSchema } from "./property-filters";
import {useEffect} from 'react';

export default function RealEstateFilterPage(props: any) {
  const { t, i18n } = useTranslation("filters");
  
  // Parse props (search params) using the schema to ensure correct types (numbers vs strings)
  const parsedParams = listingsIndexRequestSchema.parse({
    ...props,
    // Ensure defaults or clean up empty strings if needed
    page: props.page ? Number(props.page) : 1,
    perPage: props.perPage || 10,
  });
  
  const { data, isLoading } = useListings(parsedParams);
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  

  const properties = useMemo(() => {
    if (!data?.data?.listing) return [];
    
    return data.data.listing.map((p) => ({
      original: p,
      id: p.id,
      title: p.title || "Untitled Property",
      location: p.location ? `${p.location.city}, ${p.location.wilaya}` : "Unknown Location",
      price: p.price,
      pricePerSqFt: p.surface ? Math.round(p.price / p.surface) : 0,
      area: p.surface || 0,
      areaDetails: p.surface ? `(${p.surface} sq.m.)` : "",
      bhk: p.numberRooms || 0,
      baths: 1, // Defaulting as API doesn't provide this yet
      description: p.description || "No description available.",
      verified: p.moderationStatus === "published",
      postedDate: p.timePost ? new Date(p.timePost).toLocaleDateString() : new Date().toLocaleDateString(),
      owner: "Agent", // Mocking owner
      image: p.image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2940&auto=format&fit=crop",
      isReady: p.isReady,
      hasPhotos: !!p.image,
      features: p.features
    }));
  }, [data]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DZD", 
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      {/* Filters Bar */}
      <div className="w-full">
        <PropertyFilters />
      </div>

      <div className="w-full border-b bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-4">
             <h1 className="text-xl font-semibold">
                {isLoading ? "Loading..." : `${properties.length} ${t('title_results') || "Properties Found"}`}
             </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl px-4 py-6 mx-auto">

          {/* Property Listings */}
          <main className="space-y-6">
            {isLoading ? (
              <div className="flex w-full justify-center items-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : properties.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground text-lg">
                    {t('no_results')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              properties.map((property) => (
                <Card key={property.id} className="py-0 shadow-none overflow-hidden">
                  <CardContent className="p-0 ">
                    <div className="grid md:grid-cols-[250px_1fr]">
                      {/* Property Image */}
                      <div className="relative">
                        <img
                          src={property.image.startsWith('http') ? property.image : `${API_URL}${property.image}`}
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
                            <Heart className={`h-4 w-4 ${isFavorite(property.id) ? "fill-red-500 text-red-500" : ""}`} />
                          </Button>
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="px-6 py-4">
                        <div className="space-y-4">
                          <div>
                            <Link href= {`/listings/${property.id}`}>
                            <h3 className="text-foreground text-lg font-semibold hover:text-primary transition-colors">
                              {property.title}
                            </h3>
                            </Link>
                            <p className="text-muted-foreground text-sm">{property.location}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                            <div>
                              <p className="text-xl font-bold">{formatPrice(property.price)}</p>
                              <p className="text-muted-foreground text-xs">
                                {property.pricePerSqFt ? `$${property.pricePerSqFt}/sq.ft.` : ''}
                              </p>
                            </div>
                            <div>
                              <p className="text-xl font-bold">{property.area} sq.m.</p>
                              <p className="text-muted-foreground text-xs">
                                {property.areaDetails}
                              </p>
                            </div>
                            <div>
                              <p className="text-xl font-bold">{property.bhk} {t('bhk') || "Rooms"}</p>
                              <p className="text-muted-foreground text-xs">
                                {property.baths} Baths
                              </p>
                            </div>
                          </div>
                          
                          {/* Features */}
                          {property.features && property.features.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {property.features.slice(0, 3).map((feature) => (
                                <Badge key={feature.id} variant="secondary" className="flex items-center gap-1 text-xs font-normal">
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
                            <Link href= {`/listings/${property.id}`}>
                            <span className="text-primary cursor-pointer hover:underline">{t('more') || "Read more"}</span>
                            </Link>
                          </p>

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <Button className="w-full sm:w-auto">{t('contact_owner') || "Contact Owner"}</Button>
                            <div className="text-muted-foreground text-xs sm:text-right">
                              <p>
                                {t('posted_by', { date: new Date(property.postedDate).toLocaleString("en-US") }) || `Posted on ${new Date(property.postedDate).toLocaleString("en-US")}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </main>
      </div>
    </>
  );
}
