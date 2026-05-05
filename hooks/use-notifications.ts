import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationsApi, NotificationsIndexRequest } from "@/api";
import { apiConfig } from "@/lib/api-config";
import { useAuth } from "@/components/providers/auth";
import { useMemo } from "react";

const notificationsApi = new NotificationsApi(apiConfig);

export function useNotifications(params?: NotificationsIndexRequest) {
  const { isAuthenticated, token } = useAuth();

  const stableParams = useMemo(
    () => params,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(params)]
  );

  return useQuery({
    queryKey: ["notifications", stableParams],
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!token && isAuthenticated,
    queryFn: async () => {
      const response = await notificationsApi.getNotifications(stableParams || {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error("Not authenticated");
      return notificationsApi.notificationsMarkAsRead(
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Not authenticated");
      return notificationsApi.notificationsMarkAllRead({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
