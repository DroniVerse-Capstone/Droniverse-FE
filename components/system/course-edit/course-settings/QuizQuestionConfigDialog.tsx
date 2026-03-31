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
  const [editingQuestionId, setEditingQuestionId] = React.useState<
    string | null
  >(null);
  const [contentVN, setContentVN] = React.useState("");
  const [contentEN, setContentEN] = React.useState("");
  const [answerA, setAnswerA] = React.useState("");
  const [answerB, setAnswerB] = React.useState("");
  const [answerC, setAnswerC] = React.useState("");
  const [answerD, setAnswerD] = React.useState("");
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
          "Không thể tạo câu hỏi.",
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
          "Không thể cập nhật câu hỏi.",
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
          "Không thể xóa câu hỏi.",
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
    setCorrectAnswer(question.correctAnswer);
    setScore(String(question.score));
  };

  const getAnswerValue = (choice: "A" | "B" | "C" | "D") => {
    if (choice === "A") return answerA;
    if (choice === "B") return answerB;
    if (choice === "C") return answerC;
    return answerD;
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
    const parsedScore = parsePositiveInt(score);

    if (
      !normalizedContentVN ||
      !normalizedContentEN ||
      !normalizedAnswerA ||
      !normalizedAnswerB ||
      !normalizedAnswerC ||
      !normalizedAnswerD ||
      !parsedScore
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin câu hỏi.");
      return;
    }

    const payload = {
      contentVN: normalizedContentVN,
      contentEN: normalizedContentEN,
      answerA: normalizedAnswerA,
      answerB: normalizedAnswerB,
      answerC: normalizedAnswerC,
      answerD: normalizedAnswerD,
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
      <DialogContent className="max-h-[94vh] sm:max-w-295">
        <DialogHeader>
          <DialogTitle>Cấu hình câu hỏi bài kiểm tra</DialogTitle>
          <DialogDescription>
            {lesson
              ? `Bài học: ${lesson.titleVN}`
              : "Thiết lập câu hỏi cho bài kiểm tra."}
          </DialogDescription>
        </DialogHeader>

        <div
          className={
            canManageQuestions
              ? "grid gap-4 md:grid-cols-[1.35fr_1fr]"
              : "grid gap-4 md:grid-cols-1"
          }
        >
          {canManageQuestions ? (
            <div className="order-2 space-y-3 rounded border border-greyscale-700 bg-greyscale-900 p-3 md:order-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-greyscale-0">
                  {editingQuestionId ? "Cập nhật câu hỏi" : "Thêm câu hỏi mới"}
                </p>
                <p className="text-xs text-greyscale-300">
                  Điền đầy đủ nội dung, 4 đáp án và chọn đáp án đúng.
                </p>
              </div>

              {editingQuestionId ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                >
                  Tạo mới
                </Button>
              ) : null}
            </div>

            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label htmlFor="quiz-question-content-vn">
                  Nội dung tiếng Việt
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
                  Nội dung tiếng Anh
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
                  <Label>Đáp án</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="quiz-question-score">Điểm:</Label>
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
                      className="grid grid-cols-[54px_minmax(0,1fr)] items-center"
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
                {editingQuestionId ? "Cập nhật câu hỏi" : "Thêm câu hỏi"}
              </Button>
            </div>
            </div>
          ) : null}

          <div className="order-1 space-y-3 rounded border border-greyscale-700 bg-greyscale-900 p-3 md:order-1">
            <div className="flex items-center justify-between gap-2 rounded border border-greyscale-700/70 bg-greyscale-800/60 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-greyscale-0">
                  Danh sách câu hỏi
                </p>
                <p className="text-xs text-greyscale-300">
                  {questions.length} câu hỏi | Tổng điểm: {totalScore}
                </p>
              </div>

              <div className="min-w-45">
                <Input
                  type="search"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="Tìm câu hỏi"
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
                  "Không thể tải danh sách câu hỏi."}
              </p>
            ) : null}

            {!quizQuestionsQuery.isLoading &&
            !quizQuestionsQuery.isError &&
            questions.length === 0 ? (
              <EmptyState title="Chưa có câu hỏi trong bài kiểm tra này." />
            ) : null}

            {!quizQuestionsQuery.isLoading &&
            !quizQuestionsQuery.isError &&
            questions.length > 0 &&
            filteredQuestions.length === 0 ? (
              <div className="rounded border border-greyscale-700 bg-greyscale-800 p-3 text-sm text-greyscale-200">
                Không tìm thấy câu hỏi phù hợp.
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
                          Câu {index + 1}
                        </p>
                        {isEditing ? (
                          <span className="rounded border border-primary-200/70 bg-primary-200/10 px-2 py-0.5 text-xs text-primary-200">
                            Đang sửa
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="rounded border border-secondary-200 px-2 py-0.5 text-xs text-secondary-200 bg-secondary-200/25">
                          Điểm: {question.score}
                        </span>
                      </div>
                    </div>

                    <p className="line-clamp-2 text-base font-medium text-greyscale-25">
                      {question.contentVN}
                    </p>
                    <p className="line-clamp-2 text-sm text-greyscale-200">
                      {question.contentEN}
                    </p>

                    <div className="grid gap-1 text-sm sm:grid-cols-2">
                      {(["A", "B", "C", "D"] as const).map((choice) => {
                        const answer =
                          choice === "A"
                            ? question.answerA
                            : choice === "B"
                              ? question.answerB
                              : choice === "C"
                                ? question.answerC
                                : question.answerD;
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
                            {choice}. {answer} {isCorrect ? "(Đúng)" : ""}
                          </p>
                        );
                      })}
                    </div>

                    {canManageQuestions ? (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="editIcon"
                          size="icon"
                          onClick={() => startEdit(question)}
                          disabled={isSaving}
                          title="Sửa câu hỏi"
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
                              title="Xóa câu hỏi"
                            >
                              <MdDeleteOutline size={16} />
                            </Button>
                          }
                          title="Xóa câu hỏi"
                          description="Bạn có chắc muốn xóa câu hỏi này?"
                          confirmText="Xóa"
                          cancelText="Hủy"
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
