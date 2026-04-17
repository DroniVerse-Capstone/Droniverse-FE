"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import MemberLabLessonContent from "@/components/member/course-learn/MemberLabLessonContent";
import MemberLessonDetail from "@/components/member/course-learn/MemberLessonDetail";
import MemberQuizLessonContent from "@/components/member/course-learn/MemberQuizLessonContent";
import MemberTheoryLessonContent from "@/components/member/course-learn/MemberTheoryLessonContent";
import { LanguageSwitcher } from "@/components/layouts/LanguageSwitcher";
import LearningPathSideBar from "@/components/member/course-learn/LearningPathSideBar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useCheckUserLessonExists,
  useGetUserLearningPath,
} from "@/hooks/learning/useUserLearning";
import type { Lesson } from "@/validations/learning/user-learning";
import { PiCertificateBold } from "react-icons/pi";
import { RiArrowGoBackFill } from "react-icons/ri";

export default function MemberCourseLearn() {
  const router = useRouter();
  const params = useParams<{ enrollmentId?: string; clubSlug?: string }>();
  const searchParams = useSearchParams();
  const clubSlug = params?.clubSlug;
  const enrollmentId = params?.enrollmentId;
  const lessonIdFromUrl = searchParams.get("lessonId");
  const [selectedLesson, setSelectedLesson] = React.useState<Lesson | null>(
    null,
  );

  const handleExitLearning = () => {
    if (clubSlug) {
      router.push(`/member/${clubSlug}/my-courses`);
      return;
    }

    router.back();
  };

  const lessonExistsQuery = useCheckUserLessonExists(
    selectedLesson && enrollmentId
      ? {
          enrollmentId,
          lessonId: selectedLesson.lessonID,
        }
      : undefined,
  );

  const { data: learningPath } = useGetUserLearningPath(enrollmentId);
  const canShowCertificate =
    learningPath?.status === "COMPLETED" && !!learningPath.userCertificate;

  return (
    <div className="flex flex-col md:flex-row">
      <LearningPathSideBar
        selectedLessonId={selectedLesson?.lessonID ?? lessonIdFromUrl}
        onSelectLesson={setSelectedLesson}
      />

      <section className="min-h-screen min-w-0 flex-1 bg-greyscale-950 px-6 py-6">
        <header className="mb-5">
          <div className="flex items-center justify-between gap-3">
            <Button icon={<RiArrowGoBackFill />} variant="outline" onClick={handleExitLearning}>
              Thoát khỏi chế độ học
            </Button>
            <LanguageSwitcher />
          </div>
        </header>

        {canShowCertificate ? (
          <div className="mx-auto mb-5 w-full max-w-4xl rounded-lg border border-secondary/40 bg-secondary/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-secondary/20 p-2 text-secondary">
                  <PiCertificateBold size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-greyscale-0">
                    Bạn đã hoàn thành khóa học
                  </p>
                  <p className="text-xs text-greyscale-200">
                    Chứng chỉ của bạn đã sẵn sàng.
                  </p>
                </div>
              </div>

              <a
                href={learningPath.userCertificate?.certificateUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center rounded border border-secondary px-3 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/10"
              >
                Xem chứng chỉ
              </a>
            </div>

            <div className="relative mt-4 h-60 w-full overflow-hidden rounded border border-greyscale-700 bg-greyscale-950 md:h-80">
              <img
                src={learningPath.userCertificate?.certificateUrl}
                alt="Certificate"
                className="h-full w-full object-contain p-4"
              />
            </div>
          </div>
        ) : null}

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
            <MemberTheoryLessonContent
              referenceId={selectedLesson.referenceID}
              enrollmentId={enrollmentId}
              lessonId={selectedLesson.lessonID}
              isCompleted={selectedLesson.isCompleted}
            />
          ) : selectedLesson.type === "QUIZ" ? (
            <MemberQuizLessonContent
              quizId={selectedLesson.referenceID}
              enrollmentId={enrollmentId}
            />
          ) : (
            <MemberLabLessonContent
              referenceId={selectedLesson.referenceID}
              enrollmentId={enrollmentId}
            />
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
