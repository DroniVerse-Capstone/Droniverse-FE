"use client";

import React from "react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { BiEdit } from "react-icons/bi";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateModule } from "@/hooks/module/useModule";
import { ApiError } from "@/types/api/common";
import { Module } from "@/validations/module/module";
import TooltipWrapper from "@/components/common/ToolTipWrapper";
import { useTranslations } from "@/providers/i18n-provider";

type UpdateModuleDialogProps = {
  courseId?: string;
  versionId?: string;
  module: Module;
};

export default function UpdateModuleDialog({
  courseId,
  versionId,
  module,
}: UpdateModuleDialogProps) {
  const t = useTranslations("CourseManagement.CourseSettings.ModuleDialog");
  const [open, setOpen] = React.useState(false);
  const [titleVN, setTitleVN] = React.useState(module.titleVN);
  const [titleEN, setTitleEN] = React.useState(module.titleEN);
  const updateModuleMutation = useUpdateModule();

  const isUpdatingModule = updateModuleMutation.isPending;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isUpdatingModule) return;

    setOpen(nextOpen);
    if (nextOpen) {
      setTitleVN(module.titleVN);
      setTitleEN(module.titleEN);
    }
  };

  const handleUpdateModule = async () => {
    if (!courseId || !versionId) {
      toast.error(t("errors.emptyId"));
      return;
    }

    const normalizedTitleVN = titleVN.trim();
    const normalizedTitleEN = titleEN.trim();

    if (!normalizedTitleVN || !normalizedTitleEN) {
      toast.error(t("errors.normalized"));
      return;
    }

    try {
      const data = await updateModuleMutation.mutateAsync({
        courseId,
        versionId,
        moduleId: module.moduleID,
        payload: {
          titleVN: normalizedTitleVN,
          titleEN: normalizedTitleEN,
          moduleNumber: module.moduleNumber,
        },
      });

      toast.success(data.message);
      setOpen(false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("errors.updateFailed"),
      );
    }
  };

  return (
    <>
      <TooltipWrapper label={t("editTitle")}>
        <Button
          variant="editIcon"
          size="icon"
          onClick={() => handleOpenChange(true)}
        >
          <BiEdit size={18} />
        </Button>
      </TooltipWrapper>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("editTitle")}</DialogTitle>
            <DialogDescription>
              {t("editSubtitle")} {module.moduleNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor={`edit-module-title-vn-${module.moduleID}`}>
                {t("fields.title.vi")}
              </Label>
              <Input
                id={`edit-module-title-vn-${module.moduleID}`}
                value={titleVN}
                onChange={(event) => setTitleVN(event.target.value)}
                placeholder={t("fields.title.placeholderVi")}
                disabled={isUpdatingModule}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`edit-module-title-en-${module.moduleID}`}>
                {t("fields.title.en")}
              </Label>
              <Input
                id={`edit-module-title-en-${module.moduleID}`}
                value={titleEN}
                onChange={(event) => setTitleEN(event.target.value)}
                placeholder={t("fields.title.placeholderEn")}
                disabled={isUpdatingModule}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isUpdatingModule}
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              onClick={() => {
                void handleUpdateModule();
              }}
              disabled={isUpdatingModule}
            >
              {isUpdatingModule ? <Spinner className="h-4 w-4" /> : null}
              {t("buttons.update")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export type { UpdateModuleDialogProps };
