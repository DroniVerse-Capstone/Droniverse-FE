"use client";

import React from "react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { MdOutlineAddCircleOutline } from "react-icons/md";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useCreateModule } from "@/hooks/module/useModule";
import { ApiError } from "@/types/api/common";
import { Module } from "@/validations/module/module";

type ModuleDialogProps = {
  courseId?: string;
  versionId?: string;
  modules: Module[];
};

export default function ModuleDialog({
  courseId,
  versionId,
  modules,
}: ModuleDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [titleVN, setTitleVN] = React.useState("");
  const [titleEN, setTitleEN] = React.useState("");
  const createModuleMutation = useCreateModule();

  const isSubmitting = createModuleMutation.isPending;
  const nextModuleNumber =
    modules.length > 0
      ? Math.max(...modules.map((module) => module.moduleNumber)) + 1
      : 1;

  const resetForm = () => {
    setTitleVN("");
    setTitleEN("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;

    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSubmit = async () => {
    const normalizedTitleVN = titleVN.trim();
    const normalizedTitleEN = titleEN.trim();

    if (!courseId || !versionId) {
      toast.error("Vui lòng chọn course version trước khi thêm chương.");
      return;
    }

    if (!normalizedTitleVN || !normalizedTitleEN) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      await createModuleMutation.mutateAsync({
        courseId,
        versionId,
        payload: {
          titleVN: normalizedTitleVN,
          titleEN: normalizedTitleEN,
          moduleNumber: nextModuleNumber,
        },
      });

      toast.success("Thêm chương mới thành công.");
      setOpen(false);
      resetForm();
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Không thể thêm chương."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button icon={<MdOutlineAddCircleOutline size={20} />}>Thêm chương</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm chương mới</DialogTitle>
          <DialogDescription>
            Số chương sẽ được tự động gán là {nextModuleNumber}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="module-title-vn">Tiêu đề tiếng Việt</Label>
            <Input
              id="module-title-vn"
              value={titleVN}
              onChange={(event) => setTitleVN(event.target.value)}
              placeholder="Nhập tiêu đề tiếng Việt"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="module-title-en">Tiêu đề tiếng Anh</Label>
            <Input
              id="module-title-en"
              value={titleEN}
              onChange={(event) => setTitleEN(event.target.value)}
              placeholder="Enter English title"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Hủy
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4" /> : null}
            Tạo chương
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { ModuleDialogProps };
