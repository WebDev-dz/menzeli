"use client";

import { useTranslation } from "react-i18next";
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

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("session_expired.title")}</DialogTitle>
          <DialogDescription>{t("session_expired.description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onLogin}>{t("session_expired.action")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

