"use client";

import React from "react";
import {
  IoCheckmarkCircle,
  IoChevronDownOutline,
  IoLockClosedOutline,
} from "react-icons/io5";

import LearningPathLessonItem from "@/components/member/course-learn/LearningPathLessonItem";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Lesson, Module } from "@/validations/learning/user-learning";

type LearningPathModuleItemProps = {
  module: Module;
  isExpanded: boolean;
  selectedLessonId?: string | null;
  onToggle: (moduleId: string) => void;
  onSelectLesson?: (lesson: Lesson | null) => void;
};

export default function LearningPathModuleItem({
  module,
  isExpanded,
  selectedLessonId,
  onToggle,
  onSelectLesson,
}: LearningPathModuleItemProps) {
  return (
    <div className="overflow-hidden rounded border border-greyscale-700 bg-greyscale-900">
      <button
        type="button"
        disabled={module.isLocked}
        onClick={() => onToggle(module.moduleID)}
        className="w-full px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 hover:bg-greyscale-800/80"
      >
        <div className="flex w-full items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 line-clamp-2 text-base font-medium text-greyscale-0">
              {module.titleVN}
              {module.isCompleted ? (
                <IoCheckmarkCircle className="h-4 w-4 shrink-0 text-green-400" />
              ) : null}
            </p>
            <p className="mt-1 text-xs text-greyscale-100">
              {module.totalLessons} bài • {module.duration} phút
            </p>
          </div>

          {module.isLocked ? (
            <IoLockClosedOutline className="h-4 w-4 shrink-0 text-greyscale-500" />
          ) : null}

          {!module.isLocked ? (
            <IoChevronDownOutline
              className={cn(
                "h-4 w-4 shrink-0 text-greyscale-200 transition-transform",
                isExpanded ? "rotate-180" : "",
              )}
            />
          ) : null}
        </div>

        {!module.isLocked ? (
          <Progress value={module.progress} className="mt-1 h-1.5" />
        ) : null}
      </button>

      {isExpanded && !module.isLocked ? (
        <div className="space-y-2 border-t border-greyscale-700 px-3 py-2">
          {module.lessons.map((lesson) => (
            <LearningPathLessonItem
              key={lesson.lessonID}
              lesson={lesson}
              isActive={selectedLessonId === lesson.lessonID}
              onSelectLesson={onSelectLesson}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export type { LearningPathModuleItemProps };
