"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Bed,
  Maximize,
  Users,
  CalendarDays,
  Layers,
  Timer,
  Tag,
  Navigation,
  ImageIcon,
} from "lucide-react";
import { useListing } from "@/hooks/use-listings";
import { API_URL } from "@/lib/api-config";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RelatedProperties } from "./related-properties";
import { formatDate, formatPrice } from "@/lib/utils";
import { ReportModal } from "@/components/shared/report-modal";
import MemberCard from "../members/member-card";
import LocationPlace from '../map/location-place';

interface Props {
  id: number;
}

export default function PropertyDetails({ id }: Props) {
  const { data, isLoading, error } = useListing(id);
  const {
    t,
    i18n: { language: locale },
  } = useTranslation("property-details");
  const { t: tCommon } = useTranslation("common");

  const agent = useMemo(() => {
    if (data?.data.member) return data?.data.member;

    return null;
  }, [data?.data]);

  const reviews = useMemo(() => {
    if (!data?.data) return null;
    const value = (data?.data as any).reviews;
    return Array.isArray(value) ? value : [];
  }, [data?.data]);

  // if (isLoading) {
  //   return (
  //     <div className="flex h-[50vh] items-center justify-center">
  //       <Loader2 className="h-8 w-8 animate-spin text-primary" />
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500">
        {t("state.error_loading")}
      </div>
    );
  }

  

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
              {data?.data?.image ? (
                <img
                  src={`${data?.data?.image}`}
                  alt={data?.data.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <ImagePlaceholder label={t("gallery.no_image")} />
              )}
              {/* Type badge */}
              {data?.data.type && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold shadow">
                  {data?.data.type.iconPath && (
                    <img
                      src={`${data?.data.type.iconPath}`}
                      alt=""
                      className="w-4 h-4"
                    />
                  )}
                  {data?.data.type.name}
                </div>
              )}
              {/* Boost badge */}
              {/* {data?.data.boostLevel > 0 && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500 text-white rounded-full px-2 py-1 text-xs font-bold shadow">
                  <TrendingUp className="w-3 h-3" />
                  Featured
                </div>
              )} */}
            </div>
            {/* <div className="col-span-3 grid grid-cols-2 gap-3 md:col-span-1 md:grid-cols-1">
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
                {secondImage ? (
                  <img src={secondImage} alt={`${data?.data.title} 2`} className="object-cover w-full h-full" />
                ) : (
                  <ImagePlaceholder label="" />
                )}
              </div>
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
                {thirdImage ? (
                  <img src={thirdImage} alt={`${data?.data.title} 3`} className="object-cover w-full h-full" />
                ) : (
                  <ImagePlaceholder label="" />
                )}
                {extraCount > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                    <span className="text-3xl font-bold text-white">+{extraCount}</span>
                  </div>
                )}
              </div>
            </div> */}
          </div>

          {/* Title / Price / Location */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                {/* Categories */}
                {data?.data.categories && data?.data.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {data?.data.categories.map((cat: any) => (
                      <Badge
                        key={cat.id}
                        variant="secondary"
                        className="flex items-center gap-1 text-xs"
                      >
                        {cat.iconPath && (
                          <img
                            src={`${cat.iconPath}`}
                            alt=""
                            className="w-3.5 h-3.5"
                          />
                        )}
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                )}
                <h1 className="text-foreground font-heading text-3xl lg:text-4xl">
                  {data?.data.title}
                </h1>
              </div>
              <div className="text-right shrink-0">
                <div className="text-foreground text-3xl font-semibold whitespace-nowrap">
                  {formatPrice(data?.data?.price || 0, locale as "en")}
                </div>
                {data?.data.rentDuration && (
                  <div className="text-muted-foreground text-sm flex items-center justify-end gap-1 mt-0.5">
                    <Timer className="w-3.5 h-3.5" />
                    {t("price.per_duration", {
                      duration: data?.data.rentDuration.name,
                    })}
                  </div>
                )}
                {data?.data.isNegotiable && (
                  <Badge
                    variant="outline"
                    className="mt-1 text-xs text-green-600 border-green-300"
                  >
                    {t("badges.negotiable")}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {data?.data.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>
                    {data?.data.location.city}, {data?.data.location.wilaya},{" "}
                    {data?.data.location.country}
                  </span>
                </div>
              )}
              {data?.data.location?.zipCode && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  <span>{data?.data.location.zipCode}</span>
                </div>
              )}
              {data?.data.timePost && (
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" />
                  <span>
                    {t("meta.posted", {
                      date: formatDate(
                        data?.data.timePost.toLocaleString().split("T")[0],
                      ),
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data?.data.surface != null && (
              <div className="bg-muted/60 rounded-xl p-3 flex flex-col gap-1">
                <Maximize className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-bold">
                  {data?.data.surface} m²
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("stats.surface")}
                </span>
              </div>
            )}
            {data?.data.numberRooms != null && (
              <div className="bg-muted/60 rounded-xl p-3 flex flex-col gap-1">
                <Bed className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-bold">
                  {data?.data.numberRooms}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t(
                    data?.data.numberRooms === 1 ? "stats.room" : "stats.rooms",
                  )}
                </span>
              </div>
            )}
            {data?.data.numberPersons != null && (
              <div className="bg-muted/60 rounded-xl p-3 flex flex-col gap-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-bold">
                  {data?.data.numberPersons}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("stats.max_persons")}
                </span>
              </div>
            )}
            {data?.data.floor != null && (
              <div className="bg-muted/60 rounded-xl p-3 flex flex-col gap-1">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-bold">{data?.data.floor}</span>
                <span className="text-xs text-muted-foreground">
                  {t("stats.floor")}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {data?.data.description && (
            <div className="space-y-2">
              <h2 className="text-foreground font-bold">
                {t("sections.description")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {data?.data.description}
              </p>
            </div>
          )}

          {/* Features / Amenities */}
          {data?.data.features && data?.data.features.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-foreground font-bold">
                {t("sections.amenities")}
              </h2>
              <Card className="shadow-none">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {data?.data?.features.map((feature: any) => (
                      <div
                        key={feature.id}
                        className="flex items-center gap-2.5 bg-muted/50 rounded-lg px-3 py-2.5 text-sm"
                      >
                        {feature?.iconPath ? (
                          <img
                            src={`${feature.iconPath}`}
                            alt=""
                            className="w-5 h-5 object-contain shrink-0"
                          />
                        ) : (
                          <Star className="w-4 h-4 text-amber-400 shrink-0" />
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
          {data?.data.nearPlaces && data?.data.nearPlaces.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-foreground font-bold">
                {t("sections.nearby_places")}
              </h2>
              <Card className="shadow-none">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {data?.data.nearPlaces.map((place: any) => (
                      <div
                        key={place.id}
                        className="flex items-center gap-2.5 bg-muted/50 rounded-lg px-3 py-2.5 text-sm"
                      >
                        {place.iconPath ? (
                          <img
                            src={`${place.iconPath}`}
                            alt=""
                            className="w-5 h-5 object-contain shrink-0"
                          />
                        ) : (
                          <Navigation className="w-4 h-4 text-blue-500 shrink-0" />
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
            <h2 className="text-foreground font-bold">
              {t("sections.property_details")}
            </h2>
            <Card className="shadow-none">
              <CardContent className="pt-4 divide-y text-sm [&_div]:flex [&_div]:items-center [&_div]:justify-between [&_div]:py-3">
                <div>
                  <span className="text-muted-foreground">
                    {t("details.status")}
                  </span>
                  <Badge
                    variant={data?.data.isReady ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {data?.data.isReady
                      ? t("status.ready_to_move")
                      : t("status.under_construction")}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("details.moderation")}
                  </span>
                  <Badge
                    variant={
                      data?.data.moderationStatus === "approved"
                        ? "default"
                        : "outline"
                    }
                    className="capitalize text-xs"
                  >
                    {data?.data.moderationStatus}
                  </Badge>
                </div>
                {data?.data.location && (
                  <div>
                    <span className="text-muted-foreground">
                      {t("details.location")}
                    </span>
                    <span className="font-medium text-right">
                      {data?.data.location.city}, {data?.data.location.wilaya}
                    </span>
                  </div>
                )}

                {data?.data.surface != null && (
                  <div>
                    <span className="text-muted-foreground">
                      {t("details.living_space")}
                    </span>
                    <span className="font-medium">{data?.data.surface} m²</span>
                  </div>
                )}
                {data?.data.floor != null && (
                  <div>
                    <span className="text-muted-foreground">
                      {t("details.floor")}
                    </span>
                    <span className="font-medium">{data?.data.floor}</span>
                  </div>
                )}
                {data?.data.numberRooms != null && (
                  <div>
                    <span className="text-muted-foreground">
                      {t("details.rooms")}
                    </span>
                    <span className="font-medium">
                      {data?.data.numberRooms}
                    </span>
                  </div>
                )}
                {data?.data.numberPersons != null && (
                  <div>
                    <span className="text-muted-foreground">
                      {t("details.max_persons")}
                    </span>
                    <span className="font-medium">
                      {data?.data.numberPersons}
                    </span>
                  </div>
                )}
                {data?.data.minDuration != null && (
                  <div>
                    <span className="text-muted-foreground">
                      {t("details.min_duration")}
                    </span>
                    <span className="font-medium">
                      {data?.data.minDuration}{" "}
                      {data?.data.rentDuration?.name ??
                        t(
                          data?.data.minDuration > 1
                            ? "labels.days"
                            : "labels.day",
                        )}
                    </span>
                  </div>
                )}
                {data?.data.rentDuration && (
                  <div>
                    <span className="text-muted-foreground">
                      {t("details.rent_duration")}
                    </span>
                    <span className="font-medium">
                      {data?.data.rentDuration.name}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">
                    {t("details.negotiable")}
                  </span>
                  <span className="font-medium">
                    {data?.data.isNegotiable ? t("labels.yes") : t("labels.no")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <LocationPlace isLoading = {isLoading} location = {data?.data.location} />
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Agent Card */}

          <MemberCard member={agent} isLoading={isLoading} />

         {/*  Report Modal */}
           <ReportModal listingId={data?.data.id}>
              <Button variant="destructive" className="w-full">
                {tCommon("report_modal.trigger")}
              </Button>
           </ReportModal>
          
        </div>
      </div>
      {/* Related Properties Section */}
      <RelatedProperties
        currentPropertyId={data?.data.id}
        wilayaId={Number(data?.data.location?.wilayaCode)}
      />
    </div>
  );
}
