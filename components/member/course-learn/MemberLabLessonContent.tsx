"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { FaClock, FaSignal } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetUserLabMini } from "@/hooks/learning/useUserLearning";
import { useLocale } from "@/providers/i18n-provider";
import { TbDrone } from "react-icons/tb";

type MemberLabLessonContentProps = {
  referenceId: string;
  enrollmentId?: string;
};

export default function MemberLabLessonContent({
  referenceId,
  enrollmentId,
}: MemberLabLessonContentProps) {
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ clubSlug?: string }>();
  const labDetailQuery = useGetUserLabMini(
    enrollmentId
      ? {
        enrollmentId,
        labId: referenceId,
      }
      : undefined,
  );

  console.log("hello", labDetailQuery)

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

  const lab = labDetailQuery.data.lab;
  const canOpenLab = Boolean(enrollmentId && params?.clubSlug);
  const levelLabelMap = {
    EASY: { vi: "Cơ bản", en: "Easy" },
    MEDIUM: { vi: "Trung bình", en: "Medium" },
    HARD: { vi: "Nâng cao", en: "HARD" },
  } as const;
  const levelConfig = levelLabelMap[lab.level as keyof typeof levelLabelMap];
  const levelLabel =
    (levelConfig ? (locale === "en" ? levelConfig.en : levelConfig.vi) : undefined) ||
    lab.level;

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded border border-greyscale-700/90 bg-greyscale-900/70 p-6 shadow-[0_16px_50px_-24px_rgba(0,0,0,0.85)] backdrop-blur-sm">
      <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-tertiary/15 blur-3xl" />

      <div className="relative space-y-5">
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full border border-greyscale-600 bg-greyscale-900/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-greyscale-100">
            Bài thực hành
          </span>

          <h2 className="text-2xl font-semibold leading-tight text-greyscale-0 md:text-3xl">
            {locale === "en" ? lab.nameEN || lab.nameVN : lab.nameVN || lab.nameEN}
          </h2>

          <p className="max-w-3xl text-sm leading-relaxed text-greyscale-100 md:text-base whitespace-pre-line">
            {locale === "en"
              ? lab.descriptionEN || lab.descriptionVN
              : lab.descriptionVN || lab.descriptionEN}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded border-2 border-tertiary/35 bg-tertiary/10 p-3">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-tertiary">
              <FaClock className="h-3.5 w-3.5" />
              Thời gian ước tính
            </p>
            <p className="mt-2 text-xl font-semibold text-greyscale-0">
              {lab.estimatedTime} phút
            </p>
          </div>

          <div className="rounded border-2 border-secondary/35 bg-secondary/10 p-3">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-secondary">
              <FaSignal className="h-3.5 w-3.5" />
              Độ khó
            </p>
            <p className="mt-2 text-xl font-semibold text-greyscale-0">
              {levelLabel}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            icon={<TbDrone />}
            disabled={!canOpenLab}
            onClick={() =>
              router.push(
                `/learn/${params.clubSlug}/${enrollmentId}/lab/${lab.labID || referenceId}`,
              )
            }
          >
            {locale === "en" ? "Open lab" : "Vào bài lab"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export type { MemberLabLessonContentProps };