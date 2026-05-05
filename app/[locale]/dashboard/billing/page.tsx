"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Loader2,
  Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWalletContext } from "@/components/providers/wallet-provider";
import { PricingModal } from "@/components/shared/pricing-modal";

const BillingPage = () => {
  const params = useParams<{ locale: string }>();
  const locale = Array.isArray(params?.locale) ? params.locale[0] : params?.locale || "en";
  const { t } = useTranslation("dashboard");
  const { wallet, transactions } = useWalletContext();

  const walletData = wallet.data?.data;
  const transactionItems = transactions.data?.data ?? [];

  const amountFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  if (wallet.isLoading || transactions.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (wallet.isError || transactions.isError) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>{t("billing.error_title", "Unable to load billing data")}</CardTitle>
          <CardDescription>
            {t(
              "billing.error_description",
              "Please refresh the page or try again in a moment.",
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("billing.title", "Billing & Wallet")}
        </h1>
        <p className="text-muted-foreground">
          {t(
            "billing.subtitle",
            "Track your wallet balance and review every wallet transaction.",
          )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-none bg-blue-600 text-white shadow-lg">
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Wallet className="h-6 w-6" />
              </div>
              <PricingModal>
                <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50 border-none font-semibold">
                  {t("stats.top_up", "Top Up")}
                </Button>
              </PricingModal>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-blue-100">
                {t("billing.balance_label", "Current balance")}
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-bold">
                  {amountFormatter.format(walletData?.balance ?? 0)}
                </h2>
                <span className="text-sm text-blue-100">
                  {t("billing.balance_unit", "coins")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("billing.summary_title", "Transaction summary")}</CardTitle>
            <CardDescription>
              {t(
                "billing.summary_description",
                "A quick overview of your wallet activity.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("billing.total_transactions", "Total transactions")}
              </p>
              <p className="mt-2 text-2xl font-semibold">{transactionItems.length}</p>
            </div>
            <div className="rounded-lg border bg-zinc-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t("billing.wallet_slug", "Wallet slug")}
              </p>
              <p className="mt-2 truncate text-sm font-semibold text-zinc-900">
                {walletData?.slug ?? "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("billing.transactions_title", "Wallet transactions")}</CardTitle>
          <CardDescription>
            {t(
              "billing.transactions_description",
              "Every deposit and withdrawal linked to your wallet.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactionItems.length === 0 ? (
            <div className="rounded-lg border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
              {t("billing.empty", "No wallet transactions found yet.")}
            </div>
          ) : (
            <div className="space-y-4">
              {transactionItems.map((transaction) => {
                const isDeposit = transaction.type.toLowerCase().includes("deposit");
                const transactionDate = new Date(transaction.date);
                const isValidDate = !Number.isNaN(transactionDate.getTime());

                return (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                          isDeposit
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {isDeposit ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold capitalize text-zinc-900">
                            {transaction.type.replaceAll("_", " ")}
                          </p>
                          <Badge
                            variant={transaction.confirmed === "confirmed" ? "default" : "secondary"}
                            className={
                              transaction.confirmed === "confirmed"
                                ? "bg-emerald-600 hover:bg-emerald-600"
                                : ""
                            }
                          >
                            {transaction.confirmed}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <span>{transaction.reason || t("billing.no_reason", "No reason provided")}</span>
                          <span className="inline-flex items-center gap-1">
                            <CreditCard className="h-3.5 w-3.5" />
                            {transaction.paymentMethod || t("billing.no_method", "No payment method")}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {isValidDate
                              ? dateFormatter.format(transactionDate)
                              : transaction.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <p
                        className={`text-lg font-semibold ${
                          isDeposit ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {isDeposit ? "+" : "-"}
                        {amountFormatter.format(Math.abs(transaction.amount))}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        #{transaction.id}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingPage;
