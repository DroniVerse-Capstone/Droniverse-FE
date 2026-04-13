"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetLab } from "@/hooks/lab/useLabs";
import { useLocale } from "@/providers/i18n-provider";

type MemberLabLessonContentProps = {
  referenceId: string;
};

export default function MemberLabLessonContent({
  referenceId,
}: MemberLabLessonContentProps) {
  const locale = useLocale();
  const router = useRouter();
  const labDetailQuery = useGetLab(referenceId);

  if (labDetailQuery.isLoading) {
    return (
      <div className="mx-auto flex min-h-40 w-full max-w-4xl items-center justify-center rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (labDetailQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6 text-sm text-warning">
        Không tải được thông tin bài lab.
      </div>
    );
  }

  if (!labDetailQuery.data) {
    return null;
  }

  const lab = labDetailQuery.data;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 rounded border border-greyscale-700 bg-greyscale-900/60 p-6">
      <h2 className="text-xl font-semibold text-greyscale-0">
        {locale === "en" ? lab.nameEN || lab.nameVN : lab.nameVN || lab.nameEN}
      </h2>

      <p className="text-sm text-greyscale-100">
        {locale === "en"
          ? lab.descriptionEN || lab.descriptionVN
          : lab.descriptionVN || lab.descriptionEN}
      </p>

      <Button
        type="button"
        variant="secondary"
        onClick={() => router.push(`/map-editor?id=${lab.labID || referenceId}`)}
      >
        {locale === "en" ? "Open lab" : "Vào bài lab"}
      </Button>
    </div>
  );
}

export type { MemberLabLessonContentProps };