"use client";

import React from "react";
import { MdOutlineTimer } from "react-icons/md";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useGetQuizDetail } from "@/hooks/quiz/useQuiz";
import { useGetTheoryDetail } from "@/hooks/theory/useTheory";
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
  const theoryId =
    open && lesson?.type === "THEORY" ? lesson.referenceID : undefined;
  const quizId =
    open && lesson?.type === "QUIZ" ? lesson.referenceID : undefined;

  const theoryDetailQuery = useGetTheoryDetail(theoryId);
  const quizDetailQuery = useGetQuizDetail(quizId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Xem chi tiết bài học</DialogTitle>
          <DialogDescription>
            {lesson?.type === "THEORY"
              ? "Chi tiết bài lý thuyết"
              : "Chi tiết bài kiểm tra"}
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
                    "Không thể tải chi tiết bài lý thuyết."}
                </p>
              ) : null}

              {theoryDetailQuery.data ? (
                <>
                  <div className="rounded border border-greyscale-700 bg-greyscale-900 p-4">
                    <p className="text-sm tracking-wide text-greyscale-200">
                      Tiêu đề (Tiếng Việt)
                    </p>
                    <p className="text-base font-medium text-greyscale-25">
                      {theoryDetailQuery.data.titleVN}
                    </p>

                    <p className="mt-3 text-sm tracking-wide text-greyscale-200">
                      Tiêu đề (Tiếng Anh)
                    </p>
                    <p className="text-base font-medium text-greyscale-25">
                      {theoryDetailQuery.data.titleEN}
                    </p>

                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1 rounded border border-tertiary/40 bg-tertiary/15 px-2 py-1 text-xs font-medium text-tertiary">
                        <MdOutlineTimer size={14} />
                        {theoryDetailQuery.data.estimatedTime} phút
                      </span>
                    </div>
                  </div>

                  <div className="rounded border border-greyscale-700 bg-greyscale-900 p-4">
                    <p className="mb-2 text-sm font-medium text-greyscale-200">
                      Nội dung tiếng Việt
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
                      Nội dung tiếng Anh
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
                    "Không thể tải chi tiết bài kiểm tra."}
                </p>
              ) : null}

              {quizDetailQuery.data ? (
                <>
                  <div className="rounded border border-greyscale-700 bg-greyscale-900 p-4">
                    <p className="text-sm tracking-wide text-greyscale-200">
                      Tiêu đề (Tiếng Việt)
                    </p>
                    <p className="text-base font-medium text-greyscale-25">
                      {quizDetailQuery.data.titleVN}
                    </p>

                    <p className="mt-3 text-sm tracking-wide text-greyscale-200">
                      Tiêu đề (Tiếng Anh)
                    </p>
                    <p className="text-base font-medium text-greyscale-25">
                      {quizDetailQuery.data.titleEN}
                    </p>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded border border-tertiary/40 bg-tertiary/15 px-2 py-1 text-xs font-medium text-tertiary">
                        <MdOutlineTimer size={14} />
                        Thời gian: {quizDetailQuery.data.timeLimit} phút
                      </span>
                      <span className="inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/15 px-2 py-1 text-xs font-medium text-primary">
                        <FaRegStar size={14} />
                        Điểm tối đa: {quizDetailQuery.data.totalScore}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded border border-warning/40 bg-warning/15 px-2 py-1 text-xs font-medium text-warning">
                       <RiVerifiedBadgeLine size={14} />
                        Điểm đạt: {quizDetailQuery.data.passScore}
                      </span>
                    </div>
                  </div>

                  <div className="rounded border border-greyscale-700 bg-greyscale-900 p-4">
                    <p className="mb-2 text-sm font-medium text-greyscale-200">
                      Mô tả tiếng Việt
                    </p>
                    <p className="text-base text-greyscale-25">
                      {quizDetailQuery.data.descriptionVN}
                    </p>
                  </div>

                  <div className="rounded border border-greyscale-700 bg-greyscale-900 p-4">
                    <p className="mb-2 text-xs font-medium text-greyscale-200">
                      Mô tả tiếng Anh
                    </p>
                    <p className="text-base text-greyscale-25">
                      {quizDetailQuery.data.descriptionEN}
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
