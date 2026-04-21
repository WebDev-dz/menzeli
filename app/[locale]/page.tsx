import initTranslations from "@/app/i18n";
import TranslationsProvider from "@/components/providers/TranslationsProvider";
import Image from "next/image";
import { Marquee } from "@/components/ui/marquee";

import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import ChatBotPopover from "@/components/shared/chat-bot-popover";
import { ListingApi, ListingResource } from "@/api";
import { apiConfig, API_URL } from "@/lib/api-config";
import { SearchContent } from './content';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, ["common"]);

  // Fetch featured listings (first 6)
  const listingApi = new ListingApi(apiConfig);
  let featuredListings: ListingResource[] = [];
  
  try {
    const response = await listingApi.index({ perPage: 6 });
    featuredListings = response.data.listing;
  } catch (error) {
    console.error("Failed to fetch featured listings:", error);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-DZ" : "en-US", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <TranslationsProvider
      locale={locale}
      namespaces={["common"]}
      resources={resources}
    >
      <div className="min-h-screen bg-white font-sans text-zinc-900">
        <Header page="home" />
        <ChatBotPopover />

        <main>
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-zinc-50 pb-32 pt-20 sm:pt-32 lg:pb-40 lg:pt-36">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <h1
                className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-zinc-900 sm:text-7xl"
                dangerouslySetInnerHTML={{ __html: t("hero.title") }}
              />
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
                {t("hero.subtitle")}
              </p>

              {/* Search Bar */}
              <SearchContent />
            </div>

            {/* Background decoration */}
            <div
              className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
              aria-hidden="true"
            >
              <div
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                style={{
                  clipPath:
                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                }}
              ></div>
            </div>
          </section>

          {/* Featured Listings */}
          <section className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                    {t("featured.title")}
                  </h2>
                  <p className="mt-4 text-lg text-zinc-600">
                    {t("featured.subtitle")}
                  </p>
                </div>
                <Link
                  href={`/${locale}/listings`}
                  className="hidden sm:flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500"
                >
                  {t("featured.view_all")}
                  <Image
                    src="/images/mmb90ocm-gco1687.svg"
                    alt="Arrow"
                    width={16}
                    height={16}
                  />
                </Link>
              </div>

              <div className="grid grid-cols-1">
                {featuredListings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
                    {featuredListings.map((listing) => (
                      <Link
                        key={listing.id}
                        href={`/${locale}/listings/${listing.id}`}
                        className="block h-full max-w-[400px]"
                      >
                        <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-xl ring-1 ring-zinc-900/5">
                          <div className="relative h-64 w-full overflow-hidden bg-zinc-200">
                            <img
                              src={
                                listing.image
                                  ? `${API_URL}${listing.image}`
                                  : "/images/placeholder-property.jpg"
                              }
                              alt={listing.title}
                              // fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div
                              className={`absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-semibold text-white ${listing.isReady ? "bg-green-500" : "bg-blue-600"}`}
                            >
                              {listing.isReady
                                ? t("featured.ready")
                                : t("featured.under_construction")}
                            </div>
                            <button className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white">
                              <Image
                                src="/images/mmb90ocm-7x2xhwy.svg"
                                alt="Like"
                                width={16}
                                height={16}
                              />
                            </button>
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
                                  {formatPrice(listing.price)}
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
                    ))}
                  </div>
                ) : (
                  <div className="col-span-3 text-center py-12 text-zinc-500">
                    {t("featured.no_listings")}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-center sm:hidden">
                <Link
                  href={`/${locale}/listings`}
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500"
                >
                  {t("featured.view_all")}
                  <Image
                    src="/images/mmb90ocm-gco1687.svg"
                    alt="Arrow"
                    width={16}
                    height={16}
                  />
                </Link>
              </div>
            </div>
          </section>

          {/* Promo Section */}
          <section className="bg-white pb-24 sm:pb-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Promo 1 */}
                <div className="relative overflow-hidden rounded-3xl bg-blue-600 px-6 pb-24 pt-16 shadow-2xl sm:px-16 lg:px-24">
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      {t("promo.find_home.title")}
                    </h3>
                    <p className="mt-6 max-w-lg text-lg text-blue-100">
                      {t("promo.find_home.subtitle")}
                    </p>
                    <div className="mt-10">
                      <Link
                        href="#"
                        className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                      >
                        {t("promo.find_home.button")}
                      </Link>
                    </div>
                  </div>
                  <Image
                    src="/images/mmb90ocn-7kgpcun.svg"
                    alt="House"
                    width={400}
                    height={400}
                    className="absolute -bottom-24 -right-24 h-96 w-96 opacity-20"
                  />
                </div>

                {/* Promo 2 */}
                <div className="relative overflow-hidden rounded-3xl bg-zinc-900 px-6 pb-24 pt-16 shadow-2xl sm:px-16 lg:px-24">
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      {t("promo.host.title")}
                    </h3>
                    <p className="mt-6 max-w-lg text-lg text-zinc-300">
                      {t("promo.host.subtitle")}
                    </p>
                    <div className="mt-10">
                      <Link
                        href="#"
                        className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                      >
                        {t("promo.host.button")}
                      </Link>
                    </div>
                  </div>
                  <Image
                    src="/images/mmb90ocn-xvjz285.svg"
                    alt="Host"
                    width={400}
                    height={400}
                    className="absolute -bottom-24 -right-24 h-96 w-96 opacity-20"
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </TranslationsProvider>
  );
}
