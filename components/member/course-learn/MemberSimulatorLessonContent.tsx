"use client";

import React from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { FaClock, FaCheckCircle, FaAward, FaRedo } from "react-icons/fa";
import { MdOutlineScience } from "react-icons/md";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUserSimulatorLesson } from "@/hooks/simulator/useSimulator";
import { useLocale } from "@/providers/i18n-provider";
import { getSimulatorRoute } from "@/lib/physic/simulatorRoutes";
import { useGetUserLearningPath } from "@/hooks/learning/useUserLearning";

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
  const queryClient = useQueryClient();

  // Gọi API lấy thông tin bài học và kết quả của user
  const { data: simulatorData, isLoading: isSimLoading, isError, refetch, isRefetching } = useGetUserSimulatorLesson(enrollmentId, lessonId);
  const { data: learningPath, isLoading: isPathLoading } = useGetUserLearningPath(enrollmentId || "");

  const isLoading = isSimLoading || isPathLoading;

  const currentLesson = learningPath?.modules
    .flatMap(m => m.lessons)
    .find(l => l.lessonID === lessonId);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center rounded-lg border border-greyscale-700 bg-greyscale-900/40 p-8">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (isError || !simulatorData) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-lg border border-greyscale-700 bg-greyscale-900/60 p-6 text-sm text-warning">
        Không tải được thông tin mô phỏng.
      </div>
    );
  }

  const { webSimulator, vrSimulator, userSimulator } = simulatorData;
  const activeSimulator = webSimulator || vrSimulator;
  if (!activeSimulator) return null;
  const isVR = currentLesson?.type === "VR" || (!!vrSimulator && !webSimulator);
  const isPhysic = currentLesson?.type === "PHYSIC";
  const isLabPhysic = currentLesson?.type === "LAB_PHYSIC";
  const isLab = currentLesson?.type === "LAB";

  const handleRefreshVR = async () => {
    const result = await refetch();

    if (result.data?.userSimulator) {
      await queryClient.invalidateQueries({
        queryKey: ["user-learning-path"],
      });
    }
  };

  const handleOpenSimulator = () => {
    const currentUrl = `${pathname}${lessonId ? `?lessonId=${lessonId}` : ""}`;
    let route = getSimulatorRoute(webSimulator!.code, webSimulator!.webSimulatorID, currentUrl, webSimulator!.type);
    if (lessonId) {
      route += `&lessonId=${lessonId}`;
    }
    if (enrollmentId) {
      route += `&enrollmentId=${enrollmentId}`;
    }
    router.push(route);
  };

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded border border-greyscale-700/90 bg-greyscale-900/70 p-6 shadow-xl backdrop-blur-sm">
      <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative space-y-5">
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full border border-greyscale-600 bg-greyscale-900/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-greyscale-100">
            {isVR ? "Bài học mô phỏng VR" : isPhysic ? "Bài học Vật lý" : isLabPhysic ? "Mô phỏng Vật lý" : isLab ? "Bài thực hành Blockly" : "Bài học mô phỏng"}
          </span>

          <h2 className="text-2xl font-semibold leading-tight text-greyscale-0 md:text-3xl">
            {locale === "en" ? activeSimulator.titleEN : activeSimulator.titleVN}
          </h2>

          {(activeSimulator as any).objectivesVN && (
            <div className="rounded border-l-4 border-secondary bg-secondary/5 p-4">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-secondary">
                Mục tiêu bài học
              </h3>
              <p className="max-w-3xl text-sm leading-relaxed text-greyscale-100 md:text-base whitespace-pre-line">
                {locale === "en" ? (activeSimulator as any).objectivesEN : (activeSimulator as any).objectivesVN}
              </p>
            </div>
          )}
        </div>

        {/* NẾU ĐÃ CÓ KẾT QUẢ */}
        {userSimulator ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded border-2 border-emerald-500/35 bg-emerald-500/10 p-3">
              <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-400">
                <FaCheckCircle className="h-3.5 w-3.5" />
                Thời gian bay
              </p>
              <p className="mt-2 text-xl font-semibold text-greyscale-0">
                {userSimulator.flightTime} giây
              </p>
            </div>

            {userSimulator.score !== undefined && userSimulator.score !== null && (
              <div className="rounded border-2 border-primary/35 bg-primary/10 p-3">
                <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
                  <FaAward className="h-3.5 w-3.5" />
                  Điểm số
                </p>
                <p className="mt-2 text-xl font-semibold text-greyscale-0">
                  {userSimulator.score}/100
                </p>
              </div>
            )}
          </div>
        ) : (
          /* NẾU CHƯA CÓ KẾT QUẢ */
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded border-2 border-primary/35 bg-primary/10 p-3">
              <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
                <FaClock className="h-3.5 w-3.5" />
                Thời gian ước tính
              </p>
              <p className="mt-2 text-xl font-semibold text-greyscale-0">
                {activeSimulator.estimatedTime} phút
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
        )}

        <div className="flex justify-end gap-3 pt-4">
          {isVR ? (
            <div className="flex flex-col items-end gap-3">
              {!userSimulator && (
                <p className="text-sm font-medium text-warning animate-pulse">
                  Vui lòng đeo kính VR để hoàn thành bài học này.
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isRefetching}
                onClick={handleRefreshVR}
              >
                {isRefetching ? (
                  <span className="flex items-center gap-2"><Spinner className="w-4 h-4" /> Đang tải...</span>
                ) : (
                  <span className="flex items-center gap-2"><FaRedo className="mr-2" /> Cập nhật kết quả</span>
                )}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="default"
              size="lg"
              className="px-8"
              onClick={handleOpenSimulator}
            >
              {userSimulator ? (
                <span className="flex items-center gap-2"><FaRedo /> Làm lại bài</span>
              ) : (
                isPhysic ? "Bắt đầu học ngay" : isLabPhysic ? "Bắt đầu thí nghiệm" : isLab ? "Bắt đầu lập trình" : "Bắt đầu mô phỏng"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
