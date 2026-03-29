"use client";

import React from "react";
import { MdDeleteOutline } from "react-icons/md";

import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-greyscale-700 bg-greyscale-900 px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs text-greyscale-300">Chương {module.moduleNumber}</p>
        <p className="text-sm font-medium text-greyscale-0">{module.titleVN}</p>
        <p className="text-xs text-greyscale-200">{module.titleEN}</p>
      </div>

      {canManageModules ? (
        <div className="flex shrink-0 items-center gap-1">
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
  );
}

export type { ModuleItemProps };
