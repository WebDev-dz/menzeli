"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Star,
  Bed,
  Bath,
  Maximize,
  Wifi,
  Car,
  Loader2,
  CheckCircle2,
  Users,
  Clock,
  CalendarDays,
  TrendingUp,
  Home,
  Layers,
  DollarSign,
  Timer,
  Tag,
  Navigation,
  ImageIcon
} from "lucide-react";
import { useListing } from "@/hooks/use-listings";
import { API_URL } from "@/lib/api-config";
import { useTranslation } from "react-i18next";

interface Props {
  id: number;
}

export default function PropertyDetails({ id }: Props) {
  const { data: property, isLoading, error } = useListing(id);
  const { t } = useTranslation("listings");

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500">
        Error loading property details
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Build image list: prefer images array, fallback to property.image
  const allImages: string[] = [];
  if (property.images && property.images.length > 0) {
    property.images.forEach((img: any) =>
      allImages.push(`${API_URL}/storage/${img.image}`)
    );
  } else if (property.image) {
    allImages.push(`${API_URL}${property.image}`);
  }

  const mainImage = allImages[0] ?? null;
  const secondImage = allImages[1] ?? null;
  const thirdImage = allImages[2] ?? null;
  const extraCount = allImages.length > 3 ? allImages.length - 3 : 0;

  const agent =
    property.members && property.members.length > 0
      ? property.members[0]
      : null;

  const ImagePlaceholder = ({ label }: { label: string }) => (
    <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground">
      <ImageIcon className="w-8 h-8 opacity-40" />
      <span className="text-xs opacity-60">{label}</span>
    </div>
  );

  return (
    <div className="mx-auto max-w-8xl px-4 py-4 lg:py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* ── Main Content ── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Image Gallery */}
          <div className="grid grid-cols-3 gap-3">
            <div className="relative col-span-3 aspect-4/3 overflow-hidden rounded-2xl md:col-span-2 bg-muted">
              {mainImage ? (
                <img src={mainImage} alt={property.title} className="object-cover w-full h-full" />
              ) : (
                <ImagePlaceholder label="No image available" />
              )}
              {/* Type badge */}
              {property.type && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold shadow">
                  {property.type.iconPath && (
                    <img src={`${API_URL}${property.type.iconPath}`} alt="" className="w-4 h-4" />
                  )}
                  {property.type.name}
                </div>
              )}
              {/* Boost badge */}
              {/* {property.boostLevel > 0 && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500 text-white rounded-full px-2 py-1 text-xs font-bold shadow">
                  <TrendingUp className="w-3 h-3" />
                  Featured
                </div>
              )} */}
            </div>
            <div className="col-span-3 grid grid-cols-2 gap-3 md:col-span-1 md:grid-cols-1">
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
                {secondImage ? (
                  <img src={secondImage} alt={`${property.title} 2`} className="object-cover w-full h-full" />
                ) : (
                  <ImagePlaceholder label="" />
                )}
              </div>
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
                {thirdImage ? (
                  <img src={thirdImage} alt={`${property.title} 3`} className="object-cover w-full h-full" />
                ) : (
                  <ImagePlaceholder label="" />
                )}
                {extraCount > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                    <span className="text-3xl font-bold text-white">+{extraCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title / Price / Location */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                {/* Categories */}
                {property.categories && property.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {property.categories.map((cat: any) => (
                      <Badge key={cat.id} variant="secondary" className="flex items-center gap-1 text-xs">
                        {cat.iconPath && (
                          <img src={`${API_URL}${cat.iconPath}`} alt="" className="w-3.5 h-3.5" />
                        )}
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                )}
                <h1 className="text-foreground font-heading text-3xl lg:text-4xl">{property.title}</h1>
              </div>
              <div className="text-right shrink-0">
                <div className="text-foreground text-3xl font-semibold whitespace-nowrap">
                  {formatPrice(property.price)}
                </div>
                {property.rentDuration && (
                  <div className="text-muted-foreground text-sm flex items-center justify-end gap-1 mt-0.5">
                    <Timer className="w-3.5 h-3.5" />
                    per {property.rentDuration.name}
                  </div>
                )}
                {property.isNegotiable && (
                  <Badge variant="outline" className="mt-1 text-xs text-green-600 border-green-300">
                    Negotiable
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {property.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{property.location.city}, {property.location.wilaya}, {property.location.country}</span>
                </div>
              )}
              {property.location?.zipCode && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  <span>{property.location.zipCode}</span>
                </div>
              )}
              {property.timePost && (
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" />
                  <span>Posted {formatDate(property.timePost.toLocaleString().split("T")[0])}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {property.surface != null && (
              <div className="bg-muted/60 rounded-xl p-3 flex flex-col gap-1">
                <Maximize className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-bold">{property.surface} m²</span>
                <span className="text-xs text-muted-foreground">Surface</span>
              </div>
            )}
            {property.numberRooms != null && (
              <div className="bg-muted/60 rounded-xl p-3 flex flex-col gap-1">
                <Bed className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-bold">{property.numberRooms}</span>
                <span className="text-xs text-muted-foreground">Room{property.numberRooms !== 1 ? "s" : ""}</span>
              </div>
            )}
            {property.numberPersons != null && (
              <div className="bg-muted/60 rounded-xl p-3 flex flex-col gap-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-bold">{property.numberPersons}</span>
                <span className="text-xs text-muted-foreground">Max Persons</span>
              </div>
            )}
            {property.floor != null && (
              <div className="bg-muted/60 rounded-xl p-3 flex flex-col gap-1">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-bold">{property.floor}</span>
                <span className="text-xs text-muted-foreground">Floor</span>
              </div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <div className="space-y-2">
              <h2 className="text-foreground font-bold">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Features / Amenities */}
          {property.features && property.features.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-foreground font-bold">{t("details.amenities")}</h2>
              <Card className="shadow-none">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {property.features.map((feature: any) => (
                      <div
                        key={feature.id}
                        className="flex items-center gap-2.5 bg-muted/50 rounded-lg px-3 py-2.5 text-sm"
                      >
                        {feature.iconPath ? (
                          <img
                            src={`${API_URL}${feature.iconPath}`}
                            alt=""
                            className="w-5 h-5 object-contain flex-shrink-0"
                          />
                        ) : (
                          <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        )}
                        <span className="font-medium">{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Near Places */}
          {property.nearPlaces && property.nearPlaces.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-foreground font-bold">Nearby Places</h2>
              <Card className="shadow-none">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {property.nearPlaces.map((place: any) => (
                      <div
                        key={place.id}
                        className="flex items-center gap-2.5 bg-muted/50 rounded-lg px-3 py-2.5 text-sm"
                      >
                        {place.iconPath ? (
                          <img
                            src={`${API_URL}${place.iconPath}`}
                            alt=""
                            className="w-5 h-5 object-contain flex-shrink-0"
                          />
                        ) : (
                          <Navigation className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                        <span className="font-medium">{place.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Property Details */}
          <div className="space-y-4">
            <h2 className="text-foreground font-bold">{t("details.areas_lot")}</h2>
            <Card className="shadow-none">
              <CardContent className="pt-4 divide-y text-sm [&_div]:flex [&_div]:items-center [&_div]:justify-between [&_div]:py-3">
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={property.isReady ? "default" : "secondary"} className="text-xs">
                    {property.isReady ? t("filters.ready_to_move") : t("filters.under_construction")}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Moderation</span>
                  <Badge
                    variant={property.moderationStatus === "approved" ? "default" : "outline"}
                    className="capitalize text-xs"
                  >
                    {property.moderationStatus}
                  </Badge>
                </div>
                {property.location && (
                  <div>
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium text-right">
                      {property.location.city}, {property.location.wilaya}
                    </span>
                  </div>
                )}

                {property.surface != null && (
                  <div>
                    <span className="text-muted-foreground">Living Space</span>
                    <span className="font-medium">{property.surface} m²</span>
                  </div>
                )}
                {property.floor != null && (
                  <div>
                    <span className="text-muted-foreground">Floor</span>
                    <span className="font-medium">{property.floor}</span>
                  </div>
                )}
                {property.numberRooms != null && (
                  <div>
                    <span className="text-muted-foreground">Rooms</span>
                    <span className="font-medium">{property.numberRooms}</span>
                  </div>
                )}
                {property.numberPersons != null && (
                  <div>
                    <span className="text-muted-foreground">Max Persons</span>
                    <span className="font-medium">{property.numberPersons}</span>
                  </div>
                )}
                {property.minDuration != null && (
                  <div>
                    <span className="text-muted-foreground">Min. Duration</span>
                    <span className="font-medium">
                      {property.minDuration} {property.rentDuration?.name ?? "day"}
                      {property.minDuration > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {property.rentDuration && (
                  <div>
                    <span className="text-muted-foreground">Rent Duration</span>
                    <span className="font-medium">{property.rentDuration.name}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Negotiable</span>
                  <span className="font-medium">{property.isNegotiable ? "Yes" : "No"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          {property.location?.latitude && property.location?.longitude && (
            <div className="space-y-4">
              <h2 className="text-foreground font-bold">Location</h2>
              <Card className="shadow-none overflow-hidden">
                <div className="relative w-full h-64 rounded-xl overflow-hidden">
                  <iframe
                    title="Property location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                      parseFloat(property.location.longitude) - 0.01
                    }%2C${
                      parseFloat(property.location.latitude) - 0.01
                    }%2C${
                      parseFloat(property.location.longitude) + 0.01
                    }%2C${
                      parseFloat(property.location.latitude) + 0.01
                    }&layer=mapnik&marker=${property.location.latitude}%2C${property.location.longitude}`}
                  />
                </div>
                <CardContent className="py-3 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{property.location.city}, {property.location.wilaya}</span>
                  </div>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${property.location.latitude}&mlon=${property.location.longitude}#map=15/${property.location.latitude}/${property.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-xs font-medium"
                  >
                    Open in Maps ↗
                  </a>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">

          {/* Agent Card */}
          {agent && (
            <Card className="bg-muted/50 shadow-none">
              <CardContent className="space-y-5 pt-5">
                <div className="flex items-start gap-4">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-muted border">
                    <img
                      src={
                        agent.profileImage
                          ? `${API_URL}/storage/${agent.profileImage}`
                          : "/placeholder-avatar.png"
                      }
                      alt={agent.name ?? "Agent"}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold leading-tight">{agent.name}</h3>
                    {agent.memberVerified && (
                      <div className="flex items-center gap-1 text-green-600 text-xs mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Agent
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  {agent.phone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("details.office_phone")}</span>
                      <span className="font-medium">{agent.phone}</span>
                    </div>
                  )}
                  {agent.email && (
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">{t("details.email")}</span>
                      <span className="font-medium text-right truncate">{agent.email}</span>
                    </div>
                  )}
                </div>
                <Button className="w-full">{t("details.view_property")}</Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Info Card (shown when no agent) */}
          {!agent && (
            <Card className="bg-muted/50 shadow-none">
              <CardContent className="pt-4 space-y-3 text-sm">
                <h3 className="font-semibold">Listing Info</h3>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-medium">#{property.id}</span>
                </div>
                {property.type && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Type</span>
                    <div className="flex items-center gap-1.5">
                      {property.type.iconPath && (
                        <img src={`${API_URL}${property.type.iconPath}`} alt="" className="w-4 h-4" />
                      )}
                      <span className="font-medium">{property.type.name}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Schedule Tour */}
          <Card className="bg-muted/50 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("details.schedule_tour")}</CardTitle>
              <CardDescription className="text-xs">{t("details.schedule_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">{t("details.property_id")}</Label>
                <Input value={property.id} readOnly className="bg-muted h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">{t("details.property_name")}</Label>
                <Input value={property.title} readOnly className="bg-muted h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">{t("details.full_name")}</Label>
                <Input placeholder={t("details.enter_name")} className="h-9 text-sm" />
              </div>
              <Button className="w-full">{t("details.schedule")}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}