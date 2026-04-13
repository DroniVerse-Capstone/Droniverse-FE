"use client";

import React from "react";
import { useParams } from "next/navigation";

import MemberLabLessonContent from "@/components/member/course-learn/MemberLabLessonContent";
import MemberLessonDetail from "@/components/member/course-learn/MemberLessonDetail";
import MemberQuizLessonContent from "@/components/member/course-learn/MemberQuizLessonContent";
import MemberTheoryLessonContent from "@/components/member/course-learn/MemberTheoryLessonContent";
import LearningPathSideBar from "@/components/member/course-learn/LearningPathSideBar";
import { Spinner } from "@/components/ui/spinner";
import { useCheckUserLessonExists } from "@/hooks/learning/useUserLearning";
import type { Lesson } from "@/validations/learning/user-learning";

export default function MemberCourseLearn() {
  const params = useParams<{ enrollmentId?: string }>();
  const enrollmentId = params?.enrollmentId;
  const [selectedLesson, setSelectedLesson] = React.useState<Lesson | null>(
    null,
  );

  const lessonExistsQuery = useCheckUserLessonExists(
    selectedLesson && enrollmentId
      ? {
          enrollmentId,
          lessonId: selectedLesson.lessonID,
        }
      : undefined,
  );

  return (
    <div className="flex flex-col md:flex-row">
      <LearningPathSideBar
        selectedLessonId={selectedLesson?.lessonID ?? null}
        onSelectLesson={setSelectedLesson}
      />

      <section className="min-h-screen min-w-0 flex-1 bg-greyscale-950 px-6 py-6">
        {selectedLesson ? (
          lessonExistsQuery.isLoading ? (
            <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center rounded-lg border border-greyscale-700 bg-greyscale-900/40 p-8">
              <Spinner className="h-5 w-5" />
            </div>
          ) : lessonExistsQuery.isError ? (
            <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center rounded-lg border border-greyscale-700 bg-greyscale-900/40 p-8 text-sm text-warning">
              {lessonExistsQuery.error.response?.data?.message ||
                lessonExistsQuery.error.message ||
                "Không kiểm tra được trạng thái bài học."}
            </div>
          ) : !lessonExistsQuery.data ? (
            <MemberLessonDetail
              lesson={selectedLesson}
              onStarted={() => {
                lessonExistsQuery.refetch();
              }}
            />
          ) : selectedLesson.type === "THEORY" ? (
            <MemberTheoryLessonContent referenceId={selectedLesson.referenceID} />
          ) : selectedLesson.type === "QUIZ" ? (
            <MemberQuizLessonContent referenceId={selectedLesson.referenceID} />
          ) : (
            <MemberLabLessonContent referenceId={selectedLesson.referenceID} />
          )
        ) : (
          <div className="mx-auto flex h-full min-h-[60vh] w-full max-w-4xl items-center justify-center rounded-lg border border-greyscale-700 bg-greyscale-900/40 p-8 text-center">
            <div>
              <h2 className="text-xl font-semibold text-greyscale-0">
                Chọn một bài học từ sidebar
              </h2>
              <p className="mt-2 text-sm text-greyscale-300">
                Danh sách learning path ở bên trái đã hỗ trợ đóng/mở và chọn bài
                học.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
