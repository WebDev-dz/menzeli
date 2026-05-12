"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useReportListing } from "@/hooks/use-listings";
import { toast } from "sonner";

type ReportModalProps = {
  listingId?: number;
  children?: React.ReactNode;
  onReported?: () => void;
};

export function ReportModal({ listingId, children, onReported }: ReportModalProps) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const reportListing = useReportListing();

  const handleSubmit = async () => {
    const report = reason.trim();
    if (!listingId) return;
    if (!report) {
      toast.error(t("report_modal.error_empty"));
      return;
    }

    try {
      await reportListing.mutateAsync({ listing: listingId, report });
      toast.success(t("report_modal.success"));
      setReason("");
      setOpen(false);
      onReported?.();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : t("report_modal.error_generic"),
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setReason("");
      }}
    >
      <DialogTrigger disabled = {!listingId} asChild>
        {children || (
          <Button variant="destructive" size="sm" className="gap-2">
            <Flag className="h-4 w-4" />
            {t("report_modal.trigger")}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("report_modal.title")}</DialogTitle>
          <DialogDescription>{t("report_modal.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="report-reason" className="text-sm font-medium">
            {t("report_modal.reason_label")}
          </label>
          <Textarea
            id="report-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("report_modal.reason_placeholder")}
            rows={5}
            disabled={reportListing.isPending}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={reportListing.isPending}
          >
            {t("report_modal.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={reportListing.isPending || reason.trim().length === 0}
          >
            {reportListing.isPending
              ? t("report_modal.submitting")
              : t("report_modal.submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
