"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ConfigSite } from "@/lib/conf";
import Header from "@/components/shared/header";
import PhoneLogin from "./phone-login";
import PasswordLogin from "./password-login";

type AuthMethod = "phone" | "password";

export default function AuthContent() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>("phone");
  const { t } = useTranslation("auth");

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Header page="auth" step={1} />

      <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <Image
          src="/images/mmb9j5ki-hhhwr5q.svg"
          alt="Decoration"
          width={133}
          height={167}
          className="absolute top-20 right-0 pointer-events-none"
        />
        <Image
          src="/images/mmb9j5ki-i5332ko.svg"
          alt="Decoration"
          width={200}
          height={225}
          className="absolute bottom-0 left-0 pointer-events-none"
        />

        <div className="relative z-10 mb-4 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setAuthMethod("phone")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              authMethod === "phone"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {t("method.phone")}
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod("password")}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              authMethod === "password"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {t("method.password")}
          </button>
        </div>

        {authMethod === "phone" ? <PhoneLogin /> : <PasswordLogin />}

        <div className="mt-12 w-full max-w-4xl border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>{t("footer.copyright", { siteName: ConfigSite.siteName })}</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-600">{t("footer.privacy")}</Link>
            <Link href="#" className="hover:text-slate-600">{t("footer.terms")}</Link>
            <Link href="#" className="hover:text-slate-600">{t("footer.contact")}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
