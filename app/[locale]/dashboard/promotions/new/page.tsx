"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useMemberListings } from "@/hooks/use-member-listings";
import { usePromote } from "@/hooks/use-promote";
import { useWallet } from "@/hooks/use-wallet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Zap } from "lucide-react";
import { ListingResource } from "@/api";

export default function NewPromotionPage() {
  const params = useParams<{ locale: string }>();
  const locale = Array.isArray(params?.locale) ? params.locale[0] : params?.locale || "en";
  const router = useRouter();
  const { t } = useTranslation("dashboard");

  const [listingId, setListingId] = useState<string>("");
  const [coins, setCoins] = useState<string>("200");

  const { data: listingsResponse, isLoading: isListingsLoading } = useMemberListings({
    perPage: 100, // Load enough listings to select from
  });
  const { data: walletResponse } = useWallet();
  const { mutate: promote, isPending } = usePromote();

  const listings: ListingResource[] = listingsResponse?.data?.listing || [];
  const currentCoins = walletResponse?.data?.balance || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!listingId) {
      toast.error(t("promotions.select_listing_error", "Please select a listing to promote."));
      return;
    }

    const coinsValue = parseInt(coins);
    if (isNaN(coinsValue) || coinsValue <= 0) {
      toast.error(t("promotions.invalid_coins", "Please enter a valid amount of coins."));
      return;
    }

    if (coinsValue > currentCoins) {
      toast.error(t("promotions.insufficient_coins", "You do not have enough coins."));
      return;
    }

    promote(
      { listingId: parseInt(listingId), coins: coinsValue },
      {
        onSuccess: () => {
          toast.success(t("promotions.success", "Listing promoted successfully!"));
          router.push(`/${locale}/dashboard/my-listings`);
        },
        onError: (error) => {
          toast.error(error.message || t("promotions.error", "Failed to promote listing."));
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("promotions.new_title", "Promote Listing")}
        </h1>
        <p className="text-muted-foreground">
          {t(
            "promotions.new_subtitle",
            "Boost your listing visibility by spending coins."
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("promotions.details", "Promotion Details")}</CardTitle>
            <CardDescription>
              {t("promotions.details_desc", "Select the listing and the amount of coins you want to spend.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="listing">{t("promotions.select_listing", "Select Listing")}</Label>
                <Select value={listingId} onValueChange={setListingId}>
                  <SelectTrigger id="listing" disabled={isListingsLoading}>
                    <SelectValue placeholder={t("promotions.select_placeholder", "Select a listing...")} />
                  </SelectTrigger>
                  <SelectContent>
                    {listings.map((listing) => (
                      <SelectItem key={listing.id} value={listing.id.toString()}>
                        {listing.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coins">{t("promotions.coins_to_spend", "Coins to Spend")}</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="coins"
                    type="number"
                    min="1"
                    value={coins}
                    onChange={(e) => setCoins(e.target.value)}
                    placeholder="200"
                  />
                  <span className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                    / {currentCoins} {t("promotions.available_coins", "available")}
                  </span>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isPending || isListingsLoading}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                {t("promotions.submit", "Promote Now")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
