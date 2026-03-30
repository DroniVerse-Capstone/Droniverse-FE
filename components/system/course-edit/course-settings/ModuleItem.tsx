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

type ModuleItemProps = {
  courseId?: string;
  versionId?: string;
  module: Module;
  isDeletingModule: boolean;
  canManageModules: boolean;
  onDelete: (module: Module) => Promise<void>;
};

export default function ModuleItem({
  courseId,
  versionId,
  module,
  isDeletingModule,
  canManageModules,
  onDelete,
}: ModuleItemProps) {
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
              Chương {module.moduleNumber}
            </p>
            <p className="text-sm font-medium text-greyscale-0">
              {module.titleVN}
            </p>
            <p className="text-xs text-greyscale-200">{module.titleEN}</p>
          </div>
        </button>

        {canManageModules ? (
          <div
            className="flex shrink-0 items-center gap-1"
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
                <Button variant="outline" size="icon">
                  <MdDeleteOutline size={18} />
                </Button>
              }
              title="Xóa chương"
              description={`Bạn có chắc muốn xóa Chương ${module.moduleNumber}?`}
              confirmText="Xóa"
              cancelText="Hủy"
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
              Danh sách bài học
            </p>
            {canManageModules ? (
                <CreateLessonDialog
                  moduleId={module.moduleID}
                  lessons={lessons}
                />
            ) : null}
          </div>

          <ModuleLessons
            lessons={lessons}
            isLoading={lessonsQuery.isLoading}
            isError={lessonsQuery.isError}
            error={lessonsQuery.error}
          />
        </div>
      ) : null}
    </div>
  );
}

export type { ModuleItemProps };
