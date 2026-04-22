"use client";

import React from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { FaClock, FaCheckCircle, FaAward } from "react-icons/fa";
import { MdOutlineScience } from "react-icons/md";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetWebSimulator } from "@/hooks/simulator/useSimulator";
import { useLocale } from "@/providers/i18n-provider";
import { getSimulatorRoute } from "@/lib/physic/simulatorRoutes";

type MemberSimulatorLessonContentProps = {
  referenceId: string;
  enrollmentId?: string;
  lessonId?: string;
};

export default function MemberSimulatorLessonContent({
  referenceId,
  enrollmentId,
  lessonId,
}: MemberSimulatorLessonContentProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  const simulatorQuery = useGetWebSimulator(referenceId);

  if (simulatorQuery.isLoading) {
    return (
      <div className="mx-auto flex min-h-40 w-full max-w-4xl items-center justify-center rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (simulatorQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6 text-sm text-warning">
        Không tải được thông tin mô phỏng.
      </div>
    );
  }

  const simulator = simulatorQuery.data;
  if (!simulator) return null;

  const handleOpenSimulator = () => {
    // Current URL including search params for the student to return to
    const currentUrl = `${pathname}${lessonId ? `?lessonId=${lessonId}` : ""}`;
    const route = getSimulatorRoute(simulator.code, simulator.webSimulatorID, currentUrl);
    router.push(route);
  };

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded border border-greyscale-700/90 bg-greyscale-900/70 p-6 shadow-xl backdrop-blur-sm">
      <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative space-y-5">
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full border border-greyscale-600 bg-greyscale-900/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-greyscale-100">
            Bài học mô phỏng
          </span>

          <h2 className="text-2xl font-semibold leading-tight text-greyscale-0 md:text-3xl">
            {locale === "en" ? simulator.titleEN : simulator.titleVN}
          </h2>

          <div className="rounded border-l-4 border-secondary bg-secondary/5 p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-secondary">
              Mục tiêu bài học
            </h3>
            <p className="max-w-3xl text-sm leading-relaxed text-greyscale-100 md:text-base whitespace-pre-line">
              {locale === "en" ? simulator.objectivesEN : simulator.objectivesVN}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded border-2 border-primary/35 bg-primary/10 p-3">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
              <FaClock className="h-3.5 w-3.5" />
              Thời gian ước tính
            </p>
            <p className="mt-2 text-xl font-semibold text-greyscale-0">
              {simulator.estimatedTime} phút
            </p>
          </div>

          <div className="rounded border-2 border-secondary/35 bg-secondary/10 p-3">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-secondary">
              <MdOutlineScience className="h-3.5 w-3.5" />
              Chủ đề
            </p>
            <p className="mt-2 text-xl font-semibold text-greyscale-0">
              Vật lý & Cơ chế
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="default"
            size="lg"
            className="px-8"
            onClick={handleOpenSimulator}
          >
            Bắt đầu mô phỏng
          </Button>
        </div>
      </div>
    </div>
  );
}
