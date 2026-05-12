"use client";

import { useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBuyCoinPackage, usePackages } from "@/hooks/use-payment";
import { toast } from "sonner";

export function PricingModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const buyCoinPackage = useBuyCoinPackage();
  const { data: packages = [], isLoading } = usePackages();

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    try {
      await buyCoinPackage.mutateAsync({ packageId: selectedPackage });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment initialization failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="default">Get Coins</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[96vw] lg:max-w-225 max-h-[95vh] p-0 overflow-auto bg-zinc-50 dark:bg-zinc-950">
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
          {isLoading ? (
            <div className="flex min-h-50 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg, index) => {
                const packageId = Number(pkg.id);
                const isPopular = index === 1; // Assuming the second package is popular by default for UI

                return (
                  <Card
                    key={pkg.id}
                    className={`relative py-3 cursor-pointer transition-all duration-200 border-2 ${
                      selectedPackage === packageId
                        ? "border-blue-600 shadow-md ring-4 ring-blue-600/10"
                        : isPopular
                        ? "border-blue-200 hover:border-blue-300 shadow-sm"
                        : "border-transparent hover:border-zinc-200 shadow-sm"
                    }`}
                    onClick={() => setSelectedPackage(packageId)}
                  >
                    {isPopular && (
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
                          DZD
                        </span>
                      </div>

                      <Button
                        variant={selectedPackage === packageId ? "default" : "outline"}
                        className={`w-full ${
                          selectedPackage === packageId
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "hover:bg-blue-50 hover:text-blue-600"
                        }`}
                      >
                        {selectedPackage === packageId ? "Selected" : "Select Package"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={buyCoinPackage.isPending}>
              Cancel
            </Button>
            <Button
              disabled={!selectedPackage || buyCoinPackage.isPending}
              onClick={handlePurchase}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-30"
            >
              {buyCoinPackage.isPending ? "Redirecting..." : "Continue to Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
