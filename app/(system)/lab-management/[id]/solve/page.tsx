"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useLabFull, useUpsertLabContent } from "@/hooks/lab/useLabs";
import PlayLabWorkspace from "@/components/simulator/PlayLabWorkspace";
import { SimulatorErrorBoundary } from "@/components/simulator/SimulatorErrorBoundary";
import { LabContentData, LabSolution } from "@/types/lab";
import { Loader2 } from "lucide-react";

export default function AdminSolveLabPage() {
  const params = useParams();
  const router = useRouter();
  const labId = params?.id as string;

  const { data: labData, isLoading, isError } = useLabFull(labId);
  const upsertContent = useUpsertLabContent();
  const [labContent, setLabContent] = useState<LabContentData | null>(null);

  useEffect(() => {
    if (labData?.labContent?.environment) {
      setLabContent(labData.labContent.environment);
    }
  }, [labData]);

  const handleMissionComplete = async (solution: LabSolution) => {
    if (!labContent) return;

    toast.loading("Đang lưu lời giải mẫu...", { id: "save-solution" });

    try {
      const updatedContent: LabContentData = {
        ...labContent,
        hasSolution: true,
        solution: solution
      };

      await upsertContent.mutateAsync({
        labID: labId,
        data: updatedContent
      });

      toast.success("Hoàn thành bài tập! Lời giải mẫu đã được lưu trữ.", {
        id: "save-solution",
        style: { background: "#10b981", color: "#fff" },
        iconTheme: { primary: "#fff", secondary: "#10b981" },
      });

      setTimeout(() => {
        // router.push(`/lab-management`);
        router.back()

      }, 1500);
    } catch (err) {
      toast.error("Lưu lời giải thất bại!", { id: "save-solution" });
    }
  };

  const handleExit = () => {
    // router.push(`/lab-management`);
    router.back()
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 font-sans text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Đang tải dữ liệu bài tập...</p>
        </div>
      </div>
    );
  }

  if (isError || !labContent) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 font-sans text-white">
        <div className="flex flex-col items-center gap-4 bg-slate-900 border border-red-500/30 p-8 rounded-xl shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
            <span className="text-xl">!</span>
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-red-400">Không tìm thấy dữ liệu</h2>
          <p className="text-xs text-slate-400 max-w-sm text-center leading-relaxed">
            Hệ thống không thể tải nội dung bài tập này. Có thể bài tập chưa được cấu hình.
          </p>
          <button
            onClick={handleExit}
            className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-widest rounded transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <SimulatorErrorBoundary onExit={handleExit}>
      <PlayLabWorkspace
        labData={labContent}
        labMeta={labData}
        mode="admin"
        onMissionComplete={handleMissionComplete}
        onExit={handleExit}
      />
    </SimulatorErrorBoundary>
  );
}
