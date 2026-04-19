"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth";
import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import i18nConfig from "@/i18nConfig";
import {useEffect} from 'react';
import UserDropdown from "./user-dropdown";
import { NotificationsDropdown } from "./notifications-dropdown";
import { ConfigSite } from "@/lib/conf";

type HeaderProps =
  | {
      page: "auth";
      step: 1 | 2 | 3;
    }
  | { page: "dashboard" }
  | { page?: "home" };

export default function Header(props: HeaderProps) {
  const { page = "home" } = props;
  const { user, logout } = useAuth();
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const router = useRouter();
  const currentPathname = usePathname();

  useEffect(() =>{
    console.log({dict: i18n.t('header.browse')})
  },[i18n]) 

  const handleLanguageChange = (newLocale: string) => {
    // set cookie for next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = '; expires=' + date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    if (
      currentLocale === i18nConfig.defaultLocale &&
      !i18nConfig.prefixDefault
    ) {
      router.push('/' + newLocale + currentPathname);
    } else {
      if (
        newLocale === i18nConfig.defaultLocale &&
        !i18nConfig.prefixDefault
      ) {
        const newPath = currentPathname.replace(`/${currentLocale}`, '');
        router.push(newPath || '/');
      } else {
        router.push(
          currentPathname.replace(`/${currentLocale}`, `/${newLocale}`)
        );
      }
    }

    router.refresh();
  };

  if (page === "dashboard") {
    return null;
  }

  
  // Home / Landing Page Header
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
               <Image
                 src={"/images/mmb9j5lh-4pas8mg.svg"}
                 alt={`${ConfigSite.siteName} Logo`}
                 width={32}
                height={32}
                className="h-8 w-8"
              />
               <span className="text-xl font-extrabold text-slate-900 tracking-tight">{ConfigSite.siteName}</span>
             </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
            <Link href={`/${currentLocale}/listings`} className="hover:text-blue-600 transition-colors">{i18n.t('common:header.browse')}</Link>
            <Link href={`/${currentLocale}/about`} className="hover:text-blue-600 transition-colors">{i18n.t('common:header.about', {siteName: ConfigSite.siteName})}</Link>
            <Link href={`/${currentLocale}/contact`} className="hover:text-blue-600 transition-colors">{i18n.t('common:header.contact')}</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href={user ? "/dashboard/my-listings/new" : "/auth?callback_url=/dashboard/my-listings/new"}
            className="hidden md:block rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            {i18n.t('common:header.list_property')}
          </Link>

          <div className="hidden lg:flex items-center rounded-full border border-zinc-200 bg-zinc-50 p-1 text-xs font-medium">
            <button 
              onClick={() => handleLanguageChange('en')}
              className={`rounded-full px-3 py-1 shadow-sm transition-colors ${currentLocale === 'en' ? 'bg-white text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              EN
            </button>
            <button 
              onClick={() => handleLanguageChange('fr')}
              className={`rounded-full px-3 py-1 shadow-sm transition-colors ${currentLocale === 'fr' ? 'bg-white text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              FR
            </button>
            <button 
              onClick={() => handleLanguageChange('ar')}
              className={`rounded-full px-3 py-1 shadow-sm transition-colors ${currentLocale === 'ar' ? 'bg-white text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              AR
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <NotificationsDropdown />
              <UserDropdown  />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth" className="text-sm font-semibold text-zinc-900 hover:text-blue-600">
                {i18n.t('common:header.login')}
              </Link>
              <Link
                href="/auth?mode=signup"
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline  focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
              >
                {i18n.t('common:header.signup')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
