"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { ConfigSite } from "@/lib/conf";

export default function Footer() {
  const { t, i18n } = useTranslation("common");
  const currentLocale = useMemo(() => i18n.language, [i18n]);

  return (
    <footer className="bg-white border-t border-zinc-100" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
           <Link href="/" className="flex items-center gap-2">
               <Image
                 src={"/images/menzili_logo.png"}
                 alt={`${ConfigSite.siteName} Logo`}
                 width={120}
                height={32}
                className="h-8 w-auto"
              />
             </Link>
            <p className="text-sm leading-6 text-zinc-600 max-w-sm">
              {t('footer.description')}
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-zinc-400 hover:text-zinc-500">
                <span className="sr-only">Facebook</span>
                <Image src="/images/mmb90ocn-r00v4zn.svg" alt="Facebook" width={24} height={24} className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-zinc-500">
                <span className="sr-only">Instagram</span>
                <Image src="/images/mmb90oco-qqdo8jo.svg" alt="Instagram" width={24} height={24} className="h-6 w-6" />
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-zinc-500">
                <span className="sr-only">Twitter</span>
                <Image src="/images/mmb90oco-hy1xutr.svg" alt="Twitter" width={24} height={24} className="h-6 w-6" />
              </Link>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-zinc-900">{t('footer.explore')}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link href={`/${currentLocale}/listings`} className="text-sm leading-6 text-zinc-600 hover:text-zinc-900">All Listings</Link></li>
                  <li><Link href={`/${currentLocale}/listings?location=algiers?type=appartement`} className="text-sm leading-6 text-zinc-600 hover:text-zinc-900">Apartments in Algiers</Link></li>
                  <li><Link href={`/${currentLocale}/listings?location=oran?type=villa`} className="text-sm leading-6 text-zinc-600 hover:text-zinc-900">Villas in Oran</Link></li>
                  <li><Link href={`/${currentLocale}/listings?type=studio`} className="text-sm leading-6 text-zinc-600 hover:text-zinc-900">Studios for Rent</Link></li>  
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-zinc-900">{t('footer.company')}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link href={`/${currentLocale}/about`} className="text-sm leading-6 text-zinc-600 hover:text-zinc-900">{t('footer.about')}</Link></li>
                  <li><Link href={`/${currentLocale}/terms`} className="text-sm leading-6 text-zinc-600 hover:text-zinc-900">{t('footer.terms')}</Link></li>
                  <li><Link href={`/${currentLocale}/privacy`} className="text-sm leading-6 text-zinc-600 hover:text-zinc-900">{t('footer.privacy')}</Link></li>
                </ul>
              </div>
            </div>
            {/* <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-zinc-900">{t('footer.support')}</h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li><Link href="#" className="text-sm leading-6 text-zinc-600 hover:text-zinc-900">Help Center</Link></li>
                  <li><Link href="/contact" className="text-sm leading-6 text-zinc-600 hover:text-zinc-900">{t('footer.contact')}</Link></li>
                  <li><Link href="#" className="text-sm leading-6 text-zinc-600 hover:text-zinc-900">Safety Guide</Link></li>
                </ul>
              </div>
            </div> */}
          </div>
        </div>
        <div className="mt-16 border-t border-zinc-900/10 pt-8 sm:mt-20 lg:mt-24 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs leading-5 text-zinc-500">{t('footer.copyright', {siteName: ConfigSite.siteName})}</p>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
              <Image src="/images/mmb90oco-t8dm4mb.svg" alt="Global" width={16} height={16} />
              English (US)
            </button>
            <button className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
              <Image src="/images/mmb90oco-9ny32f9.svg" alt="Currency" width={16} height={16} />
              DZD (DA)
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
