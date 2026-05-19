"use client";

import { useCreateMemberListing } from "@/hooks/use-member-listings";
import { useAuth } from "@/components/providers/auth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  PropertyFormBase,
  createPropertyDefaultValues,
  type PropertyFormLocale,
} from "./update-property-form";
import type { PropertyFormValues } from "@/lib/property-schema";

type Props = {
  locale: PropertyFormLocale;
};

export function NewPropertyForm({ locale }: Props) {
  const { t } = useTranslation("property-form");
  const { token } = useAuth();
  const { mutateAsync: createListing, status: createStatus } =
    useCreateMemberListing();

  return (
    <PropertyFormBase
      locale={locale}
      mode="create"
      defaultValues={createPropertyDefaultValues as PropertyFormValues}
      isSuccess={createStatus === "success"}
      onSubmit={async (data) => {
        if (!token) {
          toast.error(t("error_login"));
          return;
        }
        await createListing(data);
        toast.success(t("success_create"));
      }}
    />
  );
}

export const PropertyForm = NewPropertyForm;
