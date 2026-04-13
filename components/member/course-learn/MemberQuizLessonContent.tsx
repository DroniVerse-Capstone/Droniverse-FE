"use client";

import React from "react";

import { Spinner } from "@/components/ui/spinner";
import { useGetQuizDetail } from "@/hooks/quiz/useQuiz";
import { useLocale } from "@/providers/i18n-provider";

type MemberQuizLessonContentProps = {
  referenceId: string;
};

export default function MemberQuizLessonContent({
  referenceId,
}: MemberQuizLessonContentProps) {
  const locale = useLocale();
  const quizDetailQuery = useGetQuizDetail(referenceId);

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

  const quiz = quizDetailQuery.data;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 rounded border border-greyscale-700 bg-greyscale-900/60 p-6">
      <h2 className="text-xl font-semibold text-greyscale-0">
        {locale === "en" ? quiz.titleEN : quiz.titleVN}
      </h2>

      <p className="text-sm text-greyscale-100">
        {locale === "en" ? quiz.descriptionEN : quiz.descriptionVN}
      </p>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex rounded border border-tertiary/40 bg-tertiary/15 px-2 py-1 text-tertiary">
          {quiz.timeLimit} phút
        </span>
        <span className="inline-flex rounded border border-primary/40 bg-primary/15 px-2 py-1 text-primary">
          {quiz.passScore}/{quiz.totalScore} điểm
        </span>
      </div>
    </div>
  );
}

export type { MemberQuizLessonContentProps };