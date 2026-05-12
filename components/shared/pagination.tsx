"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { PaginateMyListingPagination } from "@/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props   {
  currentPage: number | string;
  totalPages: number | string;
  total: number | string;
  from: number | string;
  to: number | string;
  hasPages: boolean | string;
  hasMorePages: boolean | string;
};

const toNumber = (value: number | string | undefined, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isTruthy = (value: string | undefined | boolean) =>
  value === "true"  || value === true;

const Pagination = (props: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = useMemo(() => toNumber(props.currentPage), [props.currentPage]);
  const totalPages = useMemo(() => toNumber(props.totalPages), [props.totalPages]);
  const total = useMemo(() => toNumber(props.total), [props.total]);
  const from = useMemo(() => toNumber(props.from), [props.from]);
  const to = useMemo(() => toNumber(props.to), [props.to]);
  const hasPages = useMemo(() => isTruthy(props.hasPages) && toNumber(totalPages) > 1, [props.hasPages, totalPages]);
  const hasPrevPage = useMemo(() => currentPage > 1, [currentPage]);
  const hasNextPage = useMemo(() => isTruthy(props.hasMorePages) && currentPage < toNumber(totalPages), [props.hasMorePages, currentPage, totalPages]);


  console.log({ props })
  const pages = useMemo<(number | "ellipsis")[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ];
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("page", String(page));
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  // if (!hasPages) {
  //   return null;
  // }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-zinc-900">{from}</span> to{" "}
        <span className="font-medium text-zinc-900">{to}</span> of{" "}
        <span className="font-medium text-zinc-900">{total}</span> results
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => goToPage(currentPage - 1)}
          disabled={!hasPrevPage}
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          Previous
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="flex h-9 w-9 items-center justify-center text-zinc-400"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <Button
                key={page}
                type="button"
                size="sm"
                variant={page === currentPage ? "default" : "outline"}
                className={cn(
                  "h-9 min-w-9 px-3",
                  page === currentPage && "pointer-events-none",
                )}
                onClick={() => goToPage(page)}
              >
                {page}
              </Button>
            ),
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => goToPage(currentPage + 1)}
          disabled={!hasNextPage}
        >
          Next
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
