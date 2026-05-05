"use client";

import React from "react";
import {
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/hooks/use-notifications";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Bell, Check, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotificationsContext } from '@/components/providers/notifications-provider';

const NotificationsPage = () => {
  const { t } = useTranslation("dashboard");
  const { notificationsQuery :{data, isLoading}, markAsReadMutation, markAllAsReadMutation } = useNotificationsContext();

  const notifications = data?.data?.notifications || [];
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {t("notifications.title")}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("notifications.subtitle")}
          </p>
        </div>
        {hasUnread && (
          <Button
            variant="outline"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="gap-2"
          >
            {markAllAsReadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {t("notifications.mark_all_read")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="flex h-64 flex-col items-center justify-center border-dashed">
          <CardContent className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
              <Bell className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("notifications.empty_title")}
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t("notifications.empty_subtitle")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.isRead
                  ? "border-blue-100 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-900/10"
                  : "bg-white dark:bg-zinc-950"
              }`}
            >
              <CardContent className="flex items-start gap-4 p-5">
                <div
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    !notification.isRead
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  <BellRing className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`font-medium ${
                        !notification.isRead
                          ? "text-zinc-900 dark:text-zinc-50"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <Badge variant="default" className="bg-blue-600 shrink-0">
                        {t("notifications.new")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {notification.body}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => markAsReadMutation.mutate(notification.id.toString())}
                    disabled={markAsReadMutation.isPending}
                  >
                    {t("notifications.mark_read")}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
