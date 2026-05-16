"use client";

import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/api-config";
import { useAuth } from "@/components/providers/auth";

export type AdminReport = {
  id: number;
  member_id: number;
  reference_type: string;
  reference_id: number;
  report: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
};

type AdminReportsResponse = {
  success: boolean;
  data: AdminReport[];
};

type AdminTypedReportsResponse = {
  success: boolean;
  type: "member_reports" | "listing_reports";
  data: AdminReport[];
};

export type AdminReportsOverview = {
  all: AdminReport[];
  // members: AdminReport[];
  // listings: AdminReport[];
};

async function fetchJson<T>(
  input: string,
  init: RequestInit & { headers: Record<string, string> },
): Promise<T> {
  const response = await fetch(input, init);

  const json = (await response.json().catch(() => null)) as T | null;

  if (!response.ok) {
    const message =
      typeof (json as { message?: unknown } | null)?.message === "string"
        ? (json as { message: string }).message
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (!json) throw new Error("Invalid JSON response");
  return json;
}

export function useAdminReportsOverview() {
  const { token, isAuthenticated } = useAuth();

  return useQuery<AdminReportsOverview>({
    queryKey: ["admin-reports-overview", token],
    enabled: !!token && isAuthenticated,
    queryFn: async ({ signal }) => {
      if (!token) throw new Error("Not authenticated");

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const [all] = await Promise.all([
        fetchJson<AdminReportsResponse>(`${API_URL}/api/admin/reports`, {
          method: "GET",
          headers,
          signal,
        }),
        // fetchJson<AdminTypedReportsResponse>(
        //   `${API_URL}/api/admin/reports/members`,
        //   { method: "GET", headers, signal },
        // ),
        // fetchJson<AdminTypedReportsResponse>(
        //   `${API_URL}/api/admin/reports/listings`,
        //   { method: "GET", headers, signal },
        // ),
        
      ]);

      return {
        all: all.data ?? [],
        // members: members.data ?? [],
        // listings: listings.data ?? [],
      };
    },
  });
}
