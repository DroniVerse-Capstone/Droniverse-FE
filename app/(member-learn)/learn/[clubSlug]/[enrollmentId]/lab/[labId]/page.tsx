"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useGetStudentLabDetail, useSubmitStudentLab } from "@/hooks/lab/useLabs";
import { useGetUserLearningPath } from "@/hooks/learning/useUserLearning";
import PlayLabWorkspace from "@/components/simulator/PlayLabWorkspace";
import { SimulatorErrorBoundary } from "@/components/simulator/SimulatorErrorBoundary";
import { LabContentData, LabSolution } from "@/types/lab";
import Loading from "@/app/loading";
import { AlertTriangle, ArrowLeft, Map } from "lucide-react";
import { useTranslations } from "@/providers/i18n-provider";
import { useLessonNavigation } from "@/hooks/learning/useLessonNavigation";
import { Button } from "@/components/ui/button";

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
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md space-y-6"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <Map className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Truy cập bị chặn</h1>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Bạn không thể truy cập trực tiếp bài tập mô phỏng này.
              Vui lòng vào từ danh sách bài học trong khóa học của bạn để bắt đầu.
            </p>
          </div>
          <Button
            variant="secondary"
            className="w-full py-6 rounded-xl text-base font-black uppercase tracking-widest shadow-[0_0_20px_rgba(45,212,191,0.15)]"
            onClick={() => router.push("/member")}
          >
            Quay về Trang chủ
          </Button>
        </motion.div>
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

