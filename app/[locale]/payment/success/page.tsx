import { redirect } from "next/navigation";

type SuccessAliasPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ checkout_id?: string }>;
};

export default async function PaymentSuccessAliasPage({
  params,
  searchParams,
}: SuccessAliasPageProps) {
  const { locale } = await params;
  const { checkout_id } = await searchParams;
  const query = checkout_id
    ? `?checkout_id=${encodeURIComponent(checkout_id)}`
    : "";

  redirect(`/${locale}/success${query}`);
}
