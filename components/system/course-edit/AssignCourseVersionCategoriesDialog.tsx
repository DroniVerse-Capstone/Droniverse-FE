"use client";

import { AxiosError } from "axios";
import React from "react";
import toast from "react-hot-toast";

import CategoryDropdown from "@/components/common/CategoryDropdown";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useAssignCourseVersionCategories } from "@/hooks/course-version/useCourseVersion";
import { ApiError } from "@/types/api/common";
import { useTranslations } from "@/providers/i18n-provider";

type AssignCourseVersionCategoriesDialogProps = {
  courseId: string;
  versionId: string;
  defaultCategoryIDs: string[];
  disabled?: boolean;
};

export default function AssignCourseVersionCategoriesDialog({
  courseId,
  versionId,
  defaultCategoryIDs,
  disabled = false,
}: AssignCourseVersionCategoriesDialogProps) {
  const t = useTranslations("CourseManagement.AssignCourseVersionDialog.category");
  const assignCategoriesMutation = useAssignCourseVersionCategories();
  const [open, setOpen] = React.useState(false);
  const [selectedCategoryIDs, setSelectedCategoryIDs] = React.useState<string[]>(
    defaultCategoryIDs
  );

  const isSubmitting = assignCategoriesMutation.isPending;

  React.useEffect(() => {
    if (open) {
      setSelectedCategoryIDs(defaultCategoryIDs);
    }
  }, [defaultCategoryIDs, open]);

  const handleAssignCategories = async () => {
    try {
      await assignCategoriesMutation.mutateAsync({
        courseId,
        versionId,
        payload: { categoryIDs: selectedCategoryIDs },
      });

      toast.success(t("toast.success"));
      setOpen(false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("toast.error")
      );
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="deleteIcon"
        size="sm"
        disabled={disabled || isSubmitting}
        onClick={() => setOpen(true)}
      >
        {t("title")}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (isSubmitting) return;
          setOpen(nextOpen);
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>
              {t("description")}
            </DialogDescription>
          </DialogHeader>

          <CategoryDropdown
            value={selectedCategoryIDs}
            onChange={setSelectedCategoryIDs}
            placeholder={t("selectPlaceholder")}
            disabled={isSubmitting}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setOpen(false)}
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              type="button"
              disabled={isSubmitting || selectedCategoryIDs.length === 0}
              onClick={() => void handleAssignCategories()}
            >
              {isSubmitting ? <Spinner className="h-4 w-4" /> : null}
              {t("buttons.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export type { AssignCourseVersionCategoriesDialogProps };
