"use client";

import React from "react";

import { Spinner } from "@/components/ui/spinner";
import { useGetTheoryDetail } from "@/hooks/theory/useTheory";
import { useLocale } from "@/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { FaRegCheckCircle } from "react-icons/fa";

type MemberTheoryLessonContentProps = {
  referenceId: string;
};

export default function MemberTheoryLessonContent({
  referenceId,
}: MemberTheoryLessonContentProps) {
  const locale = useLocale();
  const theoryDetailQuery = useGetTheoryDetail(referenceId);

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
        <Button icon={<FaRegCheckCircle />}>Hoàn thành</Button>
      </div>
    </div>
  );
}

export type { MemberTheoryLessonContentProps };
