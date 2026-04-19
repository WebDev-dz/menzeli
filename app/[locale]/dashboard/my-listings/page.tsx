import initTranslations from "@/app/i18n";
import { ListingApi, ListingResource } from "@/api";
import { apiConfig, API_URL } from "@/lib/api-config";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Plus,
  LayoutGrid,
  List as ListIcon,
  MoreVertical,
  Eye,
  PhoneCall,
  Edit,
  Megaphone,
  Trash2,
  MapPin,
  TrendingUp,
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ListingContent from "./content";

export default async function MyListingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, ["dashboard"]);

  // Fetch listings using the regular API as requested
  

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "en-US", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Helper to determine status style
  const getStatusStyle = (status: string, isReady: boolean) => {
    if (status === "sold") return "bg-zinc-100 text-zinc-600";
    if (!isReady) return "bg-orange-100 text-orange-600"; // Pending/Under construction
    return "bg-green-100 text-green-600"; // Active/Ready
  };

  const getStatusLabel = (status: string, isReady: boolean) => {
    if (status === "sold") return t("dashboard:listings.status.sold");
    if (!isReady) return t("dashboard:listings.status.pending");
    return t("dashboard:listings.status.active");

  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{t("dashboard:listings.title")}</h1>
          <p className="text-sm text-zinc-500">{t("dashboard:listings.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder={t("dashboard:listings.search")}
              className="h-10 w-64 border-zinc-200 pl-10 focus-visible:ring-0"
            />
          </div>
          <Link href={`/${locale}/dashboard/my-listings/new`}>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              {t("dashboard:listings.add_new")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <ListingContent />
      
      
    </div>
  );
}
