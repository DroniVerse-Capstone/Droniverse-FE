"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaRegEye,
  FaRedoAlt,
  FaTrophy,
} from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";
import { SiQuizlet } from "react-icons/si";
import { Spinner } from "@/components/ui/spinner";
import { useGetUserQuizDetail } from "@/hooks/learning/useUserLearning";
import { useLocale } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";

type MemberQuizLessonContentProps = {
  quizId: string;
  enrollmentId?: string;
};

export default function MemberQuizLessonContent({
  quizId,
  enrollmentId,
}: MemberQuizLessonContentProps) {
  const router = useRouter();
  const params = useParams<{ clubSlug?: string }>();
  const locale = useLocale();
  const quizDetailQuery = useGetUserQuizDetail(
    enrollmentId
      ? {
          enrollmentId,
          quizId,
        }
      : undefined,
  );

  if (quizDetailQuery.isLoading) {
    return (
      <div className="mx-auto flex min-h-40 w-full max-w-4xl items-center justify-center rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (quizDetailQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6 text-sm text-warning">
        {quizDetailQuery.error.response?.data?.message ||
          quizDetailQuery.error.message ||
          "Không tải được thông tin bài quiz."}
      </div>
    );
  }

  if (!quizDetailQuery.data) {
    return null;
  }

  const canStartQuiz = Boolean(enrollmentId && params?.clubSlug);
  const attempt = quizDetailQuery.data.attempt;
  const latestAttemptDate = attempt?.submitTime;

  const formattedLatestAttemptDate = latestAttemptDate
    ? new Date(latestAttemptDate).toLocaleString(locale === "en" ? "en-US" : "vi-VN")
    : null;

  const handleStartQuiz = () => {
    if (!enrollmentId || !params?.clubSlug) {
      return;
    }

    router.push(`/learn/${params.clubSlug}/${enrollmentId}/quiz/${quizId}`);
  };

  const quiz = quizDetailQuery.data.quiz;

  const handleReviewLatestAttempt = () => {
    if (!enrollmentId || !params?.clubSlug || !attempt) {
      return;
    }

    router.push(
      `/learn/${params.clubSlug}/${enrollmentId}/quiz/${quizId}/review`
    );
  };

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded border border-greyscale-700/90 bg-greyscale-900/70 p-6 shadow-[0_16px_50px_-24px_rgba(0,0,0,0.85)] backdrop-blur-sm">
      <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-secondary/15 blur-3xl" />

      <div className="relative space-y-5">
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full border border-greyscale-600 bg-greyscale-900/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-greyscale-100">
            Bài kiểm tra 
          </span>

          <h2 className="text-2xl font-semibold leading-tight text-greyscale-0 md:text-3xl">
            {locale === "en" ? quiz.titleEN : quiz.titleVN}
          </h2>

          <p className="max-w-3xl text-sm leading-relaxed text-greyscale-100 md:text-base">
            {locale === "en" ? quiz.descriptionEN : quiz.descriptionVN}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded border-2 border-tertiary/35 bg-tertiary/10 p-3">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-tertiary">
              <FaClock className="h-3.5 w-3.5" />
              Thời gian làm bài
            </p>
            <p className="mt-2 text-xl font-semibold text-greyscale-0">
              {quiz.timeLimit} phút
            </p>
          </div>

          <div className="rounded border-2 border-primary/35 bg-primary/10 p-3">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
              <FaTrophy className="h-3.5 w-3.5" />
              Điểm đạt
            </p>
            <p className="mt-2 text-xl font-semibold text-greyscale-0">
              {quiz.passScore}/{quiz.totalScore} điểm
            </p>
          </div>
        </div>

        {attempt ? (
          <div className="space-y-4 rounded border border-greyscale-700 bg-greyscale-950/70 p-4 text-sm text-greyscale-100">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 text-xs font-semibold ${
                  attempt.isPassed
                    ? "border-success/50 bg-success/20 text-success"
                    : "border-primary/50 bg-primary/20 text-primary"
                }`}
              >
                {attempt.isPassed ? (
                  <FaCheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <FaCircleXmark className="h-3.5 w-3.5" />
                )}
                {attempt.isPassed ? "Đã đạt" : "Chưa đạt"}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded border-2 border-greyscale-700 bg-greyscale-900/70 p-3">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-greyscale-100">
                  <FaTrophy className="h-3.5 w-3.5" />
                  Điểm cao nhất
                </p>
                <p className="mt-1 text-xl font-semibold text-greyscale-0">
                  {attempt.score}
                </p>
              </div>

              <div className="rounded border-2 border-greyscale-700 bg-greyscale-900/70 p-3">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-greyscale-100">
                  <FaCalendarAlt className="h-3.5 w-3.5" />
                  Ngày làm gần nhất
                </p>
                <p className="mt-1 text-lg font-semibold text-greyscale-0">
                  {formattedLatestAttemptDate ?? "-"}
                </p>
              </div>
            </div>

            <div className="flex justify-end flex-wrap gap-2 pt-1">
              <Button
                icon={<FaRedoAlt />}
                disabled={!canStartQuiz}
                onClick={handleStartQuiz}
              >
                Làm lại bài
              </Button>
              <Button
                icon={<FaRegEye />}
                variant="outline"
                onClick={handleReviewLatestAttempt}
              >
                Xem lại bài làm
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button icon={<SiQuizlet />} disabled={!canStartQuiz} onClick={handleStartQuiz}>
              Làm bài
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export type { MemberQuizLessonContentProps };
