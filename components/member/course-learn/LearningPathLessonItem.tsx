"use client";

import React from "react";
import { IoCheckmarkCircle, IoLockClosedOutline } from "react-icons/io5";
import { MdOutlineTimer } from "react-icons/md";

import LessonTypeIcon from "@/components/course/LessonTypeIcon";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/validations/learning/user-learning";

type LearningPathLessonItemProps = {
  lesson: Lesson;
  isActive: boolean;
  onSelectLesson?: (lesson: Lesson | null) => void;
};

export default function LearningPathLessonItem({
  lesson,
  isActive,
  onSelectLesson,
}: LearningPathLessonItemProps) {
  return (
    <button
      type="button"
      disabled={lesson.isLocked}
      onClick={() => onSelectLesson?.(lesson)}
      className={cn(
        "w-full rounded border border-greyscale-700 bg-greyscale-800 px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        isActive
          ? "border-primary/50 bg-primary/20 ring-1 ring-primary/50"
          : "hover:bg-greyscale-700/80",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <LessonTypeIcon type={lesson.type} />
          <div className="min-w-0 space-y-1">
            <p className="line-clamp-1 text-sm font-medium text-greyscale-0">
              {lesson.titleVN}
            </p>
            <div className="flex items-center gap-1 text-xs text-greyscale-50">
              <MdOutlineTimer className="text-greyscale-50" />
              <p>{lesson.duration} phút</p>
            </div>
          </div>
        </div>

        {lesson.isLocked ? (
          <IoLockClosedOutline className="mt-0.5 h-3.5 w-3.5 shrink-0 text-greyscale-600" />
        ) : lesson.isCompleted ? (
          <IoCheckmarkCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" />
        ) : null}
      </div>
    </button>
  );
}

export type { LearningPathLessonItemProps };
