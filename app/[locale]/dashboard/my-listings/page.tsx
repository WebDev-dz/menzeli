import { Suspense } from "react";
import initTranslations from "@/app/i18n";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
} from "lucide-react";
import Link from "next/link";
import ListingContent from "./content";

function ListingsContentFallback() {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-zinc-500">
      Loading listings...
    </div>
  );
}

export default async function MyListingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, ["dashboard"]);

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
      <Suspense fallback={<ListingsContentFallback />}>
        <ListingContent />
      </Suspense>
      
      
    </div>
  );
}
