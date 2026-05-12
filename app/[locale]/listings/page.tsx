import ChatBotPopover from "@/components/shared/chat-bot-popover";
import RealEstateFilterPage from "@/components/properties/property-listing";
import { ListingsIndexRequest } from "@/api";

import { listingsIndexRequestSchema } from "@/components/properties/utils";



export default async function ListingsPage({
  params: _params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: ListingsIndexRequest;
}) {
  const parsedSearchParams = listingsIndexRequestSchema.safeParse(await searchParams);

  console.log({ parsedSearchParams });
  
  return (
    <>
      <RealEstateFilterPage {...(parsedSearchParams.data ?? {})} />
      <ChatBotPopover />
    </>
  );
}
