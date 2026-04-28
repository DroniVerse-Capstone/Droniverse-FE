"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PartsExplorerTab from "@/components/mechanics/parts-explorer/PartsExplorerTab";
import FlightMechanicsTab from "@/components/mechanics/flight-mechanics/FlightMechanicsTab";
// import PhysicsLabTab from "@/components/mechanics/physics-lab/PhysicsLabTab";
import PhysicsBasicsTab from "@/components/mechanics/physics-basics/PhysicsBasicsTab";
import { cn } from "@/lib/utils";
import { Rocket, ArrowLeft, Map } from "lucide-react";
import { useGetUserSimulatorLesson } from "@/hooks/simulator/useSimulator";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "parts", label: "Khám phá linh kiện" },
  { id: "physics-basics", label: "Vật lý cơ bản" },
  { id: "mechanics", label: "Cơ chế điều khiển" },
  // { id: "physlab", label: "Physics Lab" },
];

export default function QuadcopterMechanicsLab() {
  const [activeTab, setActiveTab] = useState("parts");
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnUrl = searchParams.get("returnUrl");
  const enrollmentId = searchParams.get("enrollmentId");
  const lessonId = searchParams.get("lessonId");

  const isAdmin = returnUrl ? (returnUrl.includes("course-management") || returnUrl.includes("system")) : false;

  // XÁC THỰC QUYỀN TRUY CẬP TỪ BACKEND
  const { data: userLessonData, isLoading: isVerifying, isError: isVerifyError } = useGetUserSimulatorLesson(
    enrollmentId || undefined,
    lessonId || undefined
  );

  // KIỂM TRA QUYỀN TRUY CẬP THỰC TẾ
  const isAuthorized = isAdmin || (!!userLessonData && !isVerifyError);

  if (isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020617]">
        <Spinner className="h-8 w-8 text-cyan-500" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#020617] p-6 text-center">
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
            <p className="text-slate-400 text-sm leading-relaxed">
              Bạn không thể truy cập trực tiếp phòng thí nghiệm này. Vui lòng vào từ danh sách bài học trong khóa học của bạn để bắt đầu.
            </p>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => router.push("/")}
          >
            Quay về Trang chủ
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="h-screen bg-[#020617] text-white font-sans flex flex-col overflow-hidden"
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vh] bg-cyan-500/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-indigo-700/10 rounded-full blur-[140px]" />
      </div>

      {/* ── TOP BAR (Header) ── */}
      <header className="relative z-30 shrink-0 flex items-center justify-between px-8 py-9 bg-slate-900/20 backdrop-blur-md border-b border-white/5">
        {/* Title Group */}
        <div className="flex items-center gap-4">
          {returnUrl && (
            <button
              onClick={() => router.push(returnUrl)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs font-medium text-cyan-400"
            >
              <ArrowLeft className="w-4 h-4" />
              {returnUrl.includes("course-management") || returnUrl.includes("system")
                ? "Quay lại quản trị"
                : "Quay lại bài học"}
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 rounded-md bg-black/40 border border-white/5 backdrop-blur-xl">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative px-6 py-2 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all duration-300",
                  isActive ? "text-cyan-400" : "text-white/30 hover:text-white/60"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute inset-0 rounded-md bg-cyan-500/10 border border-cyan-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions or Empty Space */}
        <div className="w-[120px]" /> {/* Balancing the logo width */}
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 flex-1 min-h-0 overflow-hidden p-3">
        <AnimatePresence mode="wait">
          {activeTab === "parts" ? (
            <motion.div
              key="parts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <PartsExplorerTab />
            </motion.div>
          ) : activeTab === "mechanics" ? (
            <motion.div
              key="mechanics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <FlightMechanicsTab />
            </motion.div>
          )
            // : activeTab === "physlab" ? (
            //   <motion.div
            //     key="physlab"
            //     initial={{ opacity: 0, y: 10 }}
            //     animate={{ opacity: 1, y: 0 }}
            //     exit={{ opacity: 0, y: -10 }}
            //     transition={{ duration: 0.2 }}
            //     className="h-full"
            //   >
            //     <PhysicsLabTab />
            //   </motion.div>
            // )
            : (
              <motion.div
                key="physics-basics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <PhysicsBasicsTab />
              </motion.div>
            )}
        </AnimatePresence>
      </main>
    </div>
  );
}
