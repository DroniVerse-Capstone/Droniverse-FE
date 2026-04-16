"use client";

import React from "react";
import { useParams } from "next/navigation";
import { IoChevronForwardOutline, IoTimeOutline } from "react-icons/io5";

import EmptyState from "@/components/common/EmptyState";
import LearningPathModuleItem from "@/components/member/course-learn/LearningPathModuleItem";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { useGetUserLearningPath } from "@/hooks/learning/useUserLearning";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/validations/learning/user-learning";
import { MdOutlinePlayLesson } from "react-icons/md";
import { PiPathBold } from "react-icons/pi";

type LearningPathSideBarProps = {
  selectedLessonId?: string | null;
  onSelectLesson?: (lesson: Lesson) => void;
};

export default function LearningPathSideBar({
  selectedLessonId,
  onSelectLesson,
}: LearningPathSideBarProps) {
  const params = useParams<{ enrollmentId?: string }>();
  const enrollmentId = params?.enrollmentId;

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetUserLearningPath(enrollmentId);

  const [isOpen, setIsOpen] = React.useState(true);
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(
    new Set(),
  );

  React.useEffect(() => {
    if (!data?.modules.length) return;

    setExpandedModules((prev) => {
      if (prev.size > 0) return prev;

      const initial = data.modules.find((module) => !module.isLocked);
      return new Set(initial ? [initial.moduleID] : []);
    });
  }, [data]);

  React.useEffect(() => {
    if (!data || !onSelectLesson) return;

    // Priority 1: Match from URL/selectedLessonId
    if (selectedLessonId) {
      for (const module of data.modules) {
        const lesson = module.lessons.find((l) => l.lessonID === selectedLessonId);
        if (lesson) {
          // Trigger selection if not already selected (this initializes parent state if from URL)
          onSelectLesson(lesson);

          // Ensure module is expanded
          setExpandedModules((prev) => {
            if (prev.has(module.moduleID)) return prev;
            const next = new Set(prev);
            next.add(module.moduleID);
            return next;
          });
          return;
        }
      }
    }

    // Priority 2: Auto-select first unlocked lesson IF no selection is active
    if (!selectedLessonId) {
      for (const module of data.modules) {
        const firstUnlocked = module.lessons.find((lesson) => !lesson.isLocked);
        if (firstUnlocked) {
          onSelectLesson(firstUnlocked);
          return;
        }
      }
    }
  }, [data, onSelectLesson, selectedLessonId]);

  const { completedLessons, totalLessonItems } = React.useMemo(() => {
    if (!data) return { completedLessons: 0, totalLessonItems: 0 };

    let completed = 0;
    let total = 0;
    data.modules.forEach((module) => {
      module.lessons.forEach((lesson) => {
        total += 1;
        if (lesson.isCompleted) completed += 1;
      });
    });

    return { completedLessons: completed, totalLessonItems: total };
  }, [data]);

  const progressValue = Math.min(100, Math.max(0, data?.progress ?? 0));

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "relative border-r border-greyscale-700 bg-greyscale-900 transition-all duration-300",
        isOpen ? "w-full md:w-90" : "w-full md:w-15",
      )}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-greyscale-700 bg-greyscale-900 px-3 py-2">
        {isOpen ? (
          <span className="flex items-center gap-2 text-sm text-greyscale-0 font-medium">
            <PiPathBold size={18} className="text-primary" />
            Lộ trình học
          </span>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen((prev) => !prev)}
          className="h-8 w-8 rounded border border-greyscale-700"
        >
          <IoChevronForwardOutline
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"
              }`}
          />
        </Button>
      </div>

      {!isOpen ? (
        <div className="hidden p-2 md:block" />
      ) : (
        <div className="space-y-3 p-3">
          {isLoading || isFetching ? (
            <div className="flex min-h-24 items-center justify-center rounded border border-greyscale-700 bg-greyscale-900">
              <Spinner className="h-5 w-5" />
            </div>
          ) : null}

          {!isLoading && isError ? (
            <div className="rounded border border-greyscale-700 bg-greyscale-900 p-2">
              <EmptyState
                title={
                  error?.response?.data?.message ||
                  error?.message ||
                  "Không tải được learning path"
                }
                actionLabel="Thử lại"
                onAction={() => {
                  refetch();
                }}
              />
            </div>
          ) : null}

          {!isLoading && !isError && data ? (
            <>
              <div className="rounded border border-greyscale-700 bg-greyscale-900/80 p-3">
                <h2 className="line-clamp-2 text-lg font-semibold text-greyscale-0">
                  {data.titleVN}
                </h2>
                <div className="mt-2 flex items-center gap-2 text-sm text-greyscale-50">
                  <span className="inline-flex items-center gap-1">
                    <MdOutlinePlayLesson size={18} className="text-primary" />
                    {data.totalLessons} bài học
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <IoTimeOutline size={18} className="text-primary" />
                    {data.duration} phút
                  </span>
                </div>
                <Progress value={progressValue} className="mt-3 h-1.5" />
                <div className="mt-2 text-sm text-greyscale-50 flex items-center justify-between">
                  <p>
                    {completedLessons}/{totalLessonItems}
                  </p>
                  <p className="font-semibold">{Math.round(progressValue)}%</p>
                </div>
              </div>

              <div className="max-h-[calc(100vh-200px)] space-y-2 overflow-y-auto pr-1">
                {data.modules.map((module) => (
                  <LearningPathModuleItem
                    key={module.moduleID}
                    module={module}
                    isExpanded={expandedModules.has(module.moduleID)}
                    selectedLessonId={selectedLessonId}
                    onToggle={toggleModule}
                    onSelectLesson={onSelectLesson}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      )}
    </aside>
  );
}
