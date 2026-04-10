"use client";

import React from "react";
import {
  IoCheckmarkCircle,
  IoDocumentTextOutline,
  IoFlaskOutline,
  IoHelpCircleOutline,
  IoLockClosedOutline,
  IoPlayCircleOutline,
  IoTimeOutline,
} from "react-icons/io5";

import LearningPathSideBar from "@/components/member/course-learn/LearningPathSideBar";
import type { Lesson, LessonType } from "@/validations/learning/user-learning";

const LESSON_TYPE_LABEL: Record<LessonType, string> = {
  THEORY: "Bài lý thuyết",
  QUIZ: "Bài quiz",
  LAB: "Bài thực hành",
};

const LESSON_TYPE_ICON: Record<LessonType, React.ReactNode> = {
  THEORY: <IoDocumentTextOutline className="h-4 w-4" />,
  QUIZ: <IoHelpCircleOutline className="h-4 w-4" />,
  LAB: <IoFlaskOutline className="h-4 w-4" />,
};

export default function MemberCourseLearn() {
  const [selectedLesson, setSelectedLesson] = React.useState<Lesson | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <LearningPathSideBar
        selectedLessonId={selectedLesson?.lessonID ?? null}
        onSelectLesson={setSelectedLesson}
      />

      <section className="min-h-screen bg-greyscale-950 px-6 py-6">
        {selectedLesson ? (
          <div className="mx-auto w-full max-w-4xl space-y-5 rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-greyscale-300">
              <span className="inline-flex items-center gap-1 rounded bg-primary/20 px-2 py-1 font-medium text-primary">
                {LESSON_TYPE_ICON[selectedLesson.type]}
                {LESSON_TYPE_LABEL[selectedLesson.type]}
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-greyscale-800 px-2 py-1 text-greyscale-100">
                <IoTimeOutline className="h-3.5 w-3.5" />
                {selectedLesson.duration} phút
              </span>
              {selectedLesson.isLocked ? (
                <span className="inline-flex items-center gap-1 rounded bg-greyscale-800 px-2 py-1 text-greyscale-300">
                  <IoLockClosedOutline className="h-3.5 w-3.5" />
                  Đang khóa
                </span>
              ) : null}
              {selectedLesson.isCompleted ? (
                <span className="inline-flex items-center gap-1 rounded bg-green-500/10 px-2 py-1 text-green-400">
                  <IoCheckmarkCircle className="h-3.5 w-3.5" />
                  Đã hoàn thành
                </span>
              ) : null}
            </div>

            <h1 className="text-2xl font-bold text-greyscale-0">
              {selectedLesson.titleVN}
            </h1>

            <p className="text-sm text-greyscale-300">
              Đây là vùng nội dung chính của bài học. Sidebar bên trái đã được tách riêng thành component và có thể đóng/mở.
            </p>

            <button
              type="button"
              disabled={selectedLesson.isLocked}
              className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-greyscale-0 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IoPlayCircleOutline className="h-4 w-4" />
              {selectedLesson.isLocked ? "Bài học đang bị khóa" : "Bắt đầu học"}
            </button>
          </div>
        ) : (
          <div className="mx-auto flex h-full min-h-[60vh] w-full max-w-4xl items-center justify-center rounded-lg border border-greyscale-700 bg-greyscale-900/40 p-8 text-center">
            <div>
              <h2 className="text-xl font-semibold text-greyscale-0">
                Chọn một bài học từ sidebar
              </h2>
              <p className="mt-2 text-sm text-greyscale-300">
                Danh sách learning path ở bên trái đã hỗ trợ đóng/mở và chọn bài học.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
