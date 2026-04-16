"use client";

import React from "react";

import { Spinner } from "@/components/ui/spinner";
import { useGetUserQuizAttemptReview } from "@/hooks/learning/useUserLearning";
import { useLocale } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { useLessonNavigation } from "@/hooks/learning/useLessonNavigation";
import { FaArrowLeft } from "react-icons/fa";

type MemberQuizAttemptReviewContentProps = {
  enrollmentId: string;
  quizId: string;
};

export default function MemberQuizAttemptReviewContent({
  enrollmentId,
  quizId,
}: MemberQuizAttemptReviewContentProps) {
  const locale = useLocale();
  const reviewQuery = useGetUserQuizAttemptReview({ enrollmentId, quizId });
  const { handleExit } = useLessonNavigation(enrollmentId, quizId);

  if (reviewQuery.isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (reviewQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6 text-sm text-warning">
        {reviewQuery.error.response?.data?.message ||
          reviewQuery.error.message ||
          "Không tải được dữ liệu xem lại bài quiz."}
      </div>
    );
  }

  if (!reviewQuery.data) {
    return null;
  }

  const { quiz, attempt, questions } = reviewQuery.data;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-greyscale-0">
          {locale === "en" ? "Quiz Review" : "Xem lại bài quiz"}: {locale === "en" ? quiz.titleEN : quiz.titleVN}
        </h2>
        <Button
          variant="outline"
          size="sm"
          icon={<FaArrowLeft />}
          onClick={handleExit}
          className="border-greyscale-700 text-greyscale-200"
        >
          {locale === "en" ? "Back" : "Quay lại"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span
          className={`inline-flex rounded border-2 px-2 py-1 ${
            attempt.isPassed
              ? "border-success/40 bg-success/15 text-success"
              : "border-primary/40 bg-primary/15 text-primary"
          }`}
        >
          {attempt.isPassed ? "Đã đạt" : "Chưa đạt"}
        </span>
        <span className="inline-flex rounded border-2 border-primary/40 bg-primary/15 px-2 py-1 text-primary">
          Điểm: {attempt.score}
        </span>
      </div>

      {questions.map((item, index) => {
        const selectedAnswer = item.attempt.selectedAnswer;
        const correctAnswer = item.question.correctAnswer;
        const isCorrect = item.attempt.isCorrect;

        return (
          <div
            key={item.question.questionID}
            className="space-y-3 rounded-lg border border-greyscale-700/80 bg-greyscale-950/60 p-4"
          >
            <p className="text-sm font-medium text-greyscale-0">
              Câu {index + 1}. {locale === "en" ? item.question.contentEN : item.question.contentVN}
            </p>

            <p className="text-xs text-greyscale-300">
              Điểm đạt được: <span className="font-semibold text-greyscale-0">{item.attempt.score}</span>/{item.question.score}
            </p>

            <div className="grid gap-2 text-sm text-greyscale-100">
              {["A", "B", "C", "D"].map((key) => {
                const answerKey = key as "A" | "B" | "C" | "D";
                const isSelected = selectedAnswer === answerKey;
                const isAnswerCorrect = correctAnswer === answerKey;

                const content =
                  locale === "en"
                    ? item.question[`answer${answerKey}_EN` as const]
                    : item.question[`answer${answerKey}` as const];

                return (
                  <div
                    key={answerKey}
                    className={`rounded border px-3 py-2 ${
                      isAnswerCorrect
                        ? "border-success/60 bg-success/10"
                        : isSelected
                          ? "border-primary/60 bg-primary/10"
                          : "border-greyscale-700 bg-greyscale-900/50"
                    }`}
                  >
                    {answerKey}. {content}
                  </div>
                );
              })}
            </div>

            <p className={`text-xs ${isCorrect ? "text-success" : "text-primary"}`}>
              {isCorrect
                ? "Bạn trả lời đúng"
                : `Bạn trả lời sai. Đáp án đúng là ${correctAnswer}.`}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export type { MemberQuizAttemptReviewContentProps };
