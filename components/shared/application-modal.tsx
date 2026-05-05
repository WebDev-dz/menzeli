"use client";

import { useState } from "react";
import { QrCode, Smartphone, Apple } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { MOBILE_APP_URL } from "@/lib/constants";
import Image from "next/image";

export function ApplicationModal({ children }: { children?: React.ReactNode }) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);

  // Since we don't have a QR library installed, we'll use a public QR generation API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    MOBILE_APP_URL
  )}&margin=10`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Get the App
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white max-h-[95vh] overflow-auto">
        <div className="px-6 pt-8 pb-6 text-center border-b bg-zinc-50">
          <DialogHeader>
           
            <DialogTitle className="text-2xl font-bold text-center">
              Download Menzeli App
            </DialogTitle>
            <DialogDescription className="text-center text-base mt-2">
              Download our mobile application for the best experience.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 flex flex-col items-center">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100 mb-8">
            <div className="relative h-48 w-48">
              <Image
                src={qrCodeUrl}
                alt="Download App QR Code"
                fill
                className="object-contain rounded-lg"
                unoptimized
              />
            </div>
          </div>

          {/* Store Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Button
              className="flex-1 h-14 bg-zinc-900 hover:bg-zinc-800 text-white gap-3"
              onClick={() => window.open(MOBILE_APP_URL, "_blank")}
            >
              <Apple className="h-6 w-6" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] leading-none opacity-80">
                  Download on the
                </span>
                <span className="text-sm font-semibold leading-tight">
                  App Store
                </span>
              </div>
            </Button>
            
            <Button
              className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white gap-3"
              onClick={() => window.open(MOBILE_APP_URL, "_blank")}
            >
              <Smartphone className="h-6 w-6" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] leading-none opacity-80">
                  GET IT ON
                </span>
                <span className="text-sm font-semibold leading-tight">
                  Google Play
                </span>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
