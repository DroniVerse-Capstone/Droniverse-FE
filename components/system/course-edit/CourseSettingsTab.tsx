"use client";

import React from "react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

import { Spinner } from "@/components/ui/spinner";
import EmptyState from "@/components/common/EmptyState";
import ModuleDialog from "@/components/system/course-edit/course-settings/ModuleDialog";
import ModuleItem from "@/components/system/course-edit/course-settings/ModuleItem";
import { useDeleteModule, useGetModules } from "@/hooks/module/useModule";
import { ApiError } from "@/types/api/common";
import { Module } from "@/validations/module/module";
import { useTranslations } from "@/providers/i18n-provider";

type CourseSettingsTabProps = {
  courseId?: string;
  droneId?: string;
  versionId?: string;
  versionStatus?: string;
};

export default function CourseSettingsTab({
  courseId,
  droneId,
  versionId,
  versionStatus,
}: CourseSettingsTabProps) {
  const modulesQuery = useGetModules({ courseId, versionId });
  const deleteModuleMutation = useDeleteModule();
  const t = useTranslations("CourseManagement.CourseSettings");
  const modules = modulesQuery.data || [];
  const canManageModules = versionStatus === "DRAFT";

  const isDeletingModule = deleteModuleMutation.isPending;

  const handleDeleteModule = async (module: Module) => {
    if (!courseId || !versionId) {
      toast.error("Thiếu dữ liệu để xóa chương.");
      return;
    }

    try {
      const data = await deleteModuleMutation.mutateAsync({
        courseId,
        versionId,
        moduleId: module.moduleID,
      });

      toast.success(data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Không thể xóa chương.",
      );
    }
  };

  if (!courseId || !versionId) {
    return (
      <div className="rounded border border-greyscale-700 bg-greyscale-850 p-4">
        <h2 className="mb-2 text-base font-semibold text-greyscale-0">
          {t("title")}
        </h2>
        <p className="text-sm text-greyscale-100">
          {t("error.emptyId")}
        </p>
      </div>
    );
  }

  if (modulesQuery.isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded border border-greyscale-700 bg-greyscale-850 p-4">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (modulesQuery.isError) {
    return (
      <div className="rounded border border-greyscale-700 bg-greyscale-850 p-4">
        <p className="text-sm text-warning">
          {modulesQuery.error.response?.data?.message ||
            modulesQuery.error.message ||
            t("error.cantLoad")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-greyscale-0">
          {t("title")}
        </h2>

        {canManageModules ? (
          <ModuleDialog
            courseId={courseId}
            versionId={versionId}
            modules={modules}
          />
        ) : null}
      </div>

      {modules.length === 0 ? (
        <EmptyState title={t("error.empty")} />
      ) : (
        <div className="space-y-2">
          {modules.map((module) => (
            <ModuleItem
              key={module.moduleID}
              courseId={courseId}
              droneId={droneId}
              versionId={versionId}
              module={module}
              isDeletingModule={isDeletingModule}
              canManageModules={canManageModules}
              onDelete={handleDeleteModule}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export type { CourseSettingsTabProps };
