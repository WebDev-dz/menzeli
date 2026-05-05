"use client";

import { useTranslation } from "react-i18next";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";

export function NotificationsDropdown() {
  const { t, i18n } = useTranslation("dashboard");
  const isRtl = i18n.language === "ar";

  const { data, isLoading } = useNotifications({ page: 1 });
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const notifications = data?.data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  return (
    <DropdownMenu dir={isRtl ? "rtl" : "ltr"}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-zinc-600" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
          )}
          <span className="sr-only">{t("notifications.title")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold text-sm">{t("notifications.title")}</h2>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : null}
              {t("notifications.mark_all_read")}
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full p-4">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-500 flex flex-col items-center justify-center gap-2">
              <Bell className="h-8 w-8 text-zinc-300" />
              <p>{t("notifications.empty_title")}</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex flex-col gap-1.5 p-4 border-b last:border-0 hover:bg-zinc-50 transition-colors cursor-pointer relative",
                    !notification.isRead && "bg-blue-50/30"
                  )}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.id.toString());
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        !notification.isRead && "font-medium text-zinc-900"
                      )}
                    >
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 line-clamp-2">
                    {notification.body}
                  </p>
                  <span className="text-[10px] text-zinc-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
