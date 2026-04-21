import initTranslations from "@/app/i18n";
import TranslationsProvider from "@/components/providers/TranslationsProvider";
import Header from "@/components/shared/header";
import ChatBotPopover from "@/components/shared/chat-bot-popover";
import RealEstateFilterPage from "@/components/properties/property-listing";
import { ListingsIndexRequest } from "@/api";
import z from "zod";

import { listingsIndexRequestSchema } from "@/components/properties/utils";



export default async function ListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: ListingsIndexRequest;
}) {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, [
    "common",
    "listings",
    "filters",
  ]);
  

  const parsedSearchParams = listingsIndexRequestSchema.safeParse(await searchParams);

  console.log({ parsedSearchParams });
  
  return (
    <>
      <RealEstateFilterPage {...(parsedSearchParams.data ?? {})} />
      <ChatBotPopover />
    </>
  );
}
