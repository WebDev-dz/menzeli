import initTranslations from "@/app/i18n";
import TranslationsProvider from "@/components/providers/TranslationsProvider";
import Header from "@/components/shared/header";
import RealEstateFilterPage from "@/components/properties/property-listing";
import Footer from '../../../components/shared/footer';

export default async function ListingsLayout({
  params,
  children
}: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, ["common", "listings","filters"]);

  
  return (
    <TranslationsProvider
      locale={locale}
      namespaces={["common", "listings"]}
      resources={resources}
    >
      <div className="min-h-screen bg-white font-sans text-zinc-900">
        <Header page="home" />
        <div className="max-w-7xl min-h-[70vh] flex flex-col items-center justify-center mx-auto px-4 sm:px-6 md:px-8">
        {children}

        </div>
        <Footer />
      </div>
    </TranslationsProvider>
  );
}
