
import initTranslations from "@/app/i18n";
import { PropertyForm } from "@/components/properties/property-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["dashboard", "common", "property-form"]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link 
          href={`/${locale}/dashboard/my-listings`}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common:back_to_listings", "Back to listings")}
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">{t("dashboard:listings.new.title", "Create New Property")}</h1>
        <p className="text-zinc-500">{t("dashboard:listings.new.subtitle", "Fill in the details below to list your property")}</p>
      </div>

      {/* Form */}
      <PropertyForm locale = {locale as "en"}  />
    </div>
  );
}
