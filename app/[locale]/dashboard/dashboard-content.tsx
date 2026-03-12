"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import  Image  from "next/image" 
import {
  Edit,
  Home as HomeIcon,
  Coins,
  Eye,
  Wallet,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/providers/auth";
import { useMemo } from 'react';
import { User } from "@/api/generated-client";

export function DashboardContent() {
  const { t } = useTranslation("dashboard");
  const { user: storedUser } = useAuth();
  const user = useMemo(() => storedUser, [storedUser]) as User;

  // Helper to format date
  const formatDate = (dateInput?: string | Date | null) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  };

  // Helper to get initials
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <Card className="overflow-hidden border-zinc-200 shadow-sm">
        <CardContent className="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-zinc-50 bg-zinc-100">
              <AvatarImage 
                src={user?.profileImage || "/images/placeholder-avatar.png"} 
                alt={user?.name || "User"} 
                className="object-cover"
              />
              <AvatarFallback className="text-2xl font-bold text-zinc-500">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">{user?.name || "User"}</h2>
              <div className="mt-1 flex items-center gap-3">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  {t("profile.pro_user")}
                </span>
                <span className="text-sm text-zinc-500">
                  {t("profile.joined", { date: formatDate(user?.createdAt) })}
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline" className="gap-2 border-zinc-200">
            <Edit className="h-4 w-4" />
            {t("profile.edit")}
          </Button>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Active Listings */}
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <HomeIcon className="h-6 w-6" />
              </div>
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +2.4%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500">{t("stats.active_listings")}</p>
              <h3 className="text-3xl font-bold text-zinc-900">12</h3>
            </div>
          </CardContent>
        </Card>

        {/* Total Views */}
        <Card className="border-zinc-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Eye className="h-6 w-6" />
              </div>
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                +15.8%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-zinc-500">{t("stats.total_views")}</p>
              <h3 className="text-3xl font-bold text-zinc-900">1,240</h3>
            </div>
          </CardContent>
        </Card>

        {/* Coin Balance */}
        <Card className="border-none bg-blue-600 text-white shadow-lg relative overflow-hidden">
          {/* Abstract circles decoration */}
          <div className="absolute -right-6 -bottom-12 h-40 w-40 rounded-full border-[16px] border-white/10" />
          <div className="absolute right-12 -bottom-6 h-40 w-40 rounded-full border-[16px] border-white/10" />
          
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50 border-none gap-1 h-8">
                <Plus className="h-3 w-3" />
                {t("stats.top_up")}
              </Button>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-blue-100">{t("stats.coin_balance")}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">0</h3>
                <span className="text-sm text-blue-100">{t("stats.coins")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">{t("activity.title")}</h3>
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm h-auto p-0 font-semibold">
            {t("activity.view_all")}
          </Button>
        </div>

        <Card className="border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-medium">{t("activity.columns.property")}</th>
                  <th className="px-6 py-4 font-medium">{t("activity.columns.type")}</th>
                  <th className="px-6 py-4 font-medium">{t("activity.columns.status")}</th>
                  <th className="px-6 py-4 font-medium">{t("activity.columns.views")}</th>
                  <th className="px-6 py-4 font-medium text-right">{t("activity.columns.date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {/* Row 1 */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-zinc-100">
                         <Image src="/images/placeholder-property.jpg" alt="Villa" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">Luxury Villa Hydra</p>
                        <p className="text-xs text-zinc-500">Algiers, Algeria</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                      {t("activity.types.listing")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                      {t("activity.status.active")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-zinc-900">458</p>
                    <p className="text-xs text-green-600">+12 today</p>
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-500">2 hours ago</td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                         <Coins className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">Coin Purchase</p>
                        <p className="text-xs text-zinc-500">Ref: MZ-4921-X</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                      {t("activity.types.payment")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-blue-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      {t("activity.status.completed")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-zinc-900">+100 Coins</p>
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-500">Yesterday</td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-zinc-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-zinc-100">
                         <Image src="/images/placeholder-property.jpg" alt="Studio" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">Modern Studio Oran</p>
                        <p className="text-xs text-zinc-500">Oran, City Center</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                      {t("activity.types.listing")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-orange-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                      {t("activity.status.pending")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-zinc-900">0</p>
                    <p className="text-xs text-zinc-500">Under review</p>
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-500">3 days ago</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-3 text-center text-xs text-zinc-500">
            {t("activity.footer")}
          </div>
        </Card>
      </div>
    </div>
  );
}
