"use client";

import React, { useMemo, useState } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";

import type { AdminReport, AdminReportsOverview } from "@/hooks/admin-hooks/reports-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeletor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = UseQueryResult<AdminReportsOverview, Error>;

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function statusVariant(status: string | null | undefined) {
  const s = (status || "").toLowerCase();
  if (["resolved", "approved", "accepted", "done"].includes(s)) return "default";
  if (["rejected", "blocked", "banned", "deleted"].includes(s)) return "destructive";
  if (["pending", "open", "new", "in_review", "review"].includes(s)) return "secondary";
  return "outline";
}

function matchesSearch(report: AdminReport, q: string) {
  if (!q) return true;
  const haystack = [
    report.id,
    report.member_id,
    report.reference_type,
    report.reference_id,
    report.report,
    report.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function ReportsGrid({ rows }: { rows: AdminReport[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead className="w-[120px]">Member</TableHead>
            <TableHead className="w-[160px]">Reference</TableHead>
            <TableHead className="w-[120px]">Ref ID</TableHead>
            <TableHead>Report</TableHead>
            <TableHead className="w-[140px]">Status</TableHead>
            <TableHead className="w-[200px]">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={`${r.reference_type}-${r.id}`}>
              <TableCell className="font-medium">{r.id}</TableCell>
              <TableCell>{r.member_id}</TableCell>
              <TableCell>{r.reference_type}</TableCell>
              <TableCell>{r.reference_id}</TableCell>
              <TableCell className="max-w-[560px] whitespace-normal break-words">
                {r.report}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateTime(r.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ReportsGridSkeleton() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">ID</TableHead>
            <TableHead className="w-30">Member</TableHead>
            <TableHead className="w-40">Reference</TableHead>
            <TableHead className="w-30">Ref ID</TableHead>
            <TableHead>Report</TableHead>
            <TableHead className="w-35">Status</TableHead>
            <TableHead className="w-50">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 7 }).map((_, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <Skeleton className="h-4 w-10" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-14" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-14" />
              </TableCell>
              <TableCell className="max-w-[560px] whitespace-normal">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const ReportsTable = ({ isLoading, isFetching, data, error, refetch }: Props) => {
  const [tab, setTab] = useState<"all" | "members" | "listings">("all");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const rows = useMemo(() => {
    const base = data?.all || [];

    if (!q) return base;
    return base.filter((r) => matchesSearch(r, q));
  }, [data?.all, q, tab]);

  const counts = useMemo(
    () => ({
      all: data?.all?.length ?? 0,
     
    }),
    [data?.all?.length],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="text-lg font-semibold">Reports</div>
          <div className="text-sm text-muted-foreground">
            {`${rows.length} / ${counts.all} shown`}
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports..."
            className="h-9 w-full sm:w-[320px]"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="gap-2"
          >
            <RefreshCcw className={isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Failed to load reports</div>
          <div className="mt-1 text-sm text-muted-foreground">{error.message}</div>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        </div>
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            {/* <TabsTrigger value="members">Members ({counts.members})</TabsTrigger> */}
            {/* <TabsTrigger value="listings">Listings ({counts.listings})</TabsTrigger> */}
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <ReportsGridSkeleton />
            ) : rows.length ? (
              <ReportsGrid rows={rows} />
            ) : (
              <div className="rounded-lg border p-6 text-sm text-muted-foreground">
                No reports found.
              </div>
            )}
          </TabsContent>

          <TabsContent value="members">
            {isLoading ? (
              <ReportsGridSkeleton />
            ) : rows.length ? (
              <ReportsGrid rows={rows} />
            ) : (
              <div className="rounded-lg border p-6 text-sm text-muted-foreground">
                No member reports found.
              </div>
            )}
          </TabsContent>

          <TabsContent value="listings">
            {isLoading ? (
              <ReportsGridSkeleton />
            ) : rows.length ? (
              <ReportsGrid rows={rows} />
            ) : (
              <div className="rounded-lg border p-6 text-sm text-muted-foreground">
                No listing reports found.
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ReportsTable;
