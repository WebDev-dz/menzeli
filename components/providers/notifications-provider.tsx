"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/hooks/use-notifications";
import { NotificationsIndexRequest } from "@/api";

interface NotificationsContextType {
  notificationsQuery: ReturnType<typeof useNotifications>;
  markAsReadMutation: ReturnType<typeof useMarkNotificationAsRead>;
  markAllAsReadMutation: ReturnType<typeof useMarkAllNotificationsAsRead>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(
  undefined
);

interface NotificationsProviderProps {
  children: ReactNode;
  params?: NotificationsIndexRequest;
}

export function NotificationsProvider({
  children,
  params,
}: NotificationsProviderProps) {
  const notificationsQuery = useNotifications(params);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  return (
    <NotificationsContext.Provider
      value={{
        notificationsQuery,
        markAsReadMutation,
        markAllAsReadMutation,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationsContext must be used within a NotificationsProvider"
    );
  }
  return context;
}
