"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

function PaymentSuccessPageInner() {
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const locale = Array.isArray(params?.locale) ? params.locale[0] : params?.locale || "en";
  const checkoutId = searchParams.get("checkout_id");

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center px-4 py-12">
      <Card className="w-full border-emerald-200">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto rounded-full bg-emerald-100 p-3 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Payment Successful</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            Your coins have been credited to your wallet.
          </p>
          {checkoutId ? (
            <p className="text-xs text-muted-foreground">Checkout ID: {checkoutId}</p>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href={`/${locale}/dashboard/billing`}>Go to Wallet</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/${locale}`}>Back Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessPageInner />
    </Suspense>
  );
}
