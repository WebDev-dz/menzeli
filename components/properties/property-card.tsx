"use client"
import { ListingResource } from "@/api/models";
import { API_URL } from "@/lib/api-config";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useTranslation } from "react-i18next";

type Props = {
  listing: ListingResource;
  locale: "ar" | "en" | "fr";
};

const PropertyCard = ({ listing, locale }: Props) => {
  const { t } = useTranslation();
  return (
    <Link
      key={listing.id}
      href={`/${locale}/listings/${listing.id}`}
      className="block h-full max-w-100"
    >
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-xl ring-1 ring-zinc-900/5">
        <div className="relative h-64 w-full overflow-hidden bg-zinc-200">
          <img
            src={
              listing.image
                ? `${listing.image}`
                : "/images/placeholder-property.jpg"
            }
            alt={listing.title}
            loading = "lazy"
            // fill
            className="h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div
            className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-semibold text-white ${listing.isReady ? "bg-green-500" : "bg-blue-600"}`}
          >
            {listing.isReady
              ? t("featured.ready")
              : t("featured.under_construction")}
          </div>
          {/* Type badge */}
          {listing.type && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold shadow">
              {listing.type.iconPath && (
                <img
                  src={`${listing.type.iconPath}`}
                  alt=""
                  className="w-4 h-4"
                />
              )}
              {listing.type.name}
            </div>
          )}
          {/* <button className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white">
            <Image
              src="/images/mmb90ocm-7x2xhwy.svg"
              alt="Like"
              width={16}
              height={16}
            />
          </button> */}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 line-clamp-1">
                {listing.title}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                <Image
                  src="/images/mmb90ocm-xnh2hxn.svg"
                  alt="Pin"
                  width={14}
                  height={14}
                />
                {listing.location
                  ? `${listing.location.city}, ${listing.location.wilaya}`
                  : "Algeria"}
              </div>
            </div>
            <div className="text-right rtl:text-left shrink-0 ml-2">
              <p className="text-lg font-bold text-blue-600 whitespace-nowrap">
                {formatPrice(listing.price, locale)}
              </p>
              {listing.rentDuration && (
                <p className="text-xs text-zinc-500">
                  {t("featured.per_month")}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Image
                src="/images/mmb90ocm-82u9fbn.svg"
                alt="Bed"
                width={18}
                height={18}
              />
              {listing.numberRooms} {t("featured.beds")}
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Image
                src="/images/mmb90ocm-wx669uh.svg"
                alt="Area"
                width={18}
                height={18}
              />
              {listing.surface}m²
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              {/* Using placeholder for bath as not in main resource, or check if features logic needed */}
              <Image
                src="/images/mmb90ocm-329x3nu.svg"
                alt="Bath"
                width={18}
                height={18}
              />
              {/* Placeholder or omit if not available */}-
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
