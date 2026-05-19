"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function SessionExpiredModal({
  open,
  onLogin,
}: {
  open: boolean;
  onLogin: () => void;
}) {
  const { t } = useTranslation("common");
  const [internalOpen, setInternalOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setInternalOpen(true);
  }, [open]);

  useEffect(() => {
    if (!internalOpen) return;

    const timeoutId = window.setTimeout(() => {
      setInternalOpen(false);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [internalOpen]);

  return (
    <Dialog open={internalOpen} onOpenChange={setInternalOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("session_expired.title")}</DialogTitle>
          <DialogDescription>{t("session_expired.description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => {
              setInternalOpen(false);
              onLogin();
            }}
          >
            {t("session_expired.action")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
