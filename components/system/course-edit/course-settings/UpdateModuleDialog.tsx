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
      toast.error("Thiếu dữ liệu để cập nhật chương.");
      return;
    }

    const normalizedTitleVN = titleVN.trim();
    const normalizedTitleEN = titleEN.trim();

    if (!normalizedTitleVN || !normalizedTitleEN) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
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
          "Không thể cập nhật chương."
      );
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleOpenChange(true)}
      >
        <BiEdit size={18} />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chương</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho chương {module.moduleNumber}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor={`edit-module-title-vn-${module.moduleID}`}>
                Tiêu đề tiếng Việt
              </Label>
              <Input
                id={`edit-module-title-vn-${module.moduleID}`}
                value={titleVN}
                onChange={(event) => setTitleVN(event.target.value)}
                placeholder="Nhập tiêu đề tiếng Việt"
                disabled={isUpdatingModule}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`edit-module-title-en-${module.moduleID}`}>
                Tiêu đề tiếng Anh
              </Label>
              <Input
                id={`edit-module-title-en-${module.moduleID}`}
                value={titleEN}
                onChange={(event) => setTitleEN(event.target.value)}
                placeholder="Enter English title"
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
              Hủy
            </Button>
            <Button
              onClick={() => {
                void handleUpdateModule();
              }}
              disabled={isUpdatingModule}
            >
              {isUpdatingModule ? <Spinner className="h-4 w-4" /> : null}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export type { UpdateModuleDialogProps };
