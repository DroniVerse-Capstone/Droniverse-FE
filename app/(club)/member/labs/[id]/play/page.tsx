"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useGetStudentLabDetail } from "@/hooks/lab/useLabs";
import PlayLabWorkspace from "@/components/simulator/PlayLabWorkspace";
import { SimulatorErrorBoundary } from "@/components/simulator/SimulatorErrorBoundary";
import { LabContentData, LabSolution } from "@/types/lab";
import Loading from "@/app/loading";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useTranslations } from "@/providers/i18n-provider";

export default function StudentPlayLabPage() {
  const params = useParams();
  const router = useRouter();
  const labId = params?.id as string;
  const t = useTranslations("MissionHUD");

  // HARDCODED Enrollment ID for now as requested by user.
  const ENROLLMENT_ID = "d5bc6d12-2576-4261-bf42-bc16b982022a";

  const { data: studentLabData, isLoading, isError, error } = useGetStudentLabDetail(ENROLLMENT_ID, labId) as any;

  const labData = studentLabData?.lab;
  const labContent = studentLabData?.labContent?.environment;
  const previousWorkXml = studentLabData?.userLab?.solution?.xml;

  const beErrorMessage = error?.response?.data?.message || studentLabData?.message;

  const handleMissionComplete = async (solution: LabSolution) => {
    if (!labContent) return;
    toast.loading("...", { id: "student-submission" });
    // ... logic ...
  };

  const handleExit = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950">
        <Loading />
      </div>
    );
  }

  if (isError || !labContent) {
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
          onExit={handleExit}
        />
      </SimulatorErrorBoundary>
    </div>
  );
}

