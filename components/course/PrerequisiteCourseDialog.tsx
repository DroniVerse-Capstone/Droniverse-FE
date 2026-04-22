"use client";

import React from "react";

import PrerequisiteCourseSelectItem from "@/components/course/PrerequisiteCourseSelectItem";
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
import { Course } from "@/validations/course/course";

type PrerequisiteCourseDialogProps = {
  locale: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (value: string) => void;
  courses: Course[];
  selectedIds: string[];
  isLoading: boolean;
  isSaving: boolean;
  onToggle: (courseId: string) => void;
  onSave: () => void;
};

export default function PrerequisiteCourseDialog({
  locale,
  open,
  onOpenChange,
  search,
  onSearchChange,
  courses,
  selectedIds,
  isLoading,
  isSaving,
  onToggle,
  onSave,
}: PrerequisiteCourseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>
            {locale === "en" ? "Configure Prerequisite Courses" : "Thiết lập khóa học tiên quyết"}
          </DialogTitle>
          <DialogDescription>
            {locale === "en"
              ? "Select prerequisite courses filtered by the same required drone."
              : "Chọn các khóa học tiên quyết đã được lọc theo cùng drone yêu cầu."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={locale === "en" ? "Search course by title..." : "Tìm khóa học theo tên..."}
            disabled={isSaving}
          />

          <div className="max-h-96 space-y-2 overflow-y-auto rounded border border-greyscale-700 p-2">
            {isLoading ? (
              <p className="px-2 py-3 text-sm text-greyscale-100">
                {locale === "en" ? "Loading courses..." : "Đang tải danh sách khóa học..."}
              </p>
            ) : courses.length === 0 ? (
              <p className="px-2 py-3 text-sm text-greyscale-100">
                {locale === "en" ? "No courses found for this drone." : "Không có khóa học phù hợp với drone này."}
              </p>
            ) : (
              courses.map((item) => {
                const itemTitle = locale === "en"
                  ? item.currentVersion?.titleEN || item.currentVersion?.titleVN || item.courseID
                  : item.currentVersion?.titleVN || item.currentVersion?.titleEN || item.courseID;
                const isSelected = selectedIds.includes(item.courseID);

                return (
                  <PrerequisiteCourseSelectItem
                    key={item.courseID}
                    course={item}
                    title={itemTitle}
                    selected={isSelected}
                    disabled={isSaving}
                    onToggle={onToggle}
                  />
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            {locale === "en" ? "Cancel" : "Hủy"}
          </Button>
          <Button
            type="button"
            disabled={isSaving}
            onClick={onSave}
          >
            {isSaving
              ? locale === "en"
                ? "Saving..."
                : "Đang lưu..."
              : locale === "en"
                ? "Save prerequisites"
                : "Lưu điều kiện tiên quyết"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
