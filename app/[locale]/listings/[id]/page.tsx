import initTranslations from "@/app/i18n";
import TranslationsProvider from "@/components/providers/TranslationsProvider";
import PropertyDetails from "@/components/properties/property-details";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const { resources } = await initTranslations(locale, [
    "common",
    "listings",
    "property-details",
  ]);

  return (
    <TranslationsProvider
      locale={locale}
      namespaces={["common", "listings", "property-details"]}
      resources={resources}
    >
      <div className="min-h-screen w-full">
        <PropertyDetails id={Number(id)} />
      </div>
    </TranslationsProvider>
  );
}
