"use client";

import React from "react";
import { MdOutlineTimer } from "react-icons/md";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetLab } from "@/hooks/lab/useLabs";
import { useGetQuizDetail } from "@/hooks/quiz/useQuiz";
import { useGetTheoryDetail } from "@/hooks/theory/useTheory";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { Lesson } from "@/validations/lesson/lesson";
import { RiVerifiedBadgeLine } from "react-icons/ri";
import { FaRegStar } from "react-icons/fa";

type LessonDetailDialogProps = {
  open: boolean;
  lesson: Lesson | null;
  onOpenChange: (open: boolean) => void;
};

export default function LessonDetailDialog({
  open,
  lesson,
  onOpenChange,
}: LessonDetailDialogProps) {
  const t = useTranslations("CourseManagement.CourseSettings.LessonDetailDialog");
  const locale = useLocale();
  const router = useRouter();
  const theoryId =
    open && lesson?.type === "THEORY" ? lesson.referenceID : undefined;
  const quizId =
    open && lesson?.type === "QUIZ" ? lesson.referenceID : undefined;
  const labId = open && lesson?.type === "LAB" ? lesson.referenceID : null;

  const theoryDetailQuery = useGetTheoryDetail(theoryId);
  const quizDetailQuery = useGetQuizDetail(quizId);
  const labDetailQuery = useGetLab(labId);

  const levelLabelMap = {
    EASY: { vi: "Cơ bản", en: "Easy" },
    MEDIUM: { vi: "Trung bình", en: "Medium" },
    HARD: { vi: "Nâng cao", en: "Hard" },
  } as const;

  const levelBadgeClassMap = {
    EASY: "bg-secondary/15 text-secondary border border-secondary/40",
    MEDIUM: "bg-warning/15 text-warning border border-warning/40",
    HARD: "bg-primary/15 text-primary border border-primary/40",
  } as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {lesson?.type === "THEORY"
              ? t("subtitle.theory")
              : lesson?.type === "QUIZ"
                ? t("subtitle.quiz")
                : t("subtitle.lab")}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[72vh] space-y-4 overflow-y-auto pr-1">
          {lesson?.type === "THEORY" ? (
            <div className="space-y-4">
              {theoryDetailQuery.isLoading ? (
                <div className="flex items-center justify-center py-3">
                  <Spinner className="h-5 w-5" />
                </div>
              ) : null}

              {theoryDetailQuery.isError ? (
                <p className="text-sm text-warning">
                  {theoryDetailQuery.error.response?.data?.message ||
                    theoryDetailQuery.error.message ||
                    t("error.loadTheoryFailed")}
                </p>
              ) : null}

              {theoryDetailQuery.data ? (
                <>
                  <div className="rounded border border-greyscale-700 bg-greyscale-900 p-4">
                    <p className="text-sm tracking-wide text-greyscale-200">
                      {t("fields.titleVN")}
                    </p>
                    <p className="text-base font-medium text-greyscale-25">
                      {theoryDetailQuery.data.titleVN}
                    </p>

                    <p className="mt-3 text-sm tracking-wide text-greyscale-200">
                      {t("fields.titleEN")}
                    </p>
                    <p className="text-base font-medium text-greyscale-25">
                      {theoryDetailQuery.data.titleEN}
                    </p>

                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1 rounded border border-tertiary/40 bg-tertiary/15 px-2 py-1 text-xs font-medium text-tertiary">
                        <MdOutlineTimer size={14} />
                        {t("fields.estimatedTime").replace(
                          "{value}",
                          String(theoryDetailQuery.data.estimatedTime)
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="rounded border border-greyscale-700 bg-greyscale-900 p-4">
                    <p className="mb-2 text-sm font-medium text-greyscale-200">
                      {t("fields.theoryContentVN")}
                    </p>
                    <div
                      className="dv-quill-render ql-editor"
                      dangerouslySetInnerHTML={{
                        __html: theoryDetailQuery.data.contentVN,
                      }}
                    />
                  </div>

                  <div className="rounded border border-greyscale-700 bg-greyscale-900 p-4">
                    <p className="mb-2 text-sm font-medium text-greyscale-200">
                      {t("fields.theoryContentEN")}
                    </p>
                    <div
                      className="dv-quill-render ql-editor"
                      dangerouslySetInnerHTML={{
                        __html: theoryDetailQuery.data.contentEN,
                      }}
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

              {quizDetailQuery.isError ? (
                <p className="text-sm text-warning">
                  {quizDetailQuery.error.response?.data?.message ||
                    quizDetailQuery.error.message ||
                    t("error.loadQuizFailed")}
                </p>
              ) : null}

              {quizDetailQuery.data ? (
                <>
                  <div className="rounded border border-greyscale-700 bg-greyscale-900 p-4">
                    <p className="text-sm tracking-wide text-greyscale-200">
                      {t("fields.titleVN")}
                    </p>
                    <p className="text-base font-medium text-greyscale-25">
                      {quizDetailQuery.data.titleVN}
                    </p>

                    <p className="mt-3 text-sm tracking-wide text-greyscale-200">
                      {t("fields.titleEN")}
                    </p>
                    <p className="text-base font-medium text-greyscale-25">
                      {quizDetailQuery.data.titleEN}
                    </p>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded border border-tertiary/40 bg-tertiary/15 px-2 py-1 text-xs font-medium text-tertiary">
                        <MdOutlineTimer size={14} />
                        {t("fields.timeLimit").replace(
                          "{value}",
                          String(quizDetailQuery.data.timeLimit)
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/15 px-2 py-1 text-xs font-medium text-primary">
                        <FaRegStar size={14} />
                        {t("fields.maxScore").replace(
                          "{value}",
                          String(quizDetailQuery.data.totalScore)
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded border border-warning/40 bg-warning/15 px-2 py-1 text-xs font-medium text-warning">
                       <RiVerifiedBadgeLine size={14} />
                        {t("fields.passScore").replace(
                          "{value}",
                          String(quizDetailQuery.data.passScore)
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="rounded border border-greyscale-700 bg-greyscale-900 p-4">
                    <p className="mb-2 text-sm font-medium text-greyscale-200">
                      {t("fields.quizDescriptionVN")}
                    </p>
                    <p className="text-base text-greyscale-25">
                      {quizDetailQuery.data.descriptionVN}
                    </p>
                  </div>

                  <div className="rounded border border-greyscale-700 bg-greyscale-900 p-4">
                    <p className="mb-2 text-xs font-medium text-greyscale-200">
                      {t("fields.quizDescriptionEN")}
                    </p>
                    <p className="text-base text-greyscale-25">
                      {quizDetailQuery.data.descriptionEN}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {lesson?.type === "LAB" ? (
            <div className="space-y-4">
              {labDetailQuery.isLoading ? (
                <div className="flex items-center justify-center py-3">
                  <Spinner className="h-5 w-5" />
                </div>
              ) : null}

              {labDetailQuery.isError ? (
                <p className="text-sm text-warning">
                  {t("error.loadLabFailed")}
                </p>
              ) : null}

              {labDetailQuery.data ? (
                <>
                  {(() => {
                    const labLevel = labDetailQuery.data.level;
                    const levelLabel =
                      locale === "en"
                        ? levelLabelMap[labLevel]?.en || labLevel
                        : levelLabelMap[labLevel]?.vi || labLevel;
                    const levelBadgeClass = levelBadgeClassMap[labLevel];

                    return (
                  <div className="rounded border border-greyscale-700 bg-greyscale-900 p-4">
                    <p className="text-sm tracking-wide text-greyscale-200">
                      {t("fields.titleVN")}
                    </p>
                    <p className="text-base font-medium text-greyscale-25">
                      {labDetailQuery.data.nameVN}
                    </p>

                    <p className="mt-3 text-sm tracking-wide text-greyscale-200">
                      {t("fields.titleEN")}
                    </p>
                    <p className="text-base font-medium text-greyscale-25">
                      {labDetailQuery.data.nameEN || "-"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${levelBadgeClass}`}
                      >
                        {t("fields.labLevel")}: {levelLabel}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-tertiary/15 text-tertiary border border-tertiary/40`}>
                         {labDetailQuery.data.estimatedTime} {locale === "en" ? "minutes" : "phút"}
                      </span>
                    </div>

                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          router.push(`/map-editor?id=${labDetailQuery.data?.labID || lesson?.referenceID}`);
                        }}
                      >
                        {locale === "en" ? "View Lab" : "Xem bài lab"}
                      </Button>
                    </div>
                  </div>
                    );
                  })()}

                  <div className="rounded border border-greyscale-700 bg-greyscale-900 p-4">
                    <p className="mb-2 text-sm font-medium text-greyscale-200">
                      {t("fields.quizDescriptionVN")}
                    </p>
                    <p className="text-base text-greyscale-25">
                      {labDetailQuery.data.descriptionVN || "-"}
                    </p>
                  </div>

                  <div className="rounded border border-greyscale-700 bg-greyscale-900 p-4">
                    <p className="mb-2 text-xs font-medium text-greyscale-200">
                      {t("fields.quizDescriptionEN")}
                    </p>
                    <p className="text-base text-greyscale-25">
                      {labDetailQuery.data.descriptionEN || "-"}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { LessonDetailDialogProps };
