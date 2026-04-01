"use client";

import { AxiosError } from "axios";
import React from "react";
import toast from "react-hot-toast";

import CommonDropdown, { CommonDropdownOption } from "@/components/common/CommonDropdown";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  useDuplicateCourseVersion,
  useGetCourseVersions,
} from "@/hooks/course-version/useCourseVersion";
import { useLocale, useTranslations } from "@/providers/i18n-provider";

type DuplicateCourseVersionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  selectedVersionId?: string;
  onDuplicated?: (versionId: string) => void;
};

const PAGE_SIZE = 50;

export default function DuplicateCourseVersionDialog({
  open,
  onOpenChange,
  courseId,
  selectedVersionId,
  onDuplicated,
}: DuplicateCourseVersionDialogProps) {
  const locale = useLocale();
  const [sourceVersionId, setSourceVersionId] = React.useState<string>();
  const t = useTranslations("CourseManagement.DuplicateCourseVersionDialog");
  const duplicateMutation = useDuplicateCourseVersion();
  const isSubmitting = duplicateMutation.isPending;

  const { data, isLoading, isError, error } = useGetCourseVersions({
    courseId,
    pageIndex: 1,
    pageSize: PAGE_SIZE,
  });

  React.useEffect(() => {
    if (!open) {
      setSourceVersionId(undefined);
      return;
    }

    if (selectedVersionId) {
      setSourceVersionId(selectedVersionId);
    }
  }, [open, selectedVersionId]);

  const options = React.useMemo<CommonDropdownOption[]>(() => {
    const versions = data?.data ?? [];

    return [...versions]
      .sort((left, right) => right.version - left.version)
      .map((version) => ({
        value: version.courseVersionID,
        label:
          locale === "en"
            ? `v${version.version} - ${version.titleEN || version.titleVN}`
            : `v${version.version} - ${version.titleVN || version.titleEN}`,
        leadingDotClassName: version.status === "ACTIVE" ? "bg-success" : undefined,
      }));
  }, [data?.data, locale]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  };

  const handleDuplicate = async () => {
    if (!sourceVersionId) {
      toast.error(t("error.empty"));
      return;
    }

    try {
      const response = await duplicateMutation.mutateAsync({
        courseId,
        versionId: sourceVersionId,
      });

      toast.success(response.message);
      onDuplicated?.(response.data.courseVersionID);
      onOpenChange(false);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
        t("error.duplicateFailed")
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label>{t("field.sourceVersion")}</Label>
          <CommonDropdown
            value={sourceVersionId}
            onChange={setSourceVersionId}
            options={options}
            placeholder={t("field.sourceVersionPlaceholder")}
            disabled={isSubmitting || !courseId}
            isLoading={isLoading}
            errorMessage={
              isError
                ? error.response?.data?.message || error.message || t("error.loadingVersions")
                : undefined
            }
            emptyMessage={t("field.emptyMessage")}
          />
        </div>

        <DialogFooter className="gap-3 sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              {t("buttons.cancel")}
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleDuplicate}
            disabled={isSubmitting || !sourceVersionId}
          >
            {isSubmitting ? <Spinner /> : t("buttons.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { DuplicateCourseVersionDialogProps };