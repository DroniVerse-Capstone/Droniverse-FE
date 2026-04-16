"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useGetStudentLabDetail, useSubmitStudentLab } from "@/hooks/lab/useLabs";
import { useGetUserLearningPath } from "@/hooks/learning/useUserLearning";
import PlayLabWorkspace from "@/components/simulator/PlayLabWorkspace";
import { SimulatorErrorBoundary } from "@/components/simulator/SimulatorErrorBoundary";
import { LabContentData, LabSolution } from "@/types/lab";
import Loading from "@/app/loading";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useTranslations } from "@/providers/i18n-provider";
import { useLessonNavigation } from "@/hooks/learning/useLessonNavigation";

// Auto-generate feedback based on score
function generateFeedback(score: number): { vn: string; en: string } {
  if (score >= 95)
    return {
      vn: "Xuất sắc! Bạn đã thực hiện chuyến bay hoàn hảo với hiệu suất vượt trội.",
      en: "Outstanding! You completed the flight mission with exceptional performance.",
    };
  if (score >= 80)
    return {
      vn: "Tốt lắm! Chuyến bay của bạn đạt hiệu quả cao, cần tinh chỉnh thêm một chút.",
      en: "Great job! Your flight was highly efficient with minor room for improvement.",
    };
  if (score >= 60)
    return {
      vn: "Hoàn thành tốt! Hãy thử tối ưu thêm thời gian và nhiên liệu để đạt điểm cao hơn.",
      en: "Well done! Try to optimize your flight time and fuel usage to score higher.",
    };
  return {
    vn: "Bạn đã hoàn thành bài tập. Hãy luyện tập thêm để cải thiện kỹ năng lập trình drone.",
    en: "You completed the lab. Keep practicing to improve your drone programming skills.",
  };
}

export default function StudentPlayLabPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const labId = params?.labId as string;
  const enrollmentId = params?.enrollmentId as string;
  const mode = searchParams.get("mode");
  const t = useTranslations("MissionHUD");

  const { data: studentLabData, isLoading, isError, error } = useGetStudentLabDetail(enrollmentId, labId) as any;
  const submitMutation = useSubmitStudentLab(enrollmentId, labId);
  const { lessonContext, handleNext, handleExit } = useLessonNavigation(enrollmentId, labId);

  // We only show the full-screen loading if we have absolutely no data yet.
  if (!labId || !enrollmentId || (isLoading && !studentLabData)) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950">
        <Loading />
      </div>
    );
  }

  const labData = studentLabData?.lab;
  const labContent = studentLabData?.labContent?.environment;
  // If in 'retry' mode, we don't load the previous XML so the student starts fresh
  const previousWorkXml = mode === "retry" ? undefined : studentLabData?.userLab?.solution;

  const beErrorMessage = error?.response?.data?.message || studentLabData?.message;

  const handleMissionComplete = async (solution: LabSolution) => {
    if (!labContent) return;

    const feedback = generateFeedback(solution.score ?? 0);
    console.log("solution", solution);
    const toastId = toast.loading("Đang nộp bài...");
    try {
      await submitMutation.mutateAsync({
        solution: solution.xml ?? "",
        isCompleted: true,
        time: solution.metrics?.timeSpent ?? 0,
        numberOfStep: solution.metrics?.blockCount ?? 0,
        length: Math.round(solution.metrics?.logicalDistance ?? 0),
        feedbackVN: feedback.vn,
        feedbackEN: feedback.en,
        point: solution.score ?? 0,
      });

      toast.success("Nộp bài thành công! 🎉", { id: toastId });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Nộp bài thất bại. Vui lòng thử lại.";
      toast.error(msg, { id: toastId });
    }
  };

  // Only show full-page loading if we have no data at all
  if (isLoading && !studentLabData) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950">
        <Loading />
      </div>
    );
  }

  // Show error only if it actually failed AND it's not loading anymore
  if (isError || (!isLoading && !labContent)) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 font-sans text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(220,38,38,0.15)_0%,rgba(2,6,23,1)_80%)]" />
        <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.07] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

        <div className="relative z-20 flex flex-col items-center max-w-lg w-full px-6">
          <div className="mb-8 relative">
            <div className="w-24 h-24 rounded-2xl bg-red-600/10 border border-red-500/40 flex items-center justify-center text-red-500 animate-dv-pulse-glow">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-red-500/60" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-red-500/60" />
          </div>

          <div className="dv-glass-error p-8 rounded-2xl w-full flex flex-col items-center text-center gap-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-red-500 flex items-center gap-3 justify-center">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                {t("signalLost")}
              </h2>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
            </div>

            <div className="space-y-4">
              <p className="text-slate-200 text-sm leading-relaxed font-medium">
                {beErrorMessage || t("authFailure")}
              </p>

              <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-lg flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono text-red-400/50">
                  <span>{t("diagnosticReport")}</span>
                  <span>UNAUTHORIZED_ACCESS_EXCEPTION</span>
                </div>
                <div className="text-[11px] text-red-300 font-mono text-left leading-tight italic">
                  {t("authFailure")}
                </div>
              </div>
            </div>

            <button
              onClick={handleExit}
              className="group mt-2 relative overflow-hidden px-10 py-4 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 rounded-xl transition-all active:scale-95"
            >
              <div className="relative z-10 flex items-center gap-3 text-red-400 font-bold uppercase tracking-widest text-xs">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {t("backToBase")}
              </div>
              <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          <div className="mt-12 text-[10px] uppercase font-mono text-slate-600 tracking-widest flex items-center gap-4">
            <span>DroniVerse System v4.0.2</span>
            <span className="w-1 h-3 bg-slate-700" />
            <span className="animate-dv-blink">{t("connectionTerminated")}</span>
          </div>
        </div>
      </div>
    );
  }





  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950 overflow-hidden">
      <SimulatorErrorBoundary onExit={handleExit}>
        <PlayLabWorkspace
          labData={labContent}
          labMeta={labData}
          mode="student"
          // Load the student's previous work if available (Restore Progress)
          initialBlocks={previousWorkXml}
          onMissionComplete={handleMissionComplete}
          onNext={handleNext}
          onExit={handleExit}
        />
      </SimulatorErrorBoundary>
    </div>
  );
}

