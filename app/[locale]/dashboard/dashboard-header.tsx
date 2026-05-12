"use client";

import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import UserDropdown from "@/components/members/member-dropdown";
import { NotificationsDropdown } from "@/components/shared/notifications-dropdown";
import { useAuth } from "@/components/providers/auth";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const { t } = useTranslation("dashboard");
  const { user } = useAuth();
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 shadow-sm">
      <div className="flex flex-1 items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn("shrink-0", { "hidden": !isMobile })}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <div className="relative w-full max-w-md">
         
        </div>
      </div>

      <div className="flex items-center gap-6">
        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 md:flex">
          <Link href="#" className="hover:text-zinc-900">{t("header.properties")}</Link>
          {/* <Link href="#" className="hover:text-zinc-900">{t("header.agencies")}</Link> */}
          <Link href="#" className="hover:text-zinc-900">{t("header.pricing")}</Link>
        </nav>
        <div className="h-4 w-px bg-zinc-200" />
        <div className="flex items-center gap-2">
          <NotificationsDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
