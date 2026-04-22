"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Bounds } from "@react-three/drei";
import { DronePartId, DRONE_PARTS } from "./data";
import { InteractiveDroneModel } from "./InteractiveDroneModel";
import { cn } from "@/lib/utils";

export default function PartsExplorerTab() {
  const [selectedPart, setSelectedPart] = useState<DronePartId | null>(null);
  const selectedPartData = DRONE_PARTS.find((p) => p.id === selectedPart);

  return (
    <div
      className="grid gap-4 h-full"
      style={{ gridTemplateColumns: "280px 1fr 300px", overflow: "hidden" }}
    >
      {/* ─── LEFT: DANH SÁCH LINH KIỆN ─── */}
      <aside className="flex flex-col rounded-md border border-white/5 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="shrink-0 px-6 py-5 border-b border-white/5 bg-white/5">
          <h2 className="text-xs font-black text-cyan-400 uppercase tracking-widest">Danh sách linh kiện</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {DRONE_PARTS.map((part) => {
            const isSelected = selectedPart === part.id;
            return (
              <button
                key={part.id}
                onClick={() => setSelectedPart(isSelected ? null : part.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3.5 rounded-md text-left transition-all duration-300 relative group border",
                  isSelected
                    ? "bg-cyan-500/10 border-cyan-500/30 text-white shadow-lg"
                    : "border-transparent text-white/40 hover:bg-white/5 hover:text-white/80"
                )}
              >
                <span className="text-[13px] font-bold tracking-tight relative z-10">{part.name}</span>
                <div className={cn(
                  "w-1 h-1 rounded-full transition-all duration-500",
                  isSelected ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]" : "bg-white/10"
                )} />
              </button>
            );
          })}
        </div>
      </aside>

      {/* ─── CENTER: MÔ HÌNH 3D ─── */}
      <main className="flex flex-col rounded-md border border-white/5 bg-black relative overflow-hidden shadow-2xl">
        {/* Overlays */}
        <div className="absolute top-6 left-6 z-10">
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-md">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Mô hình 3D tương tác</span>
          </div>
        </div>
        
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={() => setSelectedPart(null)}
            className="px-4 py-2 rounded-md bg-slate-900/80 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all"
          >
            Đặt lại góc nhìn
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 cursor-grab active:cursor-grabbing">
          <Canvas shadows camera={{ position: [4, 3, 4], fov: 45 }}>
            <Suspense fallback={null}>
              <Environment preset="city" />
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
              <Bounds fit clip observe margin={1.2}>
                <InteractiveDroneModel selectedPart={selectedPart} />
              </Bounds>
              <ContactShadows position={[0, -1.5, 0]} opacity={0.35} scale={10} blur={2} far={4} />
              <OrbitControls makeDefault minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2 + 0.1} enableZoom />
            </Suspense>
          </Canvas>
        </div>
      </main>

      {/* ─── RIGHT: THÔNG SỐ KỸ THUẬT ─── */}
      <aside className="flex flex-col rounded-md border border-white/5 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="shrink-0 px-6 py-5 border-b border-white/5 bg-white/5">
          <h2 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Thông số kỹ thuật</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {selectedPartData ? (
              <motion.div
                key={selectedPartData.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-black text-white mb-3">{selectedPartData.name}</h3>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase bg-white/5 text-white/40 border border-white/5">Phần cứng</span>
                    <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Quan trọng</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Chức năng chính</p>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">{selectedPartData.function}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Vai trò vận hành</p>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">{selectedPartData.importance}</p>
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-20">
                <div className="w-12 h-12 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  </svg>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">Chọn linh kiện</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </div>
  );
}
