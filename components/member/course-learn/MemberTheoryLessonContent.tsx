"use client";

import React from "react";
import toast from "react-hot-toast";

import { Spinner } from "@/components/ui/spinner";
import { useCompleteUserLesson } from "@/hooks/learning/useUserLearning";
import { useGetTheoryDetail } from "@/hooks/theory/useTheory";
import { useLocale } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { FaRegCheckCircle } from "react-icons/fa";

type MemberTheoryLessonContentProps = {
  referenceId: string;
  enrollmentId?: string;
  lessonId: string;
  isCompleted: boolean;
};

export default function MemberTheoryLessonContent({
  referenceId,
  enrollmentId,
  lessonId,
  isCompleted,
}: MemberTheoryLessonContentProps) {
  const locale = useLocale();
  const theoryDetailQuery = useGetTheoryDetail(referenceId);
  const completeLessonMutation = useCompleteUserLesson();
  const [completed, setCompleted] = React.useState(isCompleted);

  React.useEffect(() => {
    setCompleted(isCompleted);
  }, [isCompleted]);

  const handleCompleteLesson = async () => {
    if (!enrollmentId || completed || completeLessonMutation.isPending) {
      return;
    }

    try {
      await completeLessonMutation.mutateAsync({
        enrollmentId,
        lessonId,
      });
      setCompleted(true);
      toast.success("Hoàn thành bài học thành công.");
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Không thể hoàn thành bài học. Vui lòng thử lại.";
      toast.error(message);
    }
  };

  if (theoryDetailQuery.isLoading) {
    return (
      <div className="mx-auto flex min-h-40 w-full max-w-4xl items-center justify-center rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (theoryDetailQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6 text-sm text-warning">
        {theoryDetailQuery.error.response?.data?.message ||
          theoryDetailQuery.error.message ||
          "Không tải được nội dung bài lý thuyết."}
      </div>
    );
  }

  if (!theoryDetailQuery.data) {
    return null;
  }

  const theory = theoryDetailQuery.data;
  const content = locale === "en" ? theory.contentEN : theory.contentVN;

  return (
    <div className="mx-auto w-full space-y-4 rounded border border-greyscale-700 bg-greyscale-900/60 p-6">
      <h2 className="text-xl font-semibold text-greyscale-0">
        {locale === "en" ? theory.titleEN : theory.titleVN}
      </h2>

      <div
        className="dv-quill-render ql-editor"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className="flex w-full justify-end">
        <Button
          icon={<FaRegCheckCircle />}
          disabled={completed || completeLessonMutation.isPending || !enrollmentId}
          onClick={handleCompleteLesson}
        >
          {completed
            ? "Đã hoàn thành"
            : completeLessonMutation.isPending
              ? <Spinner />
              : "Hoàn thành"}
        </Button>
      </div>
    </div>
  );
}

export type { MemberTheoryLessonContentProps };
