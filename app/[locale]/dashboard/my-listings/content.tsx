"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { API_URL } from "@/lib/api-config"
import { Card, CardContent } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Edit,
  Loader2,
  MapPin,
  Megaphone,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react"
import {
  useDeleteMemberListing,
} from "@/hooks/use-member-listings"
import { useMyListingsContext } from "@/components/providers/my-listings-provider"
import ListingWidget from "@/components/shared/listing-widget"
import MapSearchView from "@/components/map-search"

type Props = {}

const ListingContent = (_props: Props) => {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? "en"
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const { t } = useTranslation("dashboard")

  const { data, isLoading, isError } = useMyListingsContext()
  const { mutateAsync: deleteListing, isPending: isDeleting } =
    useDeleteMemberListing()

  const allListings = data?.data?.listing ?? []

  const listings = useMemo(() => {
    if (status === "active") return allListings.filter((l) => l.isReady)
    if (status === "pending") return allListings.filter((l) => !l.isReady)
    if (status === "sold")
      return allListings.filter((l) => l.moderationStatus === "sold")
    return allListings
  }, [allListings, status])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "en-US", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStatusStyle = (statusValue: string | undefined, isReady: boolean) => {
    if (statusValue === "sold") return "bg-zinc-100 text-zinc-600"
    if (!isReady) return "bg-orange-100 text-orange-600"
    return "bg-green-100 text-green-600"
  }

  const getStatusLabel = (statusValue: string | undefined, isReady: boolean) => {
    if (statusValue === "sold") return t("listings.status.sold")
    if (!isReady) return t("listings.status.pending")
    return t("listings.status.active")
  }

  const activeCount = allListings.filter((l) => l.isReady).length
  const pendingCount = allListings.filter((l) => !l.isReady).length
  const soldCount = allListings.filter((l) => l.moderationStatus === "sold").length

  const tabClass = (tabStatus: string | null) => {
    const isActive = (tabStatus ?? null) === (status ?? null)
    return isActive
      ? "whitespace-nowrap border-b-2 border-blue-600 pb-4 text-sm font-semibold text-blue-600"
      : "whitespace-nowrap pb-4 text-sm font-medium text-zinc-500 hover:text-zinc-900"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
        {t("listings.error", "Failed to load listings")}
      </div>
    )
  }

  const renderActions = (listing: any) => (
    <div className="flex items-center gap-2">
      <Link
        href={`/${locale}/dashboard/my-listings/${listing.id}`}
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className:
            "h-9 flex-1 gap-2 border-zinc-200 text-xs font-medium",
        })}
      >
        <Edit className="h-3.5 w-3.5" />
        {t("listings.card.edit")}
      </Link>
      <Button
        size="sm"
        className="h-9 flex-1 gap-2 bg-blue-50 text-xs font-medium text-blue-600 hover:bg-blue-100 hover:text-blue-700"
      >
        <Megaphone className="h-3.5 w-3.5" />
        {t("listings.card.promote")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={isDeleting}
        onClick={async () => {
          try {
            await deleteListing({ listing: listing.id })
            toast.success(
              t(
                "listings.delete_success",
                "Listing deleted",
              ),
            )
          } catch {
            toast.error(
              t(
                "listings.delete_error",
                "Failed to delete listing",
              ),
            )
          }
        }}
        className="h-9 w-9 border-zinc-200 px-0 text-red-500 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  const cardsView = (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <Card
          key={listing.id}
          className="group overflow-hidden border-zinc-200 py-0 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="relative h-48 bg-zinc-100">
            <img
              src={
                listing.image
                  ? `${API_URL}${listing.image}`
                  : "/images/placeholder-property.jpg"
              }
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
              <span
                className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(
                  listing.moderationStatus,
                  listing.isReady,
                )}`}
              >
                {getStatusLabel(listing.moderationStatus, listing.isReady)}
              </span>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/30">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="mb-4 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className="line-clamp-1 font-semibold text-zinc-900"
                  title={listing.title}
                >
                  {listing.title}
                </h3>
                <span className="shrink-0 font-bold text-blue-600">
                  {formatPrice(listing.price)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <MapPin className="h-3 w-3" />
                {listing.location
                  ? `${listing.location.city}, ${listing.location.wilaya}`
                  : "Algeria"}
              </div>
            </div>
            {renderActions(listing)}
          </CardContent>
        </Card>
      ))}

      <Link
        href={`/${locale}/dashboard/my-listings/new`}
        className="group flex h-full min-h-[380px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 text-center transition-colors hover:border-blue-300 hover:bg-blue-50/50"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200 transition-transform group-hover:scale-110">
          <Plus className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-900">
            {t("listings.empty.title")}
          </h3>
          <p className="mx-auto mt-1 max-w-[200px] text-sm text-zinc-500">
            {t("listings.empty.subtitle")}
          </p>
        </div>
      </Link>
    </div>
  )

  const rowCardsView = (
    <div className="space-y-4">
      {listings.map((listing) => (
        <Card key={listing.id} className="overflow-hidden border-zinc-200 py-0 shadow-sm">
          <div className="grid gap-0 md:grid-cols-[260px_minmax(0,1fr)]">
            <div className="relative h-52 md:h-full bg-zinc-100">
              <img
                src={
                  listing.image
                    ? `${API_URL}${listing.image}`
                    : "/images/placeholder-property.jpg"
                }
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-zinc-900">{listing.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <MapPin className="h-3 w-3" />
                    {listing.location
                      ? `${listing.location.city}, ${listing.location.wilaya}`
                      : "Algeria"}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-600">{formatPrice(listing.price)}</span>
                  <div
                    className={`mt-1 inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(
                      listing.moderationStatus,
                      listing.isReady,
                    )}`}
                  >
                    {getStatusLabel(listing.moderationStatus, listing.isReady)}
                  </div>
                </div>
              </div>
              {renderActions(listing)}
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  )

  const mapView = (
    <MapSearchView
      locale={locale}
      properties={listings as any}
      isLoading={false}
      onBoundsChange={() => {}}
    />
  )

  return (
    <>
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-6 overflow-x-auto pb-2 sm:pb-0">
          <Link
            href={`/${locale}/dashboard/my-listings`}
            className={tabClass(null)}
          >
            {t("listings.tabs.all")} ({allListings.length})
          </Link>
          <Link
            href={`/${locale}/dashboard/my-listings?status=active`}
            className={tabClass("active")}
          >
            {t("listings.tabs.active")} ({activeCount})
          </Link>
          <Link
            href={`/${locale}/dashboard/my-listings?status=pending`}
            className={tabClass("pending")}
          >
            {t("listings.tabs.pending")} ({pendingCount})
          </Link>
          <Link
            href={`/${locale}/dashboard/my-listings?status=sold`}
            className={tabClass("sold")}
          >
            {t("listings.tabs.sold")} ({soldCount})
          </Link>
        </div>
      </div>

      <ListingWidget
        withProvider
        defaultView="cards"
        className="mt-6"
        cardsView={cardsView}
        rowCardsView={rowCardsView}
        mapView={mapView}
      />
    </>
  )
}

export default ListingContent
