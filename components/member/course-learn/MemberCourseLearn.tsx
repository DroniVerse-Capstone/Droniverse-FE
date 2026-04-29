"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import MemberLabLessonContent from "@/components/member/course-learn/MemberLabLessonContent";
import MemberLessonDetail from "@/components/member/course-learn/MemberLessonDetail";
import MemberQuizLessonContent from "@/components/member/course-learn/MemberQuizLessonContent";
import MemberTheoryLessonContent from "@/components/member/course-learn/MemberTheoryLessonContent";
import MemberSimulatorLessonContent from "@/components/member/course-learn/MemberSimulatorLessonContent";
import MemberAssignmentLessonContent from "@/components/member/course-learn/MemberAssignmentLessonContent";
import { LanguageSwitcher } from "@/components/layouts/LanguageSwitcher";
import LearningPathSideBar from "@/components/member/course-learn/LearningPathSideBar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useCheckUserLessonExists,
  useGetUserLearningPath,
} from "@/hooks/learning/useUserLearning";
import type { Lesson } from "@/validations/learning/user-learning";
import { PiCertificateBold, PiPathBold } from "react-icons/pi";
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
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadCertificate = async (url: string, fileName: string) => {
    try {
      setIsDownloading(true);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: just open in new tab
      window.open(url, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

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

  const { data: learningPath, isLoading: isPathLoading } = useGetUserLearningPath(enrollmentId);
  const canShowCertificate =
    learningPath?.status === "COMPLETED" && !!learningPath.userCertificate;

  // Auto-select first incomplete lesson if none selected
  React.useEffect(() => {
    if (!selectedLesson && learningPath?.modules && !canShowCertificate) {
      const allLessons = learningPath.modules.flatMap((m) => m.lessons || []);
      if (allLessons.length > 0) {
        const firstIncomplete = allLessons.find((l) => !l.isCompleted) || allLessons[0];
        if (firstIncomplete) {
          setSelectedLesson(firstIncomplete);
        }
      }
    }
  }, [selectedLesson, learningPath, canShowCertificate]);

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
          ) : selectedLesson.type === "ASSIGNMENT" ? (
            <MemberAssignmentLessonContent
              assignmentId={selectedLesson.referenceID}
              enrollmentId={enrollmentId}
            />
          ) : ["PHYSIC", "LAB_PHYSIC", "VR"].includes(selectedLesson.type) ? (
            <MemberSimulatorLessonContent
              referenceId={selectedLesson.referenceID}
              enrollmentId={enrollmentId}
              lessonId={selectedLesson.lessonID}
            />
          ) : (
            <MemberLabLessonContent
              referenceId={selectedLesson.referenceID}
              enrollmentId={enrollmentId}
            />
          )
        ) : (
          <div className="mx-auto h-full min-h-[60vh] w-full max-w-4xl space-y-6">
            {canShowCertificate ? (
              <div className="space-y-6">
                {/* Clean Certificate Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded bg-greyscale-900 border border-secondary/30 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="rounded bg-secondary/20 p-3 text-secondary">
                      <PiCertificateBold size={32} />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-greyscale-0">
                        Khóa học đã hoàn thành!
                      </h2>
                      <p className="text-greyscale-300 text-sm">
                        Bạn đã đạt được chứng chỉ cho lộ trình học này.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
                    <a
                      href={learningPath.userCertificate?.certificateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 items-center justify-center gap-2 rounded bg-greyscale-800 border border-greyscale-700 px-6 text-sm font-bold text-white transition-all hover:bg-greyscale-700 shadow-md"
                    >
                      Xem trực tuyến
                    </a>
                    <Button
                      variant="secondary"
                      disabled={isDownloading}
                      icon={isDownloading ? <Spinner className="h-4 w-4" /> : null}
                      onClick={() =>
                        learningPath.userCertificate?.certificateUrl &&
                        handleDownloadCertificate(
                          learningPath.userCertificate.certificateUrl,
                          `ChungChi_${learningPath.titleVN.replace(/\s+/g, "_")}.png`
                        )
                      }
                      className="flex h-11 items-center justify-center gap-2 rounded px-6 text-sm font-bold text-white transition-all shadow-md shadow-secondary/20"
                    >
                      {isDownloading ? "Đang tải..." : "Tải về máy"}
                    </Button>
                  </div>
                </div>

                {/* Minimalist Certificate Preview */}
                <div className="rounded border border-greyscale-800 bg-greyscale-950 p-2 shadow-xl">
                  <div className="relative group overflow-hidden rounded border border-greyscale-800">
                    <img
                      src={learningPath.userCertificate?.certificateUrl}
                      alt="Certificate"
                      className="h-full w-full object-contain p-4 md:p-8"
                    />
                    <div className="absolute inset-0 bg-greyscale-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <p className="text-white text-sm font-medium">Nhấp để xem ảnh gốc</p>
                    </div>
                    <a
                      href={learningPath.userCertificate?.certificateUrl}
                      target="_blank"
                      className="absolute inset-0 z-10"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex min-h-[60vh] w-full items-center justify-center rounded border border-greyscale-700 bg-greyscale-900/40 p-8">
                <Spinner className="h-6 w-6" />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
