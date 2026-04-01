"use client";

import React from "react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { BiEdit } from "react-icons/bi";
import { MdDeleteOutline } from "react-icons/md";

import ConfirmActionPopover from "@/components/common/ConfirmActionPopover";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateQuizQuestion,
  useDeleteQuizQuestion,
  useGetQuizQuestions,
  useUpdateQuizQuestion,
} from "@/hooks/quiz-question/useQuizQuestion";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { ApiError } from "@/types/api/common";
import { Lesson } from "@/validations/lesson/lesson";
import { QuizQuestion } from "@/validations/quiz-question/quiz-question";

type QuizQuestionConfigDialogProps = {
  open: boolean;
  lesson: Lesson | null;
  canManageQuestions: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function QuizQuestionConfigDialog({
  open,
  lesson,
  canManageQuestions,
  onOpenChange,
}: QuizQuestionConfigDialogProps) {
  const t = useTranslations("CourseManagement.CourseSettings.QuizQuestionConfigDialog");
  const locale = useLocale();
  const [editingQuestionId, setEditingQuestionId] = React.useState<
    string | null
  >(null);
  const [contentVN, setContentVN] = React.useState("");
  const [contentEN, setContentEN] = React.useState("");
  const [answerA, setAnswerA] = React.useState("");
  const [answerB, setAnswerB] = React.useState("");
  const [answerC, setAnswerC] = React.useState("");
  const [answerD, setAnswerD] = React.useState("");
  const [answerA_EN, setAnswerA_EN] = React.useState("");
  const [answerB_EN, setAnswerB_EN] = React.useState("");
  const [answerC_EN, setAnswerC_EN] = React.useState("");
  const [answerD_EN, setAnswerD_EN] = React.useState("");
  const [correctAnswer, setCorrectAnswer] = React.useState("A");
  const [score, setScore] = React.useState("");
  const [searchKeyword, setSearchKeyword] = React.useState("");

  const quizId =
    open && lesson?.type === "QUIZ" ? lesson.referenceID : undefined;

  const quizQuestionsQuery = useGetQuizQuestions(quizId);

  const createQuizQuestionMutation = useCreateQuizQuestion({
    onSuccess: (data) => {
      toast.success(data.message);
      resetForm();
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("error.createFailed"),
      );
    },
  });

  const updateQuizQuestionMutation = useUpdateQuizQuestion({
    onSuccess: (data) => {
      toast.success(data.message);
      resetForm();
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("error.updateFailed"),
      );
    },
  });

  const deleteQuizQuestionMutation = useDeleteQuizQuestion({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("error.deleteFailed"),
      );
    },
  });

  const isSaving =
    createQuizQuestionMutation.isPending ||
    updateQuizQuestionMutation.isPending ||
    deleteQuizQuestionMutation.isPending;

  const questions = quizQuestionsQuery.data ?? [];
  const filteredQuestions = React.useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      return questions;
    }

    return questions.filter((question) => {
      const searchable = [
        question.contentVN,
        question.contentEN,
        question.answerA,
        question.answerB,
        question.answerC,
        question.answerD,
        question.answerA_EN,
        question.answerB_EN,
        question.answerC_EN,
        question.answerD_EN,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [questions, searchKeyword]);

  const totalScore = React.useMemo(
    () => questions.reduce((sum, question) => sum + question.score, 0),
    [questions],
  );

  function resetForm() {
    setEditingQuestionId(null);
    setContentVN("");
    setContentEN("");
    setAnswerA("");
    setAnswerB("");
    setAnswerC("");
    setAnswerD("");
    setAnswerA_EN("");
    setAnswerB_EN("");
    setAnswerC_EN("");
    setAnswerD_EN("");
    setCorrectAnswer("A");
    setScore("");
  }

  const parsePositiveInt = (value: string) => {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue <= 0) {
      return null;
    }

    return numberValue;
  };

  const startEdit = (question: QuizQuestion) => {
    setEditingQuestionId(question.questionID);
    setContentVN(question.contentVN);
    setContentEN(question.contentEN);
    setAnswerA(question.answerA);
    setAnswerB(question.answerB);
    setAnswerC(question.answerC);
    setAnswerD(question.answerD);
    setAnswerA_EN(question.answerA_EN);
    setAnswerB_EN(question.answerB_EN);
    setAnswerC_EN(question.answerC_EN);
    setAnswerD_EN(question.answerD_EN);
    setCorrectAnswer(question.correctAnswer);
    setScore(String(question.score));
  };

  const getAnswerValue = (choice: "A" | "B" | "C" | "D") => {
    if (choice === "A") return answerA;
    if (choice === "B") return answerB;
    if (choice === "C") return answerC;
    return answerD;
  };

  const getAnswerValueEN = (choice: "A" | "B" | "C" | "D") => {
    if (choice === "A") return answerA_EN;
    if (choice === "B") return answerB_EN;
    if (choice === "C") return answerC_EN;
    return answerD_EN;
  };

  const setAnswerValue = (choice: "A" | "B" | "C" | "D", value: string) => {
    if (choice === "A") {
      setAnswerA(value);
      return;
    }

    if (choice === "B") {
      setAnswerB(value);
      return;
    }

    if (choice === "C") {
      setAnswerC(value);
      return;
    }

    setAnswerD(value);
  };

  const setAnswerValueEN = (choice: "A" | "B" | "C" | "D", value: string) => {
    if (choice === "A") {
      setAnswerA_EN(value);
      return;
    }

    if (choice === "B") {
      setAnswerB_EN(value);
      return;
    }

    if (choice === "C") {
      setAnswerC_EN(value);
      return;
    }

    setAnswerD_EN(value);
  };

  const handleSubmit = async () => {
    if (!quizId) {
      return;
    }

    const normalizedContentVN = contentVN.trim();
    const normalizedContentEN = contentEN.trim();
    const normalizedAnswerA = answerA.trim();
    const normalizedAnswerB = answerB.trim();
    const normalizedAnswerC = answerC.trim();
    const normalizedAnswerD = answerD.trim();
    const normalizedAnswerA_EN = answerA_EN.trim();
    const normalizedAnswerB_EN = answerB_EN.trim();
    const normalizedAnswerC_EN = answerC_EN.trim();
    const normalizedAnswerD_EN = answerD_EN.trim();
    const parsedScore = parsePositiveInt(score);

    if (
      !normalizedContentVN ||
      !normalizedContentEN ||
      !normalizedAnswerA ||
      !normalizedAnswerB ||
      !normalizedAnswerC ||
      !normalizedAnswerD ||
      !normalizedAnswerA_EN ||
      !normalizedAnswerB_EN ||
      !normalizedAnswerC_EN ||
      !normalizedAnswerD_EN ||
      !parsedScore
    ) {
      toast.error(t("error.missingFields"));
      return;
    }

    const payload = {
      contentVN: normalizedContentVN,
      contentEN: normalizedContentEN,
      answerA: normalizedAnswerA,
      answerB: normalizedAnswerB,
      answerC: normalizedAnswerC,
      answerD: normalizedAnswerD,
      answerA_EN: normalizedAnswerA_EN,
      answerB_EN: normalizedAnswerB_EN,
      answerC_EN: normalizedAnswerC_EN,
      answerD_EN: normalizedAnswerD_EN,
      correctAnswer: correctAnswer as "A" | "B" | "C" | "D",
      score: parsedScore,
    };

    if (editingQuestionId) {
      await updateQuizQuestionMutation.mutateAsync({
        quizId,
        questionId: editingQuestionId,
        payload,
      });
      return;
    }

    await createQuizQuestionMutation.mutateAsync({
      quizId,
      payload,
    });
  };

  const handleDelete = async (questionId: string) => {
    if (!quizId) {
      return;
    }

    await deleteQuizQuestionMutation.mutateAsync({
      quizId,
      questionId,
    });

    if (editingQuestionId === questionId) {
      resetForm();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isSaving) {
          return;
        }

        onOpenChange(nextOpen);
        if (!nextOpen) {
          resetForm();
        }
      }}
    >
      <DialogContent className="max-h-[94vh] sm:max-w-300">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {lesson
              ? `${t("lessonPrefix")}: ${locale === "vi" ? lesson.titleVN : lesson.titleEN}`
              : t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div
          className={
            canManageQuestions
              ? "grid gap-4 md:grid-cols-[1fr_1.25fr]"
              : "grid gap-4 md:grid-cols-1"
          }
        >
          {canManageQuestions ? (
            <div className="order-2 space-y-3 rounded border border-greyscale-700 bg-greyscale-900 p-3 md:order-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-greyscale-0">
                  {editingQuestionId ? t("form.updateTitle") : t("form.createTitle")}
                </p>
                <p className="text-xs text-greyscale-300">
                  {t("form.description")}
                </p>
              </div>

              {editingQuestionId ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                >
                  {t("form.reset")}
                </Button>
              ) : null}
            </div>

            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label htmlFor="quiz-question-content-vn">
                  {t("form.contentVN")}
                </Label>
                <Textarea
                  id="quiz-question-content-vn"
                  value={contentVN}
                  onChange={(event) => setContentVN(event.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiz-question-content-en">
                  {t("form.contentEN")}
                </Label>
                <Textarea
                  id="quiz-question-content-en"
                  value={contentEN}
                  onChange={(event) => setContentEN(event.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t("form.answers")}</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="quiz-question-score">{t("form.score")}:</Label>
                    <Input
                      id="quiz-question-score"
                      type="number"
                      min={1}
                      value={score}
                      onChange={(event) => setScore(event.target.value)}
                      disabled={isSaving}
                      className="w-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {(["A", "B", "C", "D"] as const).map((choice) => (
                    <div
                      key={choice}
                      className="grid grid-cols-[54px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2"
                    >
                      <label
                        htmlFor={`quiz-question-answer-${choice.toLowerCase()}`}
                        className="flex items-center gap-2 text-sm font-medium text-greyscale-100"
                      >
                        <input
                          type="radio"
                          name="quiz-correct-answer"
                          checked={correctAnswer === choice}
                          onChange={() => setCorrectAnswer(choice)}
                          disabled={isSaving}
                          className="h-4 w-4 accent-primary-200"
                        />
                        {choice}
                      </label>
                      <div className="min-w-0 w-full">
                        <Input
                          id={`quiz-question-answer-${choice.toLowerCase()}`}
                          value={getAnswerValue(choice)}
                          onChange={(event) =>
                            setAnswerValue(choice, event.target.value)
                          }
                          disabled={isSaving}
                          placeholder={t("form.answerVNPlaceholder")}
                        />
                      </div>
                      <div className="min-w-0 w-full">
                        <Input
                          id={`quiz-question-answer-${choice.toLowerCase()}-en`}
                          value={getAnswerValueEN(choice)}
                          onChange={(event) =>
                            setAnswerValueEN(choice, event.target.value)
                          }
                          disabled={isSaving}
                          placeholder={t("form.answerENPlaceholder")}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-greyscale-700 pt-3">
              <Button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? <Spinner className="h-4 w-4" /> : null}
                {editingQuestionId ? t("form.submitUpdate") : t("form.submitCreate")}
              </Button>
            </div>
            </div>
          ) : null}

          <div className="order-1 space-y-3 rounded border border-greyscale-700 bg-greyscale-900 p-3 md:order-1">
            <div className="flex items-center justify-between gap-2 rounded border border-greyscale-700/70 bg-greyscale-800/60 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-greyscale-0">
                  {t("list.title")}
                </p>
                <p className="text-xs text-greyscale-300">
                  {questions.length} {t("list.questionSuffix")} | {t("list.totalScore")}: {totalScore}
                </p>
              </div>

              <div className="min-w-45">
                <Input
                  type="search"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder={t("list.searchPlaceholder")}
                  disabled={quizQuestionsQuery.isLoading || isSaving}
                  className="h-9"
                />
              </div>
            </div>

            {quizQuestionsQuery.isLoading ? (
              <div className="flex items-center justify-center py-3">
                <Spinner className="h-5 w-5" />
              </div>
            ) : null}

            {quizQuestionsQuery.isError ? (
              <p className="text-sm text-warning">
                {quizQuestionsQuery.error?.response?.data?.message ||
                  quizQuestionsQuery.error?.message ||
                  t("error.loadFailed")}
              </p>
            ) : null}

            {!quizQuestionsQuery.isLoading &&
            !quizQuestionsQuery.isError &&
            questions.length === 0 ? (
              <EmptyState title={t("empty.noQuestions")} />
            ) : null}

            {!quizQuestionsQuery.isLoading &&
            !quizQuestionsQuery.isError &&
            questions.length > 0 &&
            filteredQuestions.length === 0 ? (
              <div className="rounded border border-greyscale-700 bg-greyscale-800 p-3 text-sm text-greyscale-200">
                {t("empty.notFound")}
              </div>
            ) : null}

            <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {filteredQuestions.map((question, index) => {
                const isEditing = editingQuestionId === question.questionID;

                return (
                  <div
                    key={question.questionID}
                    className={[
                      "space-y-2 rounded border p-2.5 transition-colors",
                      isEditing
                        ? "border-primary-200 bg-primary-200/10"
                        : "border-greyscale-700 bg-greyscale-800 hover:border-greyscale-500",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="rounded bg-primary-200/70 px-2 py-0.5 text-xs font-medium text-greyscale-0">
                          {t("list.questionPrefix")} {index + 1}
                        </p>
                        {isEditing ? (
                          <span className="rounded border border-primary-200/70 bg-primary-200/10 px-2 py-0.5 text-xs text-primary-200">
                            {t("list.editing")}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="rounded border border-secondary-200 px-2 py-0.5 text-xs text-secondary-200 bg-secondary-200/25">
                          {t("list.score")}: {question.score}
                        </span>
                      </div>
                    </div>

                    <p className="line-clamp-2 text-base font-medium text-greyscale-25">
                      {locale === "vi" ? question.contentVN : question.contentEN}
                    </p>
                    <p className="line-clamp-2 text-sm text-greyscale-200">
                      {locale === "vi" ? question.contentEN : question.contentVN}
                    </p>

                    <div className="grid gap-1 text-sm sm:grid-cols-2">
                      {(["A", "B", "C", "D"] as const).map((choice) => {
                        const answerVN =
                          choice === "A"
                            ? question.answerA
                            : choice === "B"
                              ? question.answerB
                              : choice === "C"
                                ? question.answerC
                                : question.answerD;
                        const answerEN =
                          choice === "A"
                            ? question.answerA_EN
                            : choice === "B"
                              ? question.answerB_EN
                              : choice === "C"
                                ? question.answerC_EN
                                : question.answerD_EN;
                        const isCorrect = question.correctAnswer === choice;

                        return (
                          <p
                            key={`${question.questionID}-${choice}`}
                            className={
                              isCorrect
                                ? "font-medium text-primary-200"
                                : "text-greyscale-200"
                            }
                          >
                            {choice}. {locale === "vi"? answerVN : answerEN } / {locale === "vi" ? answerEN : answerVN}
                          </p>
                        );
                      })}
                    </div>

                    {canManageQuestions ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="editIcon"
                          size="icon"
                          onClick={() => startEdit(question)}
                          disabled={isSaving}
                          title={t("tooltip.edit")}
                        >
                          <BiEdit size={16} />
                        </Button>

                        <ConfirmActionPopover
                          trigger={
                            <Button
                              type="button"
                              variant="deleteIcon"
                              size="icon"
                              disabled={isSaving}
                              title={t("tooltip.delete")}
                            >
                              <MdDeleteOutline size={16} />
                            </Button>
                          }
                          title={t("confirm.deleteTitle")}
                          description={t("confirm.deleteDescription")}
                          confirmText={t("confirm.confirmText")}
                          cancelText={t("confirm.cancelText")}
                          isLoading={deleteQuizQuestionMutation.isPending}
                          onConfirm={() => {
                            void handleDelete(question.questionID);
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { QuizQuestionConfigDialogProps };
