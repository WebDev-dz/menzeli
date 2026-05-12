import { redirect } from "next/navigation";

type FailedAliasPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ checkout_id?: string }>;
};

export default async function PaymentFailedAliasPage({
  params,
  searchParams,
}: FailedAliasPageProps) {
  const { locale } = await params;
  const { checkout_id } = await searchParams;
  const query = checkout_id
    ? `?checkout_id=${encodeURIComponent(checkout_id)}`
    : "";

  redirect(`/${locale}/failed${query}`);
}
