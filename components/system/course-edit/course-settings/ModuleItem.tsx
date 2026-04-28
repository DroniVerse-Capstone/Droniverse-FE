"use client";

import React from "react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";
import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import CreateLessonDialog from "@/components/system/course-edit/course-settings/CreateLessonDialog";
import ModuleLessons from "@/components/system/course-edit/course-settings/ModuleLessons";
import { Button } from "@/components/ui/button";
import { useGetLessons } from "@/hooks/lesson/useLesson";
import UpdateModuleDialog from "@/components/system/course-edit/course-settings/UpdateModuleDialog";
import { Module } from "@/validations/module/module";
import TooltipWrapper from "@/components/common/ToolTipWrapper";
import { useLocale, useTranslations } from "@/providers/i18n-provider";

type ModuleItemProps = {
  courseId?: string;
  droneId?: string;
  versionId?: string;
  module: Module;
  isDeletingModule: boolean;
  canManageModules: boolean;
  onDelete: (module: Module) => Promise<void>;
};

export default function ModuleItem({
  courseId,
  droneId,
  versionId,
  module,
  isDeletingModule,
  canManageModules,
  onDelete,
}: ModuleItemProps) {
  const t = useTranslations("CourseManagement.CourseSettings.ModuleItem");
  const locale = useLocale();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const lessonsQuery = useGetLessons({
    moduleId: isExpanded ? module.moduleID : undefined,
  });

  const lessons = lessonsQuery.data || [];

  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="rounded border border-greyscale-700 bg-greyscale-900">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <button
          type="button"
          onClick={handleToggleExpand}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          {isExpanded ? (
            <MdExpandLess className="shrink-0 text-greyscale-200" size={20} />
          ) : (
            <MdExpandMore className="shrink-0 text-greyscale-200" size={20} />
          )}

          <div className="min-w-0">
            <p className="text-xs text-greyscale-300">
              {t("module")} {module.moduleNumber}
            </p>
            <p className="text-sm font-medium text-greyscale-0">
              {locale === "vi" ? module.titleVN : module.titleEN}
            </p>
            <p className="text-xs text-greyscale-200">
              {locale === "vi" ? module.titleEN : module.titleVN}
            </p>
          </div>
        </button>

        {canManageModules ? (
          <div
            className="flex shrink-0 items-center gap-2"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <UpdateModuleDialog
              courseId={courseId}
              versionId={versionId}
              module={module}
            />

            <ConfirmActionPopover
              trigger={
                <TooltipWrapper label={t("delete.title")}>
                  <Button variant="deleteIcon" size="icon">
                    <MdDeleteOutline size={18} />
                    </Button>
                </TooltipWrapper>
              }
              title={t("delete.title")}
              description={`${t("delete.description")} ${module.moduleNumber}?`}
              confirmText={t("delete.confirmText")}
              cancelText={t("delete.cancelText")}
              isLoading={isDeletingModule}
              onConfirm={() => {
                void onDelete(module);
              }}
            />
          </div>
        ) : null}
      </div>

      {isExpanded ? (
        <div className="border-t border-greyscale-700 px-3 py-2">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-base font-medium text-greyscale-0">
              {t("list")}
            </p>
            {canManageModules ? (
                <CreateLessonDialog
                  moduleId={module.moduleID}
                  droneId={droneId}
                  lessons={lessons}
                />
            ) : null}
          </div>

          <ModuleLessons
            lessons={lessons}
            isLoading={lessonsQuery.isLoading}
            isError={lessonsQuery.isError}
            error={lessonsQuery.error}
            canManageLessons={canManageModules}
          />
        </div>
      ) : null}
    </div>
  );
}

export type { ModuleItemProps };
