"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GiDuration } from "react-icons/gi";
import { openDB, type DBSchema } from "idb";import { FaArrowLeft } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  useGetUserQuizQuestions,
  useSubmitUserQuiz,
} from "@/hooks/learning/useUserLearning";
import type { UserQuizAnswerKey } from "@/validations/learning/user-learning";
import { useLessonNavigation } from "@/hooks/learning/useLessonNavigation";

type MemberQuizAttemptContentProps = {
  enrollmentId: string;
  quizId: string;
};

type QuizAttemptDraft = {
  storageKey: string;
  answers: Record<string, UserQuizAnswerKey>;
  remainingSeconds: number;
  updatedAt: number;
};

interface QuizAttemptDraftDb extends DBSchema {
  "quiz-attempt-drafts": {
    key: string;
    value: QuizAttemptDraft;
  };
}

const QUIZ_ATTEMPT_DB_NAME = "droniverse-quiz-attempt-db";
const QUIZ_ATTEMPT_STORE_NAME = "quiz-attempt-drafts";

const openQuizAttemptDb = () =>
  openDB<QuizAttemptDraftDb>(QUIZ_ATTEMPT_DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(QUIZ_ATTEMPT_STORE_NAME)) {
        db.createObjectStore(QUIZ_ATTEMPT_STORE_NAME, { keyPath: "storageKey" });
      }
    },
  });

const getQuizAttemptDraft = async (storageKey: string) => {
  const db = await openQuizAttemptDb();
  try {
    return (await db.get(QUIZ_ATTEMPT_STORE_NAME, storageKey)) ?? null;
  } finally {
    db.close();
  }
};

const saveQuizAttemptDraft = async (draft: QuizAttemptDraft) => {
  const db = await openQuizAttemptDb();
  try {
    await db.put(QUIZ_ATTEMPT_STORE_NAME, draft);
  } finally {
    db.close();
  }
};

const deleteQuizAttemptDraft = async (storageKey: string) => {
  const db = await openQuizAttemptDb();
  try {
    await db.delete(QUIZ_ATTEMPT_STORE_NAME, storageKey);
  } finally {
    db.close();
  }
};

export default function MemberQuizAttemptContent({
  enrollmentId,
  quizId,
}: MemberQuizAttemptContentProps) {
  const router = useRouter();
  const params = useParams<{ clubSlug?: string }>();
  const quizQuestionsQuery = useGetUserQuizQuestions({ enrollmentId, quizId });
  const submitQuizMutation = useSubmitUserQuiz();
  const [answers, setAnswers] = React.useState<
    Record<string, UserQuizAnswerKey>
  >({});
  const { handleExit } = useLessonNavigation(enrollmentId, quizId);
  const [remainingSeconds, setRemainingSeconds] = React.useState<number | null>(
    null,
  );
  const [isDraftHydrated, setIsDraftHydrated] = React.useState(false);
  const hasAutoSubmittedRef = React.useRef(false);

  const storageKey = React.useMemo(
    () => `quiz-attempt:${enrollmentId}:${quizId}`,
    [enrollmentId, quizId],
  );

  const quizData = quizQuestionsQuery.data;
  const questions = quizData?.questions ?? [];
  const isAllAnswered =
    questions.length > 0 &&
    questions.every((question) => Boolean(answers[question.questionID]));
  const answeredCount = questions.filter(
    (question) => answers[question.questionID],
  ).length;
  const progressPercent =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;
  const initialTimeLimitSeconds = (quizData?.timeLimit ?? 0) * 60;
  const hasTimeProgress =
    isDraftHydrated &&
    remainingSeconds !== null &&
    initialTimeLimitSeconds > 0 &&
    remainingSeconds < initialTimeLimitSeconds;
  const shouldWarnBeforeUnload =
    !submitQuizMutation.isPending && (answeredCount > 0 || hasTimeProgress);

  React.useEffect(() => {
    if (!quizData?.timeLimit) {
      return;
    }

    let isCancelled = false;

    const restoreDraft = async () => {
      try {
        const draft = await getQuizAttemptDraft(storageKey);

        if (isCancelled) {
          return;
        }

        if (draft) {
          const elapsedSeconds = Math.max(
            0,
            Math.floor((Date.now() - (draft.updatedAt ?? Date.now())) / 1000),
          );
          const restoredRemainingSeconds =
            typeof draft.remainingSeconds === "number" && draft.remainingSeconds >= 0
              ? Math.max(0, draft.remainingSeconds - elapsedSeconds)
              : quizData.timeLimit * 60;

          setAnswers(draft.answers ?? {});
          setRemainingSeconds(restoredRemainingSeconds);
        } else {
          setRemainingSeconds(quizData.timeLimit * 60);
        }
      } catch {
        if (!isCancelled) {
          setRemainingSeconds(quizData.timeLimit * 60);
        }
      } finally {
        if (!isCancelled) {
          setIsDraftHydrated(true);
        }
      }
    };

    setIsDraftHydrated(false);
    restoreDraft();

    return () => {
      isCancelled = true;
    };
  }, [quizData?.quizID, quizData?.timeLimit, storageKey]);

  React.useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous === null || previous <= 1) {
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [remainingSeconds]);

  React.useEffect(() => {
    if (!isDraftHydrated || remainingSeconds === null) {
      return;
    }

    saveQuizAttemptDraft({
      storageKey,
      answers,
      remainingSeconds,
      updatedAt: Date.now(),
    }).catch(() => {
      // Ignore storage errors to avoid interrupting quiz flow.
    });
  }, [answers, isDraftHydrated, remainingSeconds, storageKey]);

  const formattedRemainingTime = React.useMemo(() => {
    if (remainingSeconds === null) {
      return "--:--";
    }

    const minutes = Math.floor(remainingSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (remainingSeconds % 60).toString().padStart(2, "0");

    return `${minutes}:${seconds}`;
  }, [remainingSeconds]);

  const handleSelectAnswer = (
    questionId: string,
    selectedOptionKey: UserQuizAnswerKey,
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: selectedOptionKey,
    }));
  };

  const handleSubmitQuiz = async (isAutoSubmit = false) => {
    if (submitQuizMutation.isPending) {
      return;
    }

    if (!isAutoSubmit && !isAllAnswered) {
      return;
    }

    const submitAnswers = questions
      .filter((question) => Boolean(answers[question.questionID]))
      .map((question) => ({
        questionID: question.questionID,
        selectedOptionKey: answers[question.questionID],
      }));

    try {
      const result = await submitQuizMutation.mutateAsync({
        enrollmentId,
        quizId,
        answers: submitAnswers,
      });

      await deleteQuizAttemptDraft(storageKey).catch(() => {
        // Ignore cleanup failures so submit result is not blocked.
      });

      toast.success(isAutoSubmit ? "Hết giờ, hệ thống đã tự nộp bài." : "Nộp quiz thành công.");

      handleExit();

      setTimeout(() => {
        toast(
          `Điểm: ${result.score}. ${result.isPassed ? "Bạn đã đạt." : "Bạn chưa đạt."}`,
        );
      }, 0);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Không thể nộp quiz. Vui lòng thử lại.";

      toast.error(message);
    }
  };

  React.useEffect(() => {
    if (!isDraftHydrated || remainingSeconds !== 0) {
      return;
    }

    if (hasAutoSubmittedRef.current) {
      return;
    }

    hasAutoSubmittedRef.current = true;
    handleSubmitQuiz(true);
  }, [isDraftHydrated, remainingSeconds]);

  React.useEffect(() => {
    if (!shouldWarnBeforeUnload) {
      window.onbeforeunload = null;
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const warningMessage = "Bạn có bài làm chưa nộp. Rời trang sẽ mất tiến trình hiện tại.";
      event.preventDefault();
      event.returnValue = warningMessage;
      return warningMessage;
    };

    window.onbeforeunload = handleBeforeUnload;

    return () => {
      if (window.onbeforeunload === handleBeforeUnload) {
        window.onbeforeunload = null;
      }
    };
  }, [shouldWarnBeforeUnload]);

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
    <div className="w-full">
      <div className="grid gap-4 lg:grid-cols-10 lg:gap-6">
        <div className="flex items-center justify-between">
        <div className="space-y-4 lg:col-span-7">        <Button
          variant="outline"
          size="sm"
          icon={<FaArrowLeft />}
          onClick={handleExit}
          className="border-greyscale-700 text-greyscale-200"
        >
          Quay lại
        </Button>
      </div>

          {questions.map((question, index) => (
            <div
              key={question.questionID}
              className="space-y-3 rounded border border-greyscale-700/80 bg-greyscale-900/60 p-4"
            >
              <p className="text-base font-medium text-greyscale-0">
                Câu {index + 1}. {question.contentVN}
              </p>

              <div className="grid gap-2">
                {question.options.map((option, index) => {
                  const isSelected =
                    answers[question.questionID] === option.optionKey;
                  const displayOptionKey = String.fromCharCode(65 + index);

                  return (
                    <button
                      key={option.optionKey}
                      type="button"
                      className={`w-full rounded border px-3 py-2 text-left text-sm transition ${
                        isSelected
                          ? "border-primary bg-primary/20 text-greyscale-0"
                          : "border-greyscale-700 bg-greyscale-900/50 text-greyscale-50 hover:bg-greyscale-800"
                      }`}
                      onClick={() =>
                        handleSelectAnswer(
                          question.questionID,
                          option.optionKey,
                        )
                      }
                    >
                      {displayOptionKey}. {option.contentVN}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:col-span-3 lg:sticky lg:top-4 lg:self-start">
          <div className="space-y-4 rounded-lg border border-greyscale-700 bg-greyscale-900/95 p-4 shadow-md backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-greyscale-0">
                {quizData ? quizData.titleVN : "Làm bài Quiz"}
              </h2>

              <div className="inline-flex items-center gap-2 rounded border-2 border-tertiary/50 bg-tertiary/15 px-3 py-1 text-sm font-semibold text-tertiary">
                <GiDuration size={18} /> {formattedRemainingTime}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-greyscale-200">
                <span>Tiến trình</span>
                <span>
                  {answeredCount}/{questions.length} câu ({progressPercent}%)
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-greyscale-700/80">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <Button
              className="w-full"
              disabled={!isAllAnswered || submitQuizMutation.isPending}
              onClick={() => handleSubmitQuiz()}
            >
              {submitQuizMutation.isPending ? "Đang nộp..." : "Nộp bài"}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export type { MemberQuizAttemptContentProps };
