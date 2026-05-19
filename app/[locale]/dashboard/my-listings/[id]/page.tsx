"use client";

import { useParams } from "next/navigation";
import { UpdatePropertyForm } from "@/components/properties/update-property-form";
import { useListing } from "@/hooks/use-listings";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

export default function EditListingPage() {
  const params = useParams();
  const id = Number(params.id);
  const locale = params.locale as "ar" | "en" | "fr";
  const { data: listing, isLoading, error } = useListing(id);
  // Ensure translations are loaded if not already handled by a parent layout or provider
  // Since this is a client component, we rely on the provider.
  // But if the namespace isn't loaded, we might need to load it.
  // However, usually we load namespaces in the server component that renders this, or add it to the provider.
  const { t } = useTranslation("dashboard");

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    throw error; // This will be caught by the error boundary
  }

  if (!listing) {
    throw new Error(t("listings.edit.not_found"));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {t("listings.edit.title")}
        </h1>
        <p className="text-sm text-zinc-500">
          {t("listings.edit.subtitle")}
        </p>
      </div>

      <UpdatePropertyForm locale={locale} listing={listing} />
    </div>
  );
}
