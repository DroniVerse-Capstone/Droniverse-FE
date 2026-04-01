"use client";

import React from "react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { MdOutlineAddCircleOutline } from "react-icons/md";

import CommonDropdown, {
  CommonDropdownOption,
} from "@/components/common/CommonDropdown";
import QuillEditor from "@/components/common/QuillEditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCreateQuiz } from "@/hooks/quiz/useQuiz";
import { useCreateTheory } from "@/hooks/theory/useTheory";
import { ApiError } from "@/types/api/common";
import { Lesson, LessonType } from "@/validations/lesson/lesson";
import { useTranslations } from "@/providers/i18n-provider";

type CreateLessonDialogProps = {
  moduleId: string;
  lessons: Lesson[];
};

export default function CreateLessonDialog({
  moduleId,
  lessons,
}: CreateLessonDialogProps) {
  const t = useTranslations("CourseManagement.CourseSettings.CreateLessonDialog");
  const [open, setOpen] = React.useState(false);
  const [lessonType, setLessonType] = React.useState<LessonType>("THEORY");

  const [titleVN, setTitleVN] = React.useState("");
  const [titleEN, setTitleEN] = React.useState("");
  const [estimatedTime, setEstimatedTime] = React.useState("");
  const [contentVN, setContentVN] = React.useState("");
  const [contentEN, setContentEN] = React.useState("");
  const [descriptionVN, setDescriptionVN] = React.useState("");
  const [descriptionEN, setDescriptionEN] = React.useState("");
  const [timeLimit, setTimeLimit] = React.useState("");
  const [totalScore, setTotalScore] = React.useState("");
  const [passScore, setPassScore] = React.useState("");

  const createTheoryMutation = useCreateTheory({
    onSuccess: (data) => {
      toast.success(data.message);
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("error.createTheoryFailed"),
      );
    },
  });

  const createQuizMutation = useCreateQuiz({
    onSuccess: (data) => {
      toast.success(data.message);
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.message ||
          t("error.createQuizFailed"),
      );
    },
  });

  const lessonTypeOptions: CommonDropdownOption[] = [
    { value: "THEORY", label: t("lessonTypes.theory") },
    { value: "QUIZ", label: t("lessonTypes.quiz") },
    { value: "LAB", label: t("lessonTypes.lab") },
  ];

  const isSubmitting =
    createTheoryMutation.isPending || createQuizMutation.isPending;

  const nextOrderIndex =
    lessons.length > 0
      ? Math.max(...lessons.map((lesson) => lesson.orderIndex)) + 1
      : 1;

  function resetForm() {
    setLessonType("THEORY");
    setTitleVN("");
    setTitleEN("");
    setEstimatedTime("");
    setContentVN("");
    setContentEN("");
    setDescriptionVN("");
    setDescriptionEN("");
    setTimeLimit("");
    setTotalScore("");
    setPassScore("");
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;

    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

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

  const handleSubmit = async () => {
    const normalizedTitleVN = titleVN.trim();
    const normalizedTitleEN = titleEN.trim();

    if (!normalizedTitleVN || !normalizedTitleEN) {
      toast.error(t("error.missingTitle"));
      return;
    }

    if (lessonType === "THEORY") {
      const normalizedContentVN = contentVN.trim();
      const normalizedContentEN = contentEN.trim();
      const parsedEstimatedTime = parsePositiveInt(estimatedTime);

      if (!normalizedContentVN || !normalizedContentEN || !parsedEstimatedTime) {
        toast.error(t("error.missingTheory"));
        return;
      }

      await createTheoryMutation.mutateAsync({
        moduleID: moduleId,
        orderIndex: nextOrderIndex,
        titleVN: normalizedTitleVN,
        titleEN: normalizedTitleEN,
        contentVN: normalizedContentVN,
        contentEN: normalizedContentEN,
        estimatedTime: parsedEstimatedTime,
      });

      return;
    }

    if (lessonType === "QUIZ") {
      const normalizedDescriptionVN = descriptionVN.trim();
      const normalizedDescriptionEN = descriptionEN.trim();
      const parsedTimeLimit = parsePositiveInt(timeLimit);
      const parsedTotalScore = parsePositiveInt(totalScore);
      const parsedPassScore = parseNonNegativeInt(passScore);

      if (
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

      await createQuizMutation.mutateAsync({
        moduleID: moduleId,
        orderIndex: nextOrderIndex,
        titleVN: normalizedTitleVN,
        titleEN: normalizedTitleEN,
        descriptionVN: normalizedDescriptionVN,
        descriptionEN: normalizedDescriptionEN,
        timeLimit: parsedTimeLimit,
        totalScore: parsedTotalScore,
        passScore: parsedPassScore,
      });

      return;
    }

    toast(t("toast.labComingSoon"));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button icon={<MdOutlineAddCircleOutline size={18} />} variant="secondary">
          {t("buttons.createLesson")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("subtitle").replace("{orderIndex}", String(nextOrderIndex))}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto py-2 pr-1">
          <CommonDropdown
            label={t("lessonType")}
            options={lessonTypeOptions}
            value={lessonType}
            onChange={(value) => setLessonType(value as LessonType)}
            placeholder={t("lessonTypePlaceholder")}
            disabled={isSubmitting}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="create-lesson-title-vn">{t("fields.titleVN")}</Label>
              <Input
                id="create-lesson-title-vn"
                value={titleVN}
                onChange={(event) => setTitleVN(event.target.value)}
                placeholder={t("fields.titleVNPlaceholder")}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-lesson-title-en">{t("fields.titleEN")}</Label>
              <Input
                id="create-lesson-title-en"
                value={titleEN}
                onChange={(event) => setTitleEN(event.target.value)}
                placeholder={t("fields.titleENPlaceholder")}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {lessonType === "THEORY" ? (
            <div className="space-y-4">
              <QuillEditor
                id="create-theory-content-vn"
                label={t("fields.theoryContentVN")}
                value={contentVN}
                onChange={setContentVN}
                placeholder={t("fields.theoryContentVNPlaceholder")}
                readOnly={isSubmitting}
                minHeight={200}
              />

              <QuillEditor
                id="create-theory-content-en"
                label={t("fields.theoryContentEN")}
                value={contentEN}
                onChange={setContentEN}
                placeholder={t("fields.theoryContentENPlaceholder")}
                readOnly={isSubmitting}
                minHeight={200}
              />

              <div className="space-y-2">
                <Label htmlFor="create-theory-estimated-time">{t("fields.estimatedTime")}</Label>
                <Input
                  id="create-theory-estimated-time"
                  type="number"
                  min={1}
                  value={estimatedTime}
                  onChange={(event) => setEstimatedTime(event.target.value)}
                  placeholder={t("fields.estimatedTimePlaceholder")}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          ) : null}

          {lessonType === "QUIZ" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-quiz-description-vn">{t("fields.quizDescriptionVN")}</Label>
                <Textarea
                  id="create-quiz-description-vn"
                  value={descriptionVN}
                  onChange={(event) => setDescriptionVN(event.target.value)}
                  placeholder={t("fields.quizDescriptionVNPlaceholder")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-quiz-description-en">{t("fields.quizDescriptionEN")}</Label>
                <Textarea
                  id="create-quiz-description-en"
                  value={descriptionEN}
                  onChange={(event) => setDescriptionEN(event.target.value)}
                  placeholder={t("fields.quizDescriptionENPlaceholder")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="create-quiz-time-limit">{t("fields.quizTimeLimit")}</Label>
                  <Input
                    id="create-quiz-time-limit"
                    type="number"
                    min={1}
                    value={timeLimit}
                    onChange={(event) => setTimeLimit(event.target.value)}
                    placeholder={t("fields.quizTimeLimitPlaceholder")}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-quiz-total-score">{t("fields.quizTotalScore")}</Label>
                  <Input
                    id="create-quiz-total-score"
                    type="number"
                    min={1}
                    value={totalScore}
                    onChange={(event) => setTotalScore(event.target.value)}
                    placeholder={t("fields.quizTotalScorePlaceholder")}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-quiz-pass-score">{t("fields.quizPassScore")}</Label>
                  <Input
                    id="create-quiz-pass-score"
                    type="number"
                    min={0}
                    value={passScore}
                    onChange={(event) => setPassScore(event.target.value)}
                    placeholder={t("fields.quizPassScorePlaceholder")}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {lessonType === "LAB" ? (
            <div className="rounded border border-greyscale-700 bg-greyscale-900/70 p-3 text-sm text-greyscale-200">
              {t("toast.labComingSoon")}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              {t("buttons.cancel")}
            </Button>
          </DialogClose>

          <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="h-4 w-4" /> : null}
            {t("buttons.createLesson")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { CreateLessonDialogProps };
