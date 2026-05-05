"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  LayoutDashboard,
  Home,
  Heart,
  Coins,
  PlusCircle,
  User,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { ConfigSite } from "@/lib/conf";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { cn } from "@/lib/utils";

interface SidebarProps {
  locale: string;
}

export function Sidebar({ locale }: SidebarProps) {
  const { t } = useTranslation("dashboard");
  const pathname = usePathname();
  const { open, openMobile, setOpenMobile, isMobile } = useSidebar();

  const navItems = [
    { icon: LayoutDashboard, label: t("sidebar.overview"), href: `/${locale}/dashboard` },
    { icon: Home, label: t("sidebar.my_listings"), href: `/${locale}/dashboard/my-listings` },
    { icon: Heart, label: t("sidebar.favorites"), href: `/${locale}/dashboard/favorites` },
    { icon: Bot, label: t("sidebar.ai_assistant", "AI Assistant"), href: `/${locale}/dashboard/ai-assistant` },
    { icon: Coins, label: t("sidebar.coins"), href: `/${locale}/dashboard/billing` },
    { icon: Bell, label: t("sidebar.notifications"), href: `/${locale}/dashboard/notifications` },
    { icon: User, label: t("sidebar.profile"), href: `/${locale}/dashboard/profile` },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}/dashboard`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && openMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={() => setOpenMobile(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-e border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobile && !openMobile ? "-translate-x-full rtl:translate-x-full" : "translate-x-0"
        )}
      >
      {/* Header */}
      <Link href="#"  >
      <div className="flex h-16 items-center gap-3 px-6 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none text-zinc-900 dark:text-zinc-50">
            {ConfigSite.siteName}
          </h1>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
            Real Estate Marketplace
          </p>
        </div>
      </div>
      </Link>
      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {navItems.map((item, index) => {
          const active = isActive(item.href);
          return (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
              }`}
            >
              <item.icon
                className={`h-5 w-5 shrink-0 ${
                  active
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-500 dark:text-zinc-500"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer CTA */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
        <Button
          className="w-full justify-center gap-2 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500"
          size="lg"
        >
          <PlusCircle className="h-4 w-4 shrink-0" />
          {t("sidebar.post_listing")}
        </Button>
      </div>
      </aside>
    </>
  );
}
