"use client";

import { AxiosError } from "axios";
import React from "react";
import toast from "react-hot-toast";

import DroneDropdown from "@/components/common/DroneDropdown";
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
import { useAssignCourseVersionRequiredDrones } from "@/hooks/course-version/useCourseVersion";
import { ApiError } from "@/types/api/common";
import { useTranslations } from "@/providers/i18n-provider";

type AssignCourseVersionRequiredDronesDialogProps = {
  courseId: string;
  versionId: string;
  defaultDroneIDs: string[];
  disabled?: boolean;
};

export default function AssignCourseVersionRequiredDronesDialog({
  courseId,
  versionId,
  defaultDroneIDs,
  disabled = false,
}: AssignCourseVersionRequiredDronesDialogProps) {
  const t = useTranslations("CourseManagement.AssignCourseVersionDialog.drone");
  const assignRequiredDronesMutation = useAssignCourseVersionRequiredDrones();
  const [open, setOpen] = React.useState(false);
  const [selectedDroneIDs, setSelectedDroneIDs] = React.useState<string[]>(
    defaultDroneIDs
  );

  const isSubmitting = assignRequiredDronesMutation.isPending;

  React.useEffect(() => {
    if (open) {
      setSelectedDroneIDs(defaultDroneIDs);
    }
  }, [defaultDroneIDs, open]);

  const handleAssignRequiredDrones = async () => {
    try {
      await assignRequiredDronesMutation.mutateAsync({
        courseId,
        versionId,
        payload: { droneIDs: selectedDroneIDs },
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
        variant="viewIcon"
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

          <DroneDropdown
            value={selectedDroneIDs}
            onChange={setSelectedDroneIDs}
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
              disabled={isSubmitting || selectedDroneIDs.length === 0}
              onClick={() => void handleAssignRequiredDrones()}
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

export type { AssignCourseVersionRequiredDronesDialogProps };
