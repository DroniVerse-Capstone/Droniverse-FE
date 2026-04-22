// "use client";

// import { useState, useRef, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   ChevronRight, ChevronLeft,
//   Settings2, Activity, Info, Zap, Target, Cpu, Power, Play, Pause, RotateCcw
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import {
//   LESSONS, INITIAL_CONTROLS, INITIAL_STATE,
//   stepPhysics, LabControls, LabPhysicsState
// } from "./PhysicsLabPhysics";
// import { PhysicsLabViewer } from "./PhysicsLabViewer";

// export default function PhysicsLabTab() {
//   // State
//   const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
//   const [currentStepIdx, setCurrentStepIdx] = useState(0);
//   const [controls, setControls] = useState<LabControls>(INITIAL_CONTROLS);
//   const [physics, setPhysics] = useState<LabPhysicsState>(INITIAL_STATE);
//   const [isAutoDemo, setIsAutoDemo] = useState(true);
//   const [mode, setMode] = useState<"beginner" | "advanced">("beginner");

//   const physicsRef = useRef<LabPhysicsState>(INITIAL_STATE);
//   const controlsRef = useRef<LabControls>(INITIAL_CONTROLS);
//   const lesson = LESSONS[currentLessonIdx];
//   const step = lesson.steps[currentStepIdx];

//   // Update refs
//   useEffect(() => {
//     controlsRef.current = controls;
//   }, [controls]);

//   // Main Loop
//   useEffect(() => {
//     const keys = new Set<string>();
//     const handleDown = (e: KeyboardEvent) => keys.add(e.key.toLowerCase());
//     const handleUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());

//     window.addEventListener("keydown", handleDown);
//     window.addEventListener("keyup", handleUp);

//     const dt = 0.016;
//     const interval = setInterval(() => {
//       const next = { ...controlsRef.current };

//       // Keyboard Controls
//       const spd = 4;
//       if (!isAutoDemo) {
//         if (keys.has("w")) next.pitch = Math.min(100, next.pitch + spd);
//         else if (keys.has("s")) next.pitch = Math.max(-100, next.pitch - spd);
//         else next.pitch *= 0.9;

//         if (keys.has("d")) next.roll = Math.min(100, next.roll + spd);
//         else if (keys.has("a")) next.roll = Math.max(-100, next.roll - spd);
//         else next.roll *= 0.9;

//         if (keys.has("arrowright")) next.yaw = Math.min(100, next.yaw + spd);
//         else if (keys.has("arrowleft")) next.yaw = Math.max(-100, next.yaw - spd);
//         else next.yaw *= 0.9;

//         if (keys.has("arrowup")) next.throttle = Math.min(100, next.throttle + 1);
//         else if (keys.has("arrowdown")) next.throttle = Math.max(0, next.throttle - 1);
//       }

//       // Auto Demo Logic
//       if (isAutoDemo) {
//         Object.keys(next).forEach((k) => {
//           const key = k as keyof LabControls;
//           const target = lesson.controls[key];
//           next[key] += (target - next[key]) * 0.05;
//         });
//       }

//       const newState = stepPhysics(physicsRef.current, next, dt);
//       physicsRef.current = newState;
//       setPhysics({ ...newState });
//       setControls({ ...next });
//     }, 16);

//     return () => {
//       clearInterval(interval);
//       window.removeEventListener("keydown", handleDown);
//       window.removeEventListener("keyup", handleUp);
//     };
//   }, [isAutoDemo, currentLessonIdx]);

//   const changeLesson = (idx: number) => {
//     setCurrentLessonIdx(idx);
//     setCurrentStepIdx(0);
//     setControls(LESSONS[idx].controls);
//     setIsAutoDemo(true);
//   };

//   const resetSimulation = () => {
//     physicsRef.current = INITIAL_STATE;
//     setPhysics(INITIAL_STATE);
//     setControls(lesson.controls);
//     setIsAutoDemo(true);
//   };

//   return (
//     <div className="grid grid-cols-[280px_1fr_280px] gap-4 h-full overflow-hidden">
      
//       {/* ─── LEFT: BÀI HỌC & MỤC TIÊU ─── */}
//       <div className="flex flex-col gap-4 overflow-hidden">
        
//         {/* Chương trình đào tạo */}
//         <div className="bg-slate-900/60 border border-white/5 rounded-md p-4 backdrop-blur-xl shadow-2xl flex flex-col min-h-0 h-[45%]">
//           <div className="flex items-center gap-2 mb-3 shrink-0">
//             <Zap className="w-3.5 h-3.5 text-cyan-400" />
//             <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Chương trình</h3>
//           </div>
//           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
//             {LESSONS.map((l, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => changeLesson(idx)}
//                 className={cn(
//                   "w-full px-3 py-2.5 rounded-md text-left transition-all border text-[11px] font-bold flex items-center gap-3",
//                   currentLessonIdx === idx 
//                     ? "bg-cyan-500/10 border-cyan-500/30 text-white shadow-lg" 
//                     : "border-transparent text-white/30 hover:bg-white/5 hover:text-white/50"
//                 )}
//               >
//                 <span className="text-lg">{l.emoji}</span>
//                 <span className="flex-1">{idx + 1}. {l.title}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Mục tiêu bài học */}
//         <div className="bg-slate-900/60 border border-white/5 rounded-md p-4 backdrop-blur-xl shadow-2xl flex-1 flex flex-col overflow-hidden">
//           <div className="flex items-center justify-between mb-4 shrink-0">
//             <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Mục tiêu huấn luyện</h3>
//             <span className="text-[10px] font-mono text-cyan-400/50">{currentStepIdx + 1}/{lesson.steps.length}</span>
//           </div>

//           <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={`${currentLessonIdx}-${currentStepIdx}`}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 className="space-y-4"
//               >
//                 <div className="flex items-start gap-3">
//                   <div className="w-6 h-6 rounded-md bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-[10px] font-black border border-cyan-500/20 shrink-0">
//                     {currentStepIdx + 1}
//                   </div>
//                   <div className="space-y-1">
//                     <div className="text-[13px] font-black text-white leading-tight tracking-tight">{step.objective}</div>
//                     <div className="text-[11px] text-cyan-400/70 font-bold italic leading-snug">{step.instruction}</div>
//                   </div>
//                 </div>
//                 <div className="bg-black/30 p-3.5 rounded-md text-[11px] text-slate-400 leading-relaxed border border-white/5 shadow-inner italic">
//                   {step.explain}
//                 </div>
//               </motion.div>
//             </AnimatePresence>
//           </div>

//           <div className="flex items-center gap-2 mt-4 shrink-0">
//             <button
//               disabled={currentStepIdx === 0}
//               onClick={() => setCurrentStepIdx(s => s - 1)}
//               className="flex-1 py-2 rounded-md bg-white/5 disabled:opacity-20 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5"
//             >
//               <ChevronLeft className="w-4 h-4 text-slate-400" />
//             </button>
//             <button
//               disabled={currentStepIdx === lesson.steps.length - 1}
//               onClick={() => setCurrentStepIdx(s => s + 1)}
//               className="flex-1 py-2 rounded-md bg-cyan-600/10 text-cyan-400 flex items-center justify-center hover:bg-cyan-600/20 transition-all border border-cyan-500/20 font-black text-[9px] uppercase tracking-widest"
//             >
//               Kế tiếp <ChevronRight className="w-3 h-3 ml-1" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ─── CENTER: MÔ PHỎNG 3D ─── */}
//       <main className="flex flex-col rounded-md border border-white/5 bg-black relative overflow-hidden shadow-2xl">
//         <PhysicsLabViewer physics={physics} lesson={lesson} mode={mode} />
        
//         {/* Overlays */}
//         <div className="absolute top-6 left-6 flex gap-2">
//            <button 
//              onClick={() => setMode(m => m === "beginner" ? "advanced" : "beginner")}
//              className="px-3 py-1.5 rounded-md bg-slate-900/80 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white backdrop-blur-md"
//            >
//              Cấp độ: {mode === "beginner" ? "Cơ bản" : "Nâng cao"}
//            </button>
//         </div>

//         <div className="absolute top-6 right-6 flex gap-2">
//            <button 
//              onClick={() => setIsAutoDemo(!isAutoDemo)}
//              className={cn(
//                "px-4 py-1.5 rounded-md border text-[9px] font-black uppercase tracking-widest transition-all backdrop-blur-md flex items-center gap-2",
//                isAutoDemo ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400" : "bg-slate-900/80 border-white/10 text-white/50"
//              )}
//            >
//              {isAutoDemo ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
//              {isAutoDemo ? "Dừng mô phỏng" : "Chạy mô phỏng"}
//            </button>
//            <button 
//              onClick={resetSimulation}
//              className="p-2 rounded-md bg-slate-900/80 border border-white/10 text-white/50 hover:text-white backdrop-blur-md"
//            >
//              <RotateCcw className="w-3.5 h-3.5" />
//            </button>
//         </div>

//         {/* Height Indicator HUD */}
//         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
//            <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full flex items-center gap-4 shadow-2xl">
//               <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Độ cao thực tế</span>
//               <div className="w-px h-3 bg-white/10" />
//               <span className="text-sm font-mono font-bold text-cyan-400">{physics.altitude.toFixed(2)}m</span>
//            </div>
//         </div>
//       </main>

//       {/* ─── RIGHT: VIỄN THÁM & ĐỘNG CƠ ─── */}
//       <div className="flex flex-col bg-slate-900/60 border border-white/5 rounded-md p-4 backdrop-blur-xl shadow-2xl overflow-hidden">
//         <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 shrink-0">Dữ liệu viễn thám (Telemetry)</h3>
        
//         <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2.5">
//           {lesson.telemetry.filter(t => mode === "advanced" || !t.isAdvanced).map((t, idx) => (
//             <div key={idx} className="bg-black/30 p-3.5 rounded-md border border-white/5 flex items-center justify-between shadow-inner">
//               <div>
//                 <div className="text-[8px] text-white/30 uppercase font-black tracking-widest mb-1">{t.label}</div>
//                 <div className={cn("text-lg font-mono font-bold tracking-tighter", t.color)}>
//                   {t.getValue(physics)}
//                   <span className="text-[9px] ml-1 opacity-40 font-sans uppercase font-black">{t.unit}</span>
//                 </div>
//               </div>
//               <Activity className="w-3.5 h-3.5 text-white/5" />
//             </div>
//           ))}
//         </div>

//         {/* Motor Power Visualization */}
//         <div className="shrink-0 pt-4 mt-4 border-t border-white/5">
//           <div className="flex items-center justify-between text-[9px] font-black text-white/20 uppercase mb-3 tracking-[0.2em]">
//             <span>Công suất động cơ</span>
//             <Settings2 className="w-3 h-3 text-white/20" />
//           </div>
//           <div className="grid grid-cols-4 gap-2">
//             {['fl', 'fr', 'rl', 'rr'].map(m => {
//               const val = (physics.motors as any)[m];
//               return (
//                 <div key={m} className="flex flex-col items-center gap-1.5">
//                   <div className="w-full h-16 bg-black/40 rounded-md relative flex items-end overflow-hidden border border-white/5">
//                     <motion.div
//                       className={cn("w-full transition-all", val > 60 ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-cyan-500 shadow-[0_0_10px_#06b6d4]")}
//                       animate={{ height: `${val}%` }}
//                       transition={{ type: "spring", stiffness: 100, damping: 15 }}
//                     />
//                     <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white drop-shadow-md">
//                       {val.toFixed(0)}
//                     </div>
//                   </div>
//                   <span className="text-[8px] uppercase font-black opacity-20 tracking-tighter">{m.toUpperCase()}</span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
