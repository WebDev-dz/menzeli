"use client";

import { useState } from "react";
import { Coins, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const PACKAGES = [
  {
    id: "basic",
    coins: 50,
    price: 500,
    currency: "DZD",
    popular: false,
    features: ["Standard listing duration", "Basic support"],
  },
  {
    id: "pro",
    coins: 120,
    price: 1000,
    currency: "DZD",
    popular: true,
    features: ["Extended listing duration", "Priority support", "Boost 1 listing"],
  },
  {
    id: "premium",
    coins: 300,
    price: 2000,
    currency: "DZD",
    popular: false,
    features: [
      "Maximum listing duration",
      "24/7 Priority support",
      "Boost up to 5 listings",
      "Featured badge",
    ],
  },
];

export function PricingModal({ children }: { children?: React.ReactNode }) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handlePurchase = () => {
    if (!selectedPackage) return;
    // Handle the payment integration here
    console.log("Purchasing package:", selectedPackage);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="default">Get Coins</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[96vw] lg:max-w-[900px] max-h-[95vh] p-0 overflow-auto bg-zinc-50 dark:bg-zinc-950">
        <div className="px-6 pt-8 pb-6 text-center bg-white dark:bg-zinc-900 border-b">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
              <Coins className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              Top Up Your Wallet
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGES.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative py-3 cursor-pointer transition-all duration-200 border-2 ${
                  selectedPackage === pkg.id
                    ? "border-blue-600 shadow-md ring-4 ring-blue-600/10"
                    : pkg.popular
                    ? "border-blue-200 hover:border-blue-300 shadow-sm"
                    : "border-transparent hover:border-zinc-200 shadow-sm"
                }`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Coins className="h-6 w-6 text-amber-500" />
                      <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                        {pkg.coins}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Coins</p>
                  </div>

                  <div className="text-center mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {pkg.price}
                    </span>
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 ml-1">
                      {pkg.currency}
                    </span>
                  </div>

                  {/* <ul className="space-y-3 mb-6 flex-1">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul> */}

                  <Button
                    variant={selectedPackage === pkg.id ? "default" : "outline"}
                    className={`w-full ${
                      selectedPackage === pkg.id
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    {selectedPackage === pkg.id ? "Selected" : "Select Package"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!selectedPackage}
              onClick={handlePurchase}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
