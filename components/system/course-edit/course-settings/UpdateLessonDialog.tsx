"use client";

import React, { useEffect, useState } from "react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

import QuillEditor from "@/components/common/QuillEditor";
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
import { useGetAssignmentDetail, useUpdateAssignment } from "@/hooks/assignment/useAssignment";
import { useGetQuizDetail, useUpdateQuiz } from "@/hooks/quiz/useQuiz";
import { useGetTheoryDetail, useUpdateTheory } from "@/hooks/theory/useTheory";
import { useTranslations } from "@/providers/i18n-provider";
import { ApiError } from "@/types/api/common";
import { Lesson } from "@/validations/lesson/lesson";

type UpdateLessonDialogProps = {
  open: boolean;
  lesson: Lesson | null;
  onOpenChange: (open: boolean) => void;
};

export default function UpdateLessonDialog({
  open,
  lesson,
  onOpenChange,
}: UpdateLessonDialogProps) {
  const t = useTranslations("CourseManagement.CourseSettings.UpdateLessonDialog");
  const [theoryTitleVN, setTheoryTitleVN] = useState("");
  const [theoryTitleEN, setTheoryTitleEN] = useState("");
  const [theoryContentVN, setTheoryContentVN] = useState("");
  const [theoryContentEN, setTheoryContentEN] = useState("");
  const [theoryEstimatedTime, setTheoryEstimatedTime] = useState("");

  const [quizTitleVN, setQuizTitleVN] = useState("");
  const [quizTitleEN, setQuizTitleEN] = useState("");
  const [quizDescriptionVN, setQuizDescriptionVN] = useState("");
  const [quizDescriptionEN, setQuizDescriptionEN] = useState("");
  const [quizTimeLimit, setQuizTimeLimit] = useState("");
  const [quizTotalScore, setQuizTotalScore] = useState("");
  const [quizPassScore, setQuizPassScore] = useState("");

  const [assignmentTitleVN, setAssignmentTitleVN] = useState("");
  const [assignmentTitleEN, setAssignmentTitleEN] = useState("");
  const [assignmentDescriptionVN, setAssignmentDescriptionVN] = useState("");
  const [assignmentDescriptionEN, setAssignmentDescriptionEN] = useState("");
  const [assignmentRequirement, setAssignmentRequirement] = useState("");
  const [assignmentEstimatedTime, setAssignmentEstimatedTime] = useState("");

  const theoryId = open && lesson?.type === "THEORY" ? lesson.referenceID : undefined;
  const quizId = open && lesson?.type === "QUIZ" ? lesson.referenceID : undefined;
  const assignmentId = open && lesson?.type === "ASSIGNMENT" ? lesson.referenceID : undefined;

  const theoryDetailQuery = useGetTheoryDetail(theoryId);
  const quizDetailQuery = useGetQuizDetail(quizId);
  const assignmentDetailQuery = useGetAssignmentDetail(assignmentId);

  const updateTheoryMutation = useUpdateTheory({
    onSuccess: (data) => {
      toast.success(data.message);
      onOpenChange(false);
    },
    onError: (updateError) => {
      const axiosError = updateError as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("error.updateTheoryFailed"),
      );
    },
  });

  const updateQuizMutation = useUpdateQuiz({
    onSuccess: (data) => {
      toast.success(data.message);
      onOpenChange(false);
    },
    onError: (updateError) => {
      const axiosError = updateError as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("error.updateQuizFailed"),
      );
    },
  });

  const updateAssignmentMutation = useUpdateAssignment({
    onSuccess: (data) => {
      toast.success(data.message);
      onOpenChange(false);
    },
    onError: (updateError) => {
      const axiosError = updateError as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("error.updateAssignmentFailed"),
      );
    },
  });

  useEffect(() => {
    if (theoryDetailQuery.data && lesson?.type === "THEORY") {
      const detail = theoryDetailQuery.data;
      setTheoryTitleVN(detail.titleVN);
      setTheoryTitleEN(detail.titleEN);
      setTheoryContentVN(detail.contentVN);
      setTheoryContentEN(detail.contentEN);
      setTheoryEstimatedTime(String(detail.estimatedTime));
    }
  }, [lesson?.type, theoryDetailQuery.data]);

  useEffect(() => {
    if (quizDetailQuery.data && lesson?.type === "QUIZ") {
      const detail = quizDetailQuery.data;
      setQuizTitleVN(detail.titleVN);
      setQuizTitleEN(detail.titleEN);
      setQuizDescriptionVN(detail.descriptionVN);
      setQuizDescriptionEN(detail.descriptionEN);
      setQuizTimeLimit(String(detail.timeLimit));
      setQuizTotalScore(String(detail.totalScore));
      setQuizPassScore(String(detail.passScore));
    }
  }, [lesson?.type, quizDetailQuery.data]);

  useEffect(() => {
    if (assignmentDetailQuery.data && lesson?.type === "ASSIGNMENT") {
      const detail = assignmentDetailQuery.data;
      setAssignmentTitleVN(detail.titleVN);
      setAssignmentTitleEN(detail.titleEN);
      setAssignmentDescriptionVN(detail.descriptionVN);
      setAssignmentDescriptionEN(detail.descriptionEN);
      setAssignmentRequirement(detail.requirement);
      setAssignmentEstimatedTime(String(detail.estimatedTime));
    }
  }, [lesson?.type, assignmentDetailQuery.data]);

  const parsePositiveInt = (value: string) => {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue <= 0) {
      return null;
    }

    return numberValue;
  };

  const parseNonNegativeInt = (value: string) => {
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue < 0) {
      return null;
    }

    return numberValue;
  };

  const handleUpdateTheory = async () => {
    if (!lesson || lesson.type !== "THEORY") {
      return;
    }

    const normalizedTitleVN = theoryTitleVN.trim();
    const normalizedTitleEN = theoryTitleEN.trim();
    const normalizedContentVN = theoryContentVN.trim();
    const normalizedContentEN = theoryContentEN.trim();
    const parsedEstimatedTime = parsePositiveInt(theoryEstimatedTime);

    if (
      !normalizedTitleVN ||
      !normalizedTitleEN ||
      !normalizedContentVN ||
      !normalizedContentEN ||
      !parsedEstimatedTime
    ) {
      toast.error(t("error.missingTheory"));
      return;
    }

    await updateTheoryMutation.mutateAsync({
      theoryId: lesson.referenceID,
      moduleID: lesson.moduleID,
      payload: {
        titleVN: normalizedTitleVN,
        titleEN: normalizedTitleEN,
        contentVN: normalizedContentVN,
        contentEN: normalizedContentEN,
        estimatedTime: parsedEstimatedTime,
      },
    });
  };

  const handleUpdateQuiz = async () => {
    if (!lesson || lesson.type !== "QUIZ") {
      return;
    }

    const normalizedTitleVN = quizTitleVN.trim();
    const normalizedTitleEN = quizTitleEN.trim();
    const normalizedDescriptionVN = quizDescriptionVN.trim();
    const normalizedDescriptionEN = quizDescriptionEN.trim();
    const parsedTimeLimit = parsePositiveInt(quizTimeLimit);
    const parsedTotalScore = parsePositiveInt(quizTotalScore);
    const parsedPassScore = parseNonNegativeInt(quizPassScore);

    if (
      !normalizedTitleVN ||
      !normalizedTitleEN ||
      !normalizedDescriptionVN ||
      !normalizedDescriptionEN ||
      !parsedTimeLimit ||
      !parsedTotalScore ||
      parsedPassScore === null
    ) {
      toast.error(t("error.missingQuiz"));
      return;
    }

    if (parsedPassScore > parsedTotalScore) {
      toast.error(t("error.invalidPassScore"));
      return;
    }

    await updateQuizMutation.mutateAsync({
      quizId: lesson.referenceID,
      moduleID: lesson.moduleID,
      payload: {
        titleVN: normalizedTitleVN,
        titleEN: normalizedTitleEN,
        descriptionVN: normalizedDescriptionVN,
        descriptionEN: normalizedDescriptionEN,
        timeLimit: parsedTimeLimit,
        totalScore: parsedTotalScore,
        passScore: parsedPassScore,
      },
    });
  };

  const handleUpdateAssignment = async () => {
    if (!lesson || lesson.type !== "ASSIGNMENT") {
      return;
    }

    const normalizedTitleVN = assignmentTitleVN.trim();
    const normalizedTitleEN = assignmentTitleEN.trim();
    const normalizedDescriptionVN = assignmentDescriptionVN.trim();
    const normalizedDescriptionEN = assignmentDescriptionEN.trim();
    const normalizedRequirement = assignmentRequirement.trim();
    const parsedEstimatedTime = parsePositiveInt(assignmentEstimatedTime);

    if (
      !normalizedTitleVN ||
      !normalizedTitleEN ||
      !normalizedDescriptionVN ||
      !normalizedDescriptionEN ||
      !normalizedRequirement ||
      !parsedEstimatedTime
    ) {
      toast.error(t("error.missingAssignment"));
      return;
    }

    await updateAssignmentMutation.mutateAsync({
      assignmentId: lesson.referenceID,
      moduleID: lesson.moduleID,
      payload: {
        titleVN: normalizedTitleVN,
        titleEN: normalizedTitleEN,
        descriptionVN: normalizedDescriptionVN,
        descriptionEN: normalizedDescriptionEN,
        requirement: normalizedRequirement,
        estimatedTime: parsedEstimatedTime,
      },
    });
  };

  const isSaving = updateTheoryMutation.isPending || updateQuizMutation.isPending || updateAssignmentMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isSaving) {
          return;
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {lesson?.type === "THEORY"
              ? t("subtitle.theory")
              : lesson?.type === "QUIZ"
                ? t("subtitle.quiz")
                : t("subtitle.assignment")}
          </DialogDescription>
        </DialogHeader>

        {lesson?.type === "THEORY" ? (
          <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
            {theoryDetailQuery.isLoading ? (
              <div className="flex items-center justify-center py-3">
                <Spinner className="h-5 w-5" />
              </div>
            ) : null}

            {theoryDetailQuery.data ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-theory-title-vn">{t("fields.titleVN")}</Label>
                    <Input
                      id="edit-theory-title-vn"
                      value={theoryTitleVN}
                      onChange={(event) => setTheoryTitleVN(event.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-theory-title-en">{t("fields.titleEN")}</Label>
                    <Input
                      id="edit-theory-title-en"
                      value={theoryTitleEN}
                      onChange={(event) => setTheoryTitleEN(event.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <QuillEditor
                  id="edit-theory-content-vn"
                  label={t("fields.theoryContentVN")}
                  value={theoryContentVN}
                  onChange={setTheoryContentVN}
                  readOnly={isSaving}
                  minHeight={160}
                />

                <QuillEditor
                  id="edit-theory-content-en"
                  label={t("fields.theoryContentEN")}
                  value={theoryContentEN}
                  onChange={setTheoryContentEN}
                  readOnly={isSaving}
                  minHeight={160}
                />

                <div className="space-y-2">
                  <Label htmlFor="edit-theory-estimated-time">{t("fields.estimatedTime")}</Label>
                  <Input
                    id="edit-theory-estimated-time"
                    type="number"
                    min={1}
                    value={theoryEstimatedTime}
                    onChange={(event) => setTheoryEstimatedTime(event.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {lesson?.type === "QUIZ" ? (
          <div className="space-y-4">
            {quizDetailQuery.isLoading ? (
              <div className="flex items-center justify-center py-3">
                <Spinner className="h-5 w-5" />
              </div>
            ) : null}

            {quizDetailQuery.data ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-quiz-title-vn">{t("fields.titleVN")}</Label>
                    <Input
                      id="edit-quiz-title-vn"
                      value={quizTitleVN}
                      onChange={(event) => setQuizTitleVN(event.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-quiz-title-en">{t("fields.titleEN")}</Label>
                    <Input
                      id="edit-quiz-title-en"
                      value={quizTitleEN}
                      onChange={(event) => setQuizTitleEN(event.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-quiz-description-vn">{t("fields.quizDescriptionVN")}</Label>
                  <Textarea
                    id="edit-quiz-description-vn"
                    value={quizDescriptionVN}
                    onChange={(event) => setQuizDescriptionVN(event.target.value)}
                    disabled={isSaving}
                    className="border-greyscale-700 bg-greyscale-800 text-greyscale-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-quiz-description-en">{t("fields.quizDescriptionEN")}</Label>
                  <Textarea
                    id="edit-quiz-description-en"
                    value={quizDescriptionEN}
                    onChange={(event) => setQuizDescriptionEN(event.target.value)}
                    disabled={isSaving}
                    className="border-greyscale-700 bg-greyscale-800 text-greyscale-0"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-quiz-time-limit">{t("fields.quizTimeLimit")}</Label>
                    <Input
                      id="edit-quiz-time-limit"
                      type="number"
                      min={1}
                      value={quizTimeLimit}
                      onChange={(event) => setQuizTimeLimit(event.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-quiz-total-score">{t("fields.quizTotalScore")}</Label>
                    <Input
                      id="edit-quiz-total-score"
                      type="number"
                      min={1}
                      value={quizTotalScore}
                      onChange={(event) => setQuizTotalScore(event.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-quiz-pass-score">{t("fields.quizPassScore")}</Label>
                    <Input
                      id="edit-quiz-pass-score"
                      type="number"
                      min={0}
                      value={quizPassScore}
                      onChange={(event) => setQuizPassScore(event.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {lesson?.type === "ASSIGNMENT" ? (
          <div className="space-y-4">
            {assignmentDetailQuery.isLoading ? (
              <div className="flex items-center justify-center py-3">
                <Spinner className="h-5 w-5" />
              </div>
            ) : null}

            {assignmentDetailQuery.data ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-assignment-title-vn">{t("fields.titleVN")}</Label>
                    <Input
                      id="edit-assignment-title-vn"
                      value={assignmentTitleVN}
                      onChange={(event) => setAssignmentTitleVN(event.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-assignment-title-en">{t("fields.titleEN")}</Label>
                    <Input
                      id="edit-assignment-title-en"
                      value={assignmentTitleEN}
                      onChange={(event) => setAssignmentTitleEN(event.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-assignment-description-vn">{t("fields.assignmentDescriptionVN")}</Label>
                  <Textarea
                    id="edit-assignment-description-vn"
                    value={assignmentDescriptionVN}
                    onChange={(event) => setAssignmentDescriptionVN(event.target.value)}
                    disabled={isSaving}
                    className="border-greyscale-700 bg-greyscale-800 text-greyscale-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-assignment-description-en">{t("fields.assignmentDescriptionEN")}</Label>
                  <Textarea
                    id="edit-assignment-description-en"
                    value={assignmentDescriptionEN}
                    onChange={(event) => setAssignmentDescriptionEN(event.target.value)}
                    disabled={isSaving}
                    className="border-greyscale-700 bg-greyscale-800 text-greyscale-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-assignment-requirement">{t("fields.assignmentRequirement")}</Label>
                  <Textarea
                    id="edit-assignment-requirement"
                    value={assignmentRequirement}
                    onChange={(event) => setAssignmentRequirement(event.target.value)}
                    disabled={isSaving}
                    className="border-greyscale-700 bg-greyscale-800 text-greyscale-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-assignment-estimated-time">{t("fields.estimatedTime")}</Label>
                  <Input
                    id="edit-assignment-estimated-time"
                    type="number"
                    min={1}
                    value={assignmentEstimatedTime}
                    onChange={(event) => setAssignmentEstimatedTime(event.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t("buttons.cancel")}
          </Button>

          <Button
            onClick={() => {
              if (lesson?.type === "THEORY") {
                void handleUpdateTheory();
                return;
              }

              if (lesson?.type === "QUIZ") {
                void handleUpdateQuiz();
                return;
              }

              if (lesson?.type === "ASSIGNMENT") {
                void handleUpdateAssignment();
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? <Spinner className="h-4 w-4" /> : null}
            {t("buttons.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { UpdateLessonDialogProps };
