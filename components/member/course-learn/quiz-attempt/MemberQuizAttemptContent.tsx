"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useGetUserQuizQuestions,
  useSubmitUserQuiz,
} from "@/hooks/learning/useUserLearning";
import type { UserQuizAnswerKey } from "@/validations/learning/user-learning";

type MemberQuizAttemptContentProps = {
  enrollmentId: string;
  quizId: string;
};

export default function MemberQuizAttemptContent({
  enrollmentId,
  quizId,
}: MemberQuizAttemptContentProps) {
  const router = useRouter();
  const params = useParams<{ clubSlug?: string }>();
  const quizQuestionsQuery = useGetUserQuizQuestions({ enrollmentId, quizId });
  const submitQuizMutation = useSubmitUserQuiz();
  const [answers, setAnswers] = React.useState<Record<string, UserQuizAnswerKey>>({});

  const questions = quizQuestionsQuery.data ?? [];
  const isAllAnswered =
    questions.length > 0 &&
    questions.every((question) => Boolean(answers[question.questionID]));

  const handleSelectAnswer = (
    questionId: string,
    selectedOptionKey: UserQuizAnswerKey,
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: selectedOptionKey,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!isAllAnswered || submitQuizMutation.isPending) {
      return;
    }

    try {
      const result = await submitQuizMutation.mutateAsync({
        enrollmentId,
        quizId,
        answers: questions.map((question) => ({
          questionID: question.questionID,
          selectedOptionKey: answers[question.questionID],
        })),
      });

      toast.success("Nộp quiz thành công.");

        if (params?.clubSlug) {
          router.push(`/learn/${params.clubSlug}/${enrollmentId}`);
        } else {
          router.back();
        }

      setTimeout(() => {
        toast(
          `Điểm: ${result.score}. ${result.isPassed ? "Bạn đã đạt." : "Bạn chưa đạt."}`,
        );
      }, 0);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Không thể nộp quiz. Vui lòng thử lại.";

      toast.error(message);
    }
  };

  if (quizQuestionsQuery.isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (quizQuestionsQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6 text-sm text-warning">
        {quizQuestionsQuery.error.response?.data?.message ||
          quizQuestionsQuery.error.message ||
          "Không tải được câu hỏi quiz."}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6 text-sm text-greyscale-100">
        Bài quiz hiện chưa có câu hỏi.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6">
      <h2 className="text-xl font-semibold text-greyscale-0">Làm bài Quiz</h2>

      {questions.map((question, index) => (
        <div
          key={question.questionID}
          className="space-y-3 rounded-lg border border-greyscale-700/80 bg-greyscale-950/60 p-4"
        >
          <p className="text-sm font-medium text-greyscale-0">
            Câu {index + 1}. {question.contentVN}
          </p>

          <div className="grid gap-2">
            {question.options.map((option, index) => {
              const isSelected = answers[question.questionID] === option.optionKey;
              const displayOptionKey = String.fromCharCode(65 + index);

              return (
                <button
                  key={option.optionKey}
                  type="button"
                  className={`w-full rounded border px-3 py-2 text-left text-sm transition ${
                    isSelected
                      ? "border-primary bg-primary/20 text-greyscale-0"
                      : "border-greyscale-700 bg-greyscale-900/50 text-greyscale-100 hover:bg-greyscale-900"
                  }`}
                  onClick={() =>
                    handleSelectAnswer(question.questionID, option.optionKey)
                  }
                >
                  {displayOptionKey}. {option.contentVN}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button
          disabled={!isAllAnswered || submitQuizMutation.isPending}
          onClick={handleSubmitQuiz}
        >
          {submitQuizMutation.isPending ? "Đang nộp..." : "Nộp bài"}
        </Button>
      </div>
    </div>
  );
}

export type { MemberQuizAttemptContentProps };
