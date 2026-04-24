"use client";

import { useState, useEffect } from "react";
import { 
  ArrowUp, 
  MoveHorizontal, 
  RotateCw, 
  Wind, 
  Play, 
  RotateCcw, 
  Gauge,
  Zap,
  Weight,
  FlaskConical,
  Beaker,
  Info,
  Activity,
  Scale,
  TrendingUp,
  Target,
  CheckCircle,
  Lock
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PhysicsBasicsViewer } from "./PhysicsBasicsViewer";
import { KnowledgeRecapModal } from "./KnowledgeRecapModal";
import { useSubmitUserSimulatorLesson, useCompleteLesson, useGetUserSimulatorLesson } from "@/hooks/simulator/useSimulator";
import { useGetUserLearningPath } from "@/hooks/learning/useUserLearning";
import { 
  PhysicsState, 
  LessonId, 
  INITIAL_STATE, 
  updatePhysics,
  DRONE_MASS_KG,
  GRAVITY_MS2,
  WEIGHT_FORCE_N,
  getRPMFromThrust,
  calculateLiftForce,
  ROLL_RPM_DEFAULT,
  ROLL_BASE_HEIGHT,
  PITCH_BASE_HEIGHT,
  PITCH_POWER_DEFAULT
} from "./PhysicsBasicsEngine";

// ─── REAL DATA PANEL FOR EXPERIMENT 01: LIFT VS GRAVITY ──────────────────────
function RealDataPanel({ state }: { state: PhysicsState }) {
  const stateColors = {
    grounded: "text-gray-400 bg-gray-500/10 border-gray-500/20",
    stabilizing: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    hovering: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    ascending: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    descending: "text-red-400 bg-red-500/10 border-red-500/30",
  };

  const stateLabels = {
    grounded: "Đang đứng yên",
    stabilizing: "Đang ổn định...",
    hovering: "Đang Hover",
    ascending: "Đang bay lên",
    descending: "Đang rơi xuống",
  };

  const formatSign = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}`;
  };

  const isAboveHover = state.liftForce > WEIGHT_FORCE_N;
  const isHovering = Math.abs(state.liftForce - WEIGHT_FORCE_N) < 0.5;
  const isBelowHover = state.liftForce < WEIGHT_FORCE_N;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-cyan-400" />
        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Dữ liệu Thực tế</span>
      </div>

      {/* Drone State Badge */}
      <div className={cn(
        "p-3 rounded-lg border text-center transition-all",
        stateColors[state.droneState]
      )}>
        <span className="text-[11px] font-black uppercase tracking-wider">
          {stateLabels[state.droneState]}
        </span>
      </div>

      {/* Data Cards Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* RPM */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 mb-1">
            <RotateCw className="w-3 h-3 text-orange-400" />
            <span className="text-[8px] font-bold text-white/40 uppercase">RPM</span>
          </div>
          <span className="text-lg font-black font-mono text-white">
            {Math.round(state.rpm)}
          </span>
          <span className="text-[9px] text-white/30 ml-1">/ 9000</span>
        </div>

        {/* Lift Force */}
        <div className={cn(
          "p-3 rounded-lg border transition-all",
          isAboveHover ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/10"
        )}>
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowUp className="w-3 h-3 text-emerald-400" />
            <span className="text-[8px] font-bold text-white/40 uppercase">Lực Nâng</span>
          </div>
          <span className={cn(
            "text-lg font-black font-mono",
            isAboveHover ? "text-emerald-400" : "text-white"
          )}>
            {state.liftForce.toFixed(1)}
          </span>
          <span className="text-[9px] text-white/30 ml-1">N</span>
        </div>

        {/* Weight Force */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Weight className="w-3 h-3 text-red-400" />
            <span className="text-[8px] font-bold text-white/40 uppercase">Trọng Lực</span>
          </div>
          <span className="text-lg font-black font-mono text-white">
            {state.weightForce.toFixed(1)}
          </span>
          <span className="text-[9px] text-white/30 ml-1">N</span>
        </div>

        {/* Net Force */}
        <div className={cn(
          "p-3 rounded-lg border transition-all",
          state.netForce > 0 ? "bg-emerald-500/10 border-emerald-500/30" :
          state.netForce < 0 ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10"
        )}>
          <div className="flex items-center gap-1.5 mb-1">
            <Scale className="w-3 h-3 text-white/60" />
            <span className="text-[8px] font-bold text-white/40 uppercase">Lực Ròng</span>
          </div>
          <span className={cn(
            "text-lg font-black font-mono",
            state.netForce > 0 ? "text-emerald-400" :
            state.netForce < 0 ? "text-red-400" : "text-white"
          )}>
            {formatSign(state.netForce)}
          </span>
          <span className="text-[9px] text-white/30 ml-1">N</span>
        </div>

        {/* Vertical Acceleration */}
        <div className={cn(
          "p-3 rounded-lg border transition-all",
          state.verticalAccel > 0 ? "bg-cyan-500/10 border-cyan-500/30" :
          state.verticalAccel < 0 ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10"
        )}>
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            <span className="text-[8px] font-bold text-white/40 uppercase">Gia tốc</span>
          </div>
          <span className={cn(
            "text-lg font-black font-mono",
            state.verticalAccel > 0 ? "text-cyan-400" :
            state.verticalAccel < 0 ? "text-red-400" : "text-white"
          )}>
            {formatSign(state.verticalAccel)}
          </span>
          <span className="text-[9px] text-white/30 ml-1">m/s²</span>
        </div>

        {/* Altitude */}
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity className="w-3 h-3 text-purple-400" />
            <span className="text-[8px] font-bold text-white/40 uppercase">Độ cao</span>
          </div>
          <span className="text-lg font-black font-mono text-white">
            {state.posY.toFixed(2)}
          </span>
          <span className="text-[9px] text-white/30 ml-1">m</span>
        </div>
      </div>

      {/* Live Formula Panel */}
      <div className="p-4 rounded-lg bg-slate-950/80 border border-white/10 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-3 h-3 text-cyan-400" />
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Công thức Newton</span>
        </div>
        
        <div className="font-mono text-[11px] text-white/80 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">F<sub>lift</sub></span>
            <span className="text-white/30">=</span>
            <span className="text-orange-400">k</span>
            <span className="text-white/30">×</span>
            <span className="text-cyan-400">RPM²</span>
          </div>
          
          <div className="h-px bg-white/10 my-2" />
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-cyan-300">F<sub>net</sub></span>
            <span className="text-white/30">=</span>
            <span className="text-emerald-400">F<sub>lift</sub></span>
            <span className="text-white/30">−</span>
            <span className="text-red-400">F<sub>weight</sub></span>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-white/50">
            <span className="text-emerald-400/70">{state.liftForce.toFixed(1)}</span>
            <span className="text-white/30">−</span>
            <span className="text-red-400/70">{state.weightForce.toFixed(1)}</span>
            <span className="text-white/30">=</span>
            <span className={cn(
              state.netForce > 0 ? "text-emerald-400" :
              state.netForce < 0 ? "text-red-400" : "text-white/70"
            )}>
              {formatSign(state.netForce)} N
            </span>
          </div>
          
          <div className="h-px bg-white/10 my-2" />
          
          <div className="flex items-center gap-2">
            <span className="text-cyan-300">a</span>
            <span className="text-white/30">=</span>
            <span className="text-cyan-400">F<sub>net</sub></span>
            <span className="text-white/30">/</span>
            <span className="text-purple-400">m</span>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-white/50">
            <span className="text-cyan-400/70">{formatSign(state.verticalAccel)}</span>
            <span className="text-white/30">=</span>
            <span className="text-white/70">{formatSign(state.netForce)}</span>
            <span className="text-white/30">/</span>
            <span className="text-white/70">{DRONE_MASS_KG}</span>
            <span className="text-white/30">=</span>
            <span className={cn(
              state.verticalAccel > 0 ? "text-cyan-400" :
              state.verticalAccel < 0 ? "text-red-400" : "text-white/70"
            )}>
              {formatSign(state.verticalAccel)} m/s²
            </span>
          </div>
        </div>
      </div>

      {/* Hover Indicator */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-red-500/5 via-emerald-500/10 to-red-500/5 border border-emerald-500/20">
        <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2 text-center">Vùng Hover Ổn định</div>
        <div className="relative h-3 rounded-full bg-white/10 overflow-hidden">
          {/* Current position marker */}
          {/* <div 
            className={cn(
              "absolute top-0 h-full w-1.5 transition-all duration-200 shadow-lg",
              state.rpm >= 5800 && state.rpm <= 6600 
                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" 
                : "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
            )}
            style={{ left: `${(state.rpm / 9000) * 100}%`, transform: 'translateX(-50%)' }}
          /> */}
          {/* Hover zone */}
          <div 
            className="absolute top-0 h-full bg-emerald-500/40 border-l border-r border-emerald-400/50"
            style={{ 
              left: `${(3000 / 9000) * 100}%`,
              width: `${((6600 - 4200) / 9000) * 100}%`
            }}
          />
          {/* Zone labels */}
          <div className=" inset-0 flex items-center justify-center pr-4 py-0.5">
            <span className="text-[7px] font-black text-emerald-300/80">HOVER ZONE</span>
          </div>
        </div>
        <div className="flex justify-between text-[8px] mt-1">
          <span className="text-red-400/60">Rơi</span>
          <span className="text-white/30">0</span>
          <span className="text-emerald-400 font-bold">5800</span>
          <span className="text-emerald-400 font-bold">6600</span>
          <span className="text-white/30">9000</span>
          <span className="text-cyan-400/60">Bay</span>
        </div>
      </div>

      {/* Drone Mass Info */}
      <div className="flex items-center justify-between text-[9px] text-white/30">
        <span>Khối lượng drone:</span>
        <span className="font-mono text-white/60">{DRONE_MASS_KG} kg</span>
      </div>
    </div>
  );
}

// ─── EXPERIMENT DEFINITIONS ──────────────────────────────────────────────────
const EXPERIMENTS = [
  {
    id: "lift" as LessonId,
    title: "Thí nghiệm 01: Lực Nâng",
    category: "A: Chuyển động cơ bản",
    icon: ArrowUp,
    task: "Thiết lập Lực đẩy (Thrust) để thắng Trọng lực (Gravity)."
  },
  {
    id: "roll" as LessonId,
    title: "Thí nghiệm 02: Nghiêng Ngang",
    category: "A: Chuyển động cơ bản",
    icon: MoveHorizontal,
    task: "Tạo sự chênh lệch công suất giữa Motor Trái và Motor Phải."
  },
  {
    id: "pitch" as LessonId,
    title: "Thí nghiệm 03: Chúc Mũi",
    category: "A: Chuyển động cơ bản",
    icon: Wind,
    task: "Thay đổi lực đẩy của cặp Motor Trước và Motor Sau."
  },
  {
    id: "yaw" as LessonId,
    title: "Thí nghiệm 04: Mô Men Xoắn",
    category: "A: Chuyển động cơ bản",
    icon: RotateCw,
    task: "Điều chỉnh công suất từng motor để tạo xoay."
  },
  /*
  {
    id: "wind" as LessonId,
    title: "Thí nghiệm 05: Ngoại lực Gió",
    category: "B: Vật lý thực tế",
    icon: Wind,
    task: "Giả lập gió thổi ngang tác động vào diện tích bề mặt drone."
  },
  {
    id: "weight" as LessonId,
    title: "Thí nghiệm 06: Lệch Trọng Tâm",
    category: "B: Vật lý thực tế",
    icon: Weight,
    task: "Thay đổi vị trí đặt thiết bị (CoM) để làm lệch cân bằng."
  },
  {
    id: "battery" as LessonId,
    title: "Thí nghiệm 07: Hiệu suất Pin",
    category: "C: Hệ thống thông minh",
    icon: Zap,
    task: "Quan sát hiện tượng sụt áp khi pin yếu."
  },
  {
    id: "stabilization" as LessonId,
    title: "Thí nghiệm 08: Auto Stabilization",
    category: "C: Hệ thống thông minh",
    icon: Gauge,
    task: "Bật/Tắt chế độ tự cân bằng khi drone đang bị nghiêng."
  }
  */
];

export default function PhysicsBasicsTab() {
  const [activeId, setActiveId] = useState<LessonId>("lift");
  const [state, setState] = useState<PhysicsState>(INITIAL_STATE);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [explorationTime, setExplorationTime] = useState(0);

  const searchParams = useSearchParams();
  const router = useRouter();
  const enrollmentId = searchParams.get("enrollmentId");
  const lessonId = searchParams.get("lessonId");
  const returnUrl = searchParams.get("returnUrl") || "/learn";

  const { data: simulatorData } = useGetUserSimulatorLesson(enrollmentId || undefined, lessonId || undefined);
  const { data: learningPath } = useGetUserLearningPath(enrollmentId || undefined);
  
  // Find current lesson in learning path to check completion status
  const currentLesson = learningPath?.modules
    ?.flatMap(m => m.lessons || [])
    ?.find(l => l.lessonID === lessonId);
    
  // If the specific experiment or the whole module is completed, no wait time
  const isExperimentCompleted = completedLessons.includes(activeId) || !!currentLesson?.isCompleted || !!simulatorData?.userSimulator;
  const isModuleComplete = !!currentLesson?.isCompleted || !!simulatorData?.userSimulator;
  const REQUIRED_TIME = isExperimentCompleted ? 0 : 15; 

  const { mutate: completeLesson } = useCompleteLesson({
    onSuccess: () => {
      // After API confirms completion, back to the course module
      router.push(returnUrl);
    }
  });

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("physics-basics-progress");
    if (saved) {
      try {
        setCompletedLessons(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load progress", e);
      }
    }
  }, []);

  // Save progress when completedLessons changes
  useEffect(() => {
    if (completedLessons.length > 0) {
      localStorage.setItem("physics-basics-progress", JSON.stringify(completedLessons));
    }
  }, [completedLessons]);

  const activeExp = EXPERIMENTS.find(e => e.id === activeId) || EXPERIMENTS[0];

  // Sync simulation loop
  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;
    const loop = (now: number) => {
      const delta = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      if (isSimulating) {
        setState(prev => updatePhysics(prev, activeId, delta));
        setExplorationTime(prev => prev + delta);
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isSimulating, activeId]);

  // Handle switching to a new lesson - reset state appropriately
  const handleLessonChange = (newLessonId: LessonId) => {
    setActiveId(newLessonId);
    setIsSimulating(false);
    setExplorationTime(0); // Reset timer for new lesson
    
    // Create appropriate initial state based on lesson
    let newState: PhysicsState;
    
    if (newLessonId === "roll" || newLessonId === "pitch" || newLessonId === "yaw") {
      // Roll/Pitch/Yaw experiment: drone starts hovering at good height with balanced RPM
      // Use HOVER_RPM (6200) to ensure drone can maintain height
      const hoverRPM = 6200;
      newState = { 
        ...INITIAL_STATE, 
        isRunning: false,
        posY: ROLL_BASE_HEIGHT,  // Start at good height for these experiments
        velX: 0,
        velY: 0,
        velZ: 0,
        // Roll experiment defaults - balanced at hover RPM
        leftRPM: hoverRPM,
        rightRPM: hoverRPM,
        // Pitch experiment defaults
        frontRPM: hoverRPM,
        rearRPM: hoverRPM,
        // Yaw experiment defaults
        motorFL_RPM: hoverRPM,
        motorFR_RPM: hoverRPM,
        motorRL_RPM: hoverRPM,
        motorRR_RPM: hoverRPM,
        tiltAngle: 0,
        sideForce: 0,
        rpmDifference: 0,
      };
    } else {
      // Other experiments: use default initial state
      newState = { 
        ...INITIAL_STATE, 
        isRunning: false,
        // Roll experiment defaults (in case they were modified before)
        leftRPM: ROLL_RPM_DEFAULT,
        rightRPM: ROLL_RPM_DEFAULT,
        tiltAngle: 0,
        sideForce: 0,
        rpmDifference: 0,
      };
    }
    
    setState(newState);
  };

  const handleReset = () => {
    let newState: PhysicsState;
    const hoverRPM = 6200;
    
    if (activeId === "roll" || activeId === "pitch" || activeId === "yaw") {
      // Roll/Pitch/Yaw experiment: reset to hovering at good height with enough lift
      newState = { 
        ...INITIAL_STATE, 
        isRunning: false,
        posY: ROLL_BASE_HEIGHT,
        velX: 0,
        velY: 0,
        velZ: 0,
        leftRPM: hoverRPM,
        rightRPM: hoverRPM,
        frontRPM: hoverRPM,
        rearRPM: hoverRPM,
        motorFL_RPM: hoverRPM,
        motorFR_RPM: hoverRPM,
        motorRL_RPM: hoverRPM,
        motorRR_RPM: hoverRPM,
        tiltAngle: 0,
        sideForce: 0,
        rpmDifference: 0,
      };
    } else {
      newState = { 
        ...INITIAL_STATE, 
        isRunning: false,
        leftRPM: ROLL_RPM_DEFAULT,
        rightRPM: ROLL_RPM_DEFAULT,
        tiltAngle: 0,
        sideForce: 0,
        rpmDifference: 0,
      };
    }
    
    setState(newState);
    setIsSimulating(false);
  };

  const runExperiment = () => {
    setIsSimulating(true);
    setState(p => ({ ...p, isRunning: true }));
  };

  const handleNextLesson = () => {
    // Mark current lesson as completed
    const newCompleted = [...completedLessons];
    if (!newCompleted.includes(activeId)) {
      newCompleted.push(activeId);
      setCompletedLessons(newCompleted);
    }

    const currentIndex = EXPERIMENTS.findIndex(e => e.id === activeId);
    if (currentIndex < EXPERIMENTS.length - 1) {
      handleLessonChange(EXPERIMENTS[currentIndex + 1].id);
    } else {
      // All 4 experiments completed! 
      if (enrollmentId && lessonId) {
        if (!isModuleComplete) {
          // Only call API if not already completed
          completeLesson({
            enrollmentId,
            lessonId
          });
        } else {
          // If already completed, just redirect back to the course
          router.push(returnUrl);
        }
      }
      console.log("All 4 physics experiments completed!");
    }
  };

  const isLastLesson = EXPERIMENTS.findIndex(e => e.id === activeId) === EXPERIMENTS.length - 1;

  return (
    <div className="grid gap-4 h-full" style={{ gridTemplateColumns: "320px 1fr 380px", overflow: "hidden" }}>
      
      {/* ─── LEFT: LIST ─── */}
      <aside className="flex flex-col rounded-md border border-white/5 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="shrink-0 px-6 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-black text-white uppercase tracking-widest">Danh sách Thí nghiệm</h2>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-emerald-400">
              {isModuleComplete ? EXPERIMENTS.length : completedLessons.length}/{EXPERIMENTS.length}
            </span>
            <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${(isModuleComplete ? 100 : (completedLessons.length / EXPERIMENTS.length) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {["A: Chuyển động cơ bản", "B: Vật lý thực tế", "C: Hệ thống thông minh"].map(cat => {
            const catExperiments = EXPERIMENTS.filter(e => e.category === cat);
            if (catExperiments.length === 0) return null;

            return (
              <div key={cat} className="space-y-2">
                <p className="px-3 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{cat}</p>
                <div className="space-y-1">
                  {catExperiments.map(exp => {
                    const currentIndex = EXPERIMENTS.findIndex(e => e.id === exp.id);
                    const isFirst = currentIndex === 0;
                    const isPreviousCompleted = currentIndex > 0 && completedLessons.includes(EXPERIMENTS[currentIndex - 1].id);
                    const isUnlocked = isModuleComplete || isFirst || isPreviousCompleted || completedLessons.includes(exp.id);
                    const isCurrent = activeId === exp.id;

                    return (
                      <button
                        key={exp.id}
                        onClick={() => isUnlocked && handleLessonChange(exp.id)}
                        disabled={!isUnlocked}
                        className={cn(
                          "w-full flex items-center gap-4 px-4 py-3 rounded-md text-left transition-all duration-300 border relative overflow-hidden",
                          isCurrent 
                            ? "bg-cyan-500/10 border-cyan-500/30 text-white shadow-lg" 
                            : isUnlocked 
                              ? "border-transparent text-white/40 hover:bg-white/5 hover:text-white/80"
                              : "border-white/5 bg-white/[0.02] text-white/30 cursor-not-allowed"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded flex items-center justify-center transition-colors shrink-0",
                          isCurrent 
                            ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
                            : isUnlocked 
                              ? "bg-white/5 text-white/40" 
                              : "bg-white/5 text-white/20"
                        )}>
                          {!isUnlocked ? <Lock className="w-3.5 h-3.5" /> : <exp.icon className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn(
                              "text-[12px] font-black tracking-tight truncate",
                              isUnlocked ? "text-white" : "text-white/40"
                            )}>{exp.title}</p>
                            {(isModuleComplete || completedLessons.includes(exp.id)) && (
                              <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <p className={cn(
                            "text-[10px] font-medium line-clamp-1",
                            isUnlocked ? "opacity-40" : "opacity-20"
                          )}>{exp.task}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ─── CENTER: SIMULATION AREA ─── */}
      <main className="flex flex-col rounded-md border border-white/5 bg-black relative overflow-hidden shadow-2xl">
        <PhysicsBasicsViewer state={state} lessonId={activeId} hideOverlays={showRecap} />
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
          <button
            onClick={runExperiment}
            disabled={isSimulating}
            className={cn(
              "px-10 py-4 rounded-md flex items-center gap-4 font-black text-[12px] uppercase tracking-[0.2em] transition-all",
              isSimulating ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 cursor-not-allowed" :
              "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)] active:scale-95"
            )}
          >
            <Play className="w-4 h-4 fill-current" />
            {isSimulating ? "Đang chạy mô phỏng..." : "Bắt đầu Thí nghiệm"}
          </button>

          <button
            onClick={() => explorationTime >= REQUIRED_TIME && setShowRecap(true)}
            disabled={explorationTime < REQUIRED_TIME}
            className={cn(
              "px-8 py-4 rounded-md flex items-center gap-3 font-black text-[12px] uppercase tracking-widest transition-all active:scale-95",
              explorationTime >= REQUIRED_TIME 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                : "bg-slate-900/50 text-white/30 border border-white/5 cursor-not-allowed"
            )}
          >
            {explorationTime < REQUIRED_TIME ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
                <span className="text-[10px] font-mono">
                  {Math.ceil(REQUIRED_TIME - explorationTime)}s để mở khóa
                </span>
              </div>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Hoàn thành
              </>
            )}
          </button>
          
          <button
            onClick={handleReset}
            className="w-14 h-14 rounded-md bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all active:scale-90"
          >
            <RotateCcw className="w-4 h-4 text-white/40" />
          </button>
        </div>
      </main>

      {/* ─── RIGHT: WORKSPACE ─── */}
      <aside className="flex flex-col rounded-md border border-white/5 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="shrink-0 px-6 py-5 border-b border-white/5 bg-white/5 flex items-center gap-3">
          <Beaker className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-black text-white uppercase tracking-widest">Điều chỉnh thông số</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* STEP 1: SETUP */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-black text-emerald-400">01</div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Thiết lập thông số</p>
            </div>
            
            <div className="space-y-6 pl-9">

              {/* ─── EXPERIMENT 01: LIFT (RPM) ─── */}
              {(activeId === "lift") && (
                <div className="space-y-5">
                  {/* RPM Control - Simple Style */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <RotateCw className="w-4 h-4 text-orange-400" />
                        <span className="text-[11px] font-bold text-white/60">Tốc độ Motor</span>
                      </div>
                      <span className={cn(
                        "font-mono font-black",
                        state.rpm >= 5800 && state.rpm <= 6600 ? "text-emerald-400" : "text-cyan-400"
                      )}>
                        {Math.round(state.rpm)} RPM
                      </span>
                    </div>
                    <div className="relative">
                      {/* Hover zone background */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 h-3 bg-emerald-500/30 rounded-full pointer-events-none"
                        style={{ 
                          left: `${(5800 / 9000) * 100}%`, 
                          width: `${((6600 - 5800) / 9000) * 100}%` 
                        }}
                      />
                      {/* Hover zone border */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 h-3 border-l-2 border-r-2 border-emerald-400/50 rounded-full pointer-events-none"
                        style={{ 
                          left: `${(5800 / 9000) * 100}%`, 
                          width: `${((6600 - 5800) / 9000) * 100}%` 
                        }}
                      />
                      {/* Slider track */}
                      <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-white/10 rounded-full pointer-events-none z-0" />
                      <input
                        type="range"
                        min="0"
                        max="9000"
                        value={Math.round(Math.min(9000, state.rpm))}
                        onChange={(e) => {
                          const rpm = +e.target.value;
                          const thrust = (rpm / 6200) * 50;
                          setState(p => ({...p, thrust: Math.max(0, Math.min(100, thrust))}));
                        }}
                        className="w-full h-3 bg-transparent rounded-full appearance-none cursor-pointer relative z-30"
                        style={{
                          WebkitAppearance: 'none',
                          background: 'transparent'
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-white/30">
                      <span>0</span>
                      <span className={cn(
                        "font-bold",
                        state.rpm >= 5800 && state.rpm <= 6600 ? "text-emerald-400" : "text-white/30"
                      )}>
                        Vùng Hover: 5800-6600
                      </span>
                      <span>9000</span>
                    </div>
                  </div>

                  {/* Real Data Panel */}
                  <RealDataPanel state={state} />
                </div>
              )}

              {/* ─── BATTERY & STABILIZATION CONTROLS ─── */}
              {(activeId === "battery" || activeId === "stabilization") && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-white/60">Lực đẩy Motor (Thrust)</span>
                      <span className="text-cyan-400 font-mono">{state.thrust}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={state.thrust} onChange={(e) => setState(p => ({...p, thrust: +e.target.value}))} disabled={isSimulating} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-cyan-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-white/60">Mức Pin (Battery)</span>
                      <span className={cn("font-mono", state.batteryLevel < 30 ? "text-red-400" : "text-emerald-400")}>{state.batteryLevel}%</span>
                    </div>
                    <input type="range" min="5" max="100" value={state.batteryLevel} onChange={(e) => setState(p => ({...p, batteryLevel: +e.target.value}))} disabled={isSimulating} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-cyan-500" />
                  </div>

                  {/* ─── BATTERY PHYSICS FORMULA PANEL ─── */}
                  {activeId === "battery" && (
                    <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-yellow-500/20 space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-yellow-400" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Công thức Pin</span>
                      </div>

                      {/* Battery Voltage */}
                      <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                        <div className="text-[9px] text-white/40 font-black uppercase mb-2">Điện áp Pin</div>
                        <div className="text-[11px] text-white/80 font-mono">
                          <span className="text-yellow-400">V</span>
                          <span className="text-white/40"> = V<sub>min</sub> + (V<sub>max</sub>−V<sub>min</sub>) × %</span>
                        </div>
                        <div className="text-[10px] text-white/50 font-mono">
                          = 18 + (25.2−18) × {state.batteryLevel}%
                        </div>
                        <div className="text-[11px] font-mono font-black text-yellow-400 pt-1 border-t border-white/10">
                          = {state.voltage.toFixed(2)} V
                        </div>
                      </div>

                      {/* Voltage Sag */}
                      <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                        <div className="text-[9px] text-white/40 font-black uppercase mb-2">Sụt áp (Voltage Sag)</div>
                        <div className="text-[11px] text-white/80 font-mono">
                          <span className="text-orange-400">ΔV</span>
                          <span className="text-white/40"> = I × R × n<sub>cells</sub></span>
                        </div>
                        <div className="text-[11px] font-mono text-orange-400">
                          = ~{((state.batteryLevel / 100) * 20 * 0.02 * 6).toFixed(2)} V
                        </div>
                      </div>

                      {/* RPM from Voltage */}
                      <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                        <div className="text-[9px] text-white/40 font-black uppercase mb-2">RPM Thực tế</div>
                        <div className="text-[11px] text-white/80 font-mono">
                          <span className="text-cyan-400">RPM<sub>eff</sub></span>
                          <span className="text-white/40"> = RPM<sub>hover</sub> × (V<sub>eff</sub>/V<sub>max</sub>)</span>
                        </div>
                        <div className="text-[10px] text-white/50 font-mono">
                          = 6200 × ({state.voltage.toFixed(1)}/25.2)
                        </div>
                        <div className="text-[11px] font-mono font-black text-cyan-400 pt-1 border-t border-white/10">
                          = {state.effectiveRPM.toFixed(0)} RPM
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── STABILIZATION PHYSICS FORMULA PANEL ─── */}
                  {activeId === "stabilization" && (
                    <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-emerald-500/20 space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Công thức Ổn định</span>
                      </div>

                      {/* Current State */}
                      <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                        <div className="text-[9px] text-white/40 font-black uppercase mb-2">Trạng thái Hiện tại</div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-white/60">Roll:</span>
                          <span className="text-[10px] font-mono text-cyan-400">{state.roll.toFixed(1)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-white/60">Pitch:</span>
                          <span className="text-[10px] font-mono text-cyan-400">{state.pitch.toFixed(1)}°</span>
                        </div>
                      </div>

                      {/* PID Control */}
                      <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                        <div className="text-[9px] text-white/40 font-black uppercase mb-2">Điều khiển PID</div>
                        <div className="text-[11px] text-white/80 font-mono">
                          {state.isStabilized ? (
                            <span className="text-emerald-400">θ<sub>target</sub> = 0° → Drone về mức</span>
                          ) : (
                            <span className="text-red-400">Không ổn định - Drone trôi</span>
                          )}
                        </div>
                        <div className="text-[10px] text-white/50 font-mono">
                          K<sub>p</sub>: 5.0, K<sub>i</sub>: 0.1, K<sub>d</sub>: 2.0
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── ROLL CONTROLS - RPM-based ─── */}
              {activeId === "roll" && (
                <div className="space-y-5">
                  {/* RPM Sliders */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <RotateCw className="w-4 h-4 text-blue-400" />
                          <span className="text-[11px] font-bold text-white/60">Tốc độ Trái (RPM)</span>
                        </div>
                        <span className="text-cyan-400 font-mono font-black">{Math.round(state.leftRPM)}</span>
                      </div>
                      <div className="relative">
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 h-3 bg-emerald-500/20 rounded-full pointer-events-none"
                          style={{ left: `${((5800 - 3000) / 6000) * 100}%`, width: `${((6600 - 5800) / 6000) * 100}%` }}
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-white/10 rounded-full" />
                        <input 
                          type="range" 
                          min="3000" 
                          max="9000" 
                          value={state.leftRPM} 
                          onChange={(e) => setState(p => ({...p, leftRPM: +e.target.value}))} 
                          disabled={isSimulating} 
                          className="w-full h-3 bg-transparent rounded-full appearance-none cursor-pointer relative z-10"
                          style={{ WebkitAppearance: 'none', background: 'transparent' }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] text-white/30">
                        <span>3000</span>
                        <span className="text-emerald-400/60 font-bold">Hover: 5800-6600</span>
                        <span>9000</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <RotateCw className="w-4 h-4 text-orange-400" />
                          <span className="text-[11px] font-bold text-white/60">Tốc độ Phải (RPM)</span>
                        </div>
                        <span className="text-cyan-400 font-mono font-black">{Math.round(state.rightRPM)}</span>
                      </div>
                      <div className="relative">
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 h-3 bg-emerald-500/20 rounded-full pointer-events-none"
                          style={{ left: `${((5800 - 3000) / 6000) * 100}%`, width: `${((6600 - 5800) / 6000) * 100}%` }}
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-white/10 rounded-full" />
                        <input 
                          type="range" 
                          min="3000" 
                          max="9000" 
                          value={state.rightRPM} 
                          onChange={(e) => setState(p => ({...p, rightRPM: +e.target.value}))} 
                          disabled={isSimulating} 
                          className="w-full h-3 bg-transparent rounded-full appearance-none cursor-pointer relative z-10"
                          style={{ WebkitAppearance: 'none', background: 'transparent' }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] text-white/30">
                        <span>3000</span>
                        <span className="text-emerald-400/60 font-bold">Hover: 5800-6600</span>
                        <span>9000</span>
                      </div>
                    </div>
                  </div>

                  {/* ─── ROLL DATA PANEL ─── */}
                  <div className="p-4 rounded-lg bg-slate-950/80 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Dữ liệu Roll</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* RPM Difference */}
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3 h-3 text-purple-400" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Chênh lệch RPM</span>
                        </div>
                        <span className={cn(
                          "text-lg font-black font-mono",
                          state.rpmDifference > 0 ? "text-blue-400" : state.rpmDifference < 0 ? "text-orange-400" : "text-white"
                        )}>
                          {state.rpmDifference > 0 ? "+" : ""}{Math.round(state.rpmDifference)}
                        </span>
                      </div>

                      {/* Tilt Angle */}
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <RotateCw className="w-3 h-3 text-cyan-400" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Góc Nghiêng</span>
                        </div>
                        <span className={cn(
                          "text-lg font-black font-mono",
                          state.tiltAngle > 0 ? "text-blue-400" : state.tiltAngle < 0 ? "text-orange-400" : "text-white"
                        )}>
                          {state.tiltAngle > 0 ? "+" : ""}{state.tiltAngle.toFixed(1)}°
                        </span>
                      </div>

                      {/* Side Force */}
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MoveHorizontal className="w-3 h-3 text-yellow-400" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Lực Ngang</span>
                        </div>
                        <span className="text-lg font-black font-mono text-yellow-400">
                          {state.sideForce.toFixed(2)} N
                        </span>
                      </div>

                      {/* Direction */}
                      <div className={cn(
                        "p-3 rounded-lg border transition-all",
                        state.rpmDifference > 100 ? "bg-blue-500/10 border-blue-500/30" :
                        state.rpmDifference < -100 ? "bg-orange-500/10 border-orange-500/30" : "bg-white/5 border-white/10"
                      )}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Target className="w-3 h-3 text-white/60" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Hướng di chuyển</span>
                        </div>
                        <span className={cn(
                          "text-lg font-black",
                          state.rpmDifference > 100 ? "text-blue-400" : 
                          state.rpmDifference < -100 ? "text-orange-400" : "text-white/60"
                        )}>
                          {state.rpmDifference > 100 ? "→ Phải" : 
                           state.rpmDifference < -100 ? "← Trái" : "⊕ Ổn định"}
                        </span>
                      </div>
                    </div>

                    {/* Educational Text */}
                    <div className="p-3 rounded-md bg-cyan-500/5 border border-cyan-500/10 mt-3">
                      <p className="text-[9px] text-white/50 leading-relaxed">
                        Khi một bên quay nhanh hơn, bên đó đẩy mạnh hơn, 
                        drone nghiêng, và lực nâng có thành phần ngang, 
                        gây ra di chuyển sang hai bên.
                      </p>
                    </div>
                  </div>

                  {/* ─── PHYSICS FORMULA PANEL ─── */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-purple-500/20 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-purple-400" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Công thức Vật lý</span>
                    </div>

                    {/* RPM -> Lift Force */}
                    <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[9px] text-white/40 font-black uppercase mb-2">Bước 1: Tính Lực Nâng</div>
                      <div className="text-[11px] text-white/80 font-mono">
                        <span className="text-orange-400">F<sub>nâng</sub></span>
                        <span className="text-white/40"> = k × RPM²</span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono">
                        = 3.52×10⁻⁷ × {state.leftRPM.toFixed(0)}²
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-[10px] text-white/60">Lực nâng mỗi bên:</span>
                        <span className="text-[11px] font-mono font-black text-emerald-400">
                          {state.liftForce.toFixed(2)} N
                        </span>
                      </div>
                    </div>

                    {/* Tilt Angle */}
                    <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[9px] text-white/40 font-black uppercase mb-2">Bước 2: Tính Góc Nghiêng</div>
                      <div className="text-[11px] text-white/80 font-mono">
                        <span className="text-cyan-400">θ</span>
                        <span className="text-white/40"> = Chênh lệch RPM / 150</span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono">
                        = {state.rpmDifference.toFixed(0)} / 150
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-[10px] text-white/60">Góc nghiêng:</span>
                        <span className="text-[11px] font-mono font-black text-cyan-400">
                          {state.tiltAngle.toFixed(1)}°
                        </span>
                      </div>
                    </div>

                    {/* Force Components */}
                    <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[9px] text-white/40 font-black uppercase mb-2">Bước 3: Phân tích Lực</div>
                      
                      {/* Total Lift */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span className="text-[10px] text-white/60">Tổng F nâng</span>
                        </div>
                        <span className="text-[11px] font-mono font-black text-cyan-400">
                          {state.liftForce.toFixed(2)} N
                        </span>
                      </div>
                      
                      {/* Vertical Component */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-[10px] text-white/60">F<sub>y</sub> (đứng)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-white/30">
                            {state.liftForce.toFixed(1)} × {Math.cos(state.tiltAngle * Math.PI / 180).toFixed(2)} =
                          </span>
                          <span className="text-[11px] font-mono font-black text-emerald-400">
                            {(state.liftForce * Math.cos(state.tiltAngle * Math.PI / 180)).toFixed(2)} N
                          </span>
                        </div>
                      </div>
                      
                      {/* Horizontal Component */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-400" />
                          <span className="text-[10px] text-white/60">F<sub>x</sub> (ngang)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-white/30">
                            {state.liftForce.toFixed(1)} × {Math.sin(state.tiltAngle * Math.PI / 180).toFixed(2)} =
                          </span>
                          <span className="text-[11px] font-mono font-black text-yellow-400">
                            {state.sideForce.toFixed(2)} N
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Main Formula */}
                    <div className="p-4 rounded-md bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                      <div className="text-[9px] text-yellow-400/60 uppercase text-center mb-2 font-black">Công thức tính Lực Ngang</div>
                      <div className="text-[14px] text-white font-mono text-center font-black">
                        <span className="text-yellow-400">F<sub>x</sub></span>
                        <span className="text-white/40"> = </span>
                        <span className="text-cyan-400">F</span>
                        <span className="text-white/40"> × sin(</span>
                        <span className="text-cyan-400">θ</span>
                        <span className="text-white/40">)</span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono text-center mt-1">
                        = {state.liftForce.toFixed(1)} × sin({state.tiltAngle.toFixed(1)}°)
                      </div>
                      <div className="text-[12px] text-white font-mono text-center mt-2 pt-2 border-t border-yellow-500/20">
                        <span className="text-yellow-400 font-black">= {state.sideForce.toFixed(2)} N</span>
                      </div>
                    </div>

                    {/* Trigonometry Values */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded bg-white/5 border border-white/5 text-center">
                        <div className="text-[8px] text-white/40 uppercase">sin(θ)</div>
                        <div className="text-[12px] font-mono font-black text-yellow-400">
                          {Math.sin(state.tiltAngle * Math.PI / 180).toFixed(3)}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-white/5 border border-white/5 text-center">
                        <div className="text-[8px] text-white/40 uppercase">cos(θ)</div>
                        <div className="text-[12px] font-mono font-black text-emerald-400">
                          {Math.cos(state.tiltAngle * Math.PI / 180).toFixed(3)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── PITCH CONTROLS ─── */}
              {activeId === "pitch" && (
                <div className="space-y-5">
                  {/* RPM Sliders */}
                  <div className="space-y-4">
                    {/* Front Motor RPM */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <RotateCw className="w-4 h-4 text-blue-400" />
                          <span className="text-[11px] font-bold text-white/60">RPM Trước</span>
                        </div>
                        <span className="text-cyan-400 font-mono font-black">{Math.round(state.frontRPM)}</span>
                      </div>
                      <div className="relative">
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 h-3 bg-emerald-500/20 rounded-full pointer-events-none"
                          style={{ left: `${((5800 - 3000) / 6000) * 100}%`, width: `${((6600 - 5800) / 6000) * 100}%` }}
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-white/10 rounded-full" />
                        <input 
                          type="range" 
                          min="3000" 
                          max="9000" 
                          value={state.frontRPM} 
                          onChange={(e) => setState(p => ({...p, frontRPM: +e.target.value}))} 
                          disabled={isSimulating} 
                          className="w-full h-3 bg-transparent rounded-full appearance-none cursor-pointer relative z-10"
                          style={{ WebkitAppearance: 'none', background: 'transparent' }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] text-white/30">
                        <span>3000</span>
                        <span className="text-emerald-400/60 font-bold">Hover: 5800-6600</span>
                        <span>9000</span>
                      </div>
                    </div>

                    {/* Rear Motor RPM */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <RotateCw className="w-4 h-4 text-purple-400" />
                          <span className="text-[11px] font-bold text-white/60">RPM Sau</span>
                        </div>
                        <span className="text-cyan-400 font-mono font-black">{Math.round(state.rearRPM)}</span>
                      </div>
                      <div className="relative">
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 h-3 bg-emerald-500/20 rounded-full pointer-events-none"
                          style={{ left: `${((5800 - 3000) / 6000) * 100}%`, width: `${((6600 - 5800) / 6000) * 100}%` }}
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-white/10 rounded-full" />
                        <input 
                          type="range" 
                          min="3000" 
                          max="9000" 
                          value={state.rearRPM} 
                          onChange={(e) => setState(p => ({...p, rearRPM: +e.target.value}))} 
                          disabled={isSimulating} 
                          className="w-full h-3 bg-transparent rounded-full appearance-none cursor-pointer relative z-10"
                          style={{ WebkitAppearance: 'none', background: 'transparent' }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] text-white/30">
                        <span>3000</span>
                        <span className="text-emerald-400/60 font-bold">Hover: 5800-6600</span>
                        <span>9000</span>
                      </div>
                    </div>
                  </div>

                  {/* ─── PITCH DATA PANEL ─── */}
                  <div className="p-4 rounded-lg bg-slate-950/80 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Dữ liệu Pitch</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* RPM Difference */}
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3 h-3 text-purple-400" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Chênh lệch RPM</span>
                        </div>
                        <span className={cn(
                          "text-lg font-black font-mono",
                          state.frontRPM - state.rearRPM > 0 ? "text-blue-400" : state.frontRPM - state.rearRPM < 0 ? "text-purple-400" : "text-white"
                        )}>
                          {state.frontRPM - state.rearRPM > 0 ? "+" : ""}{Math.round(state.frontRPM - state.rearRPM)}
                        </span>
                      </div>

                      {/* Pitch Angle */}
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <RotateCw className="w-3 h-3 text-cyan-400" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Góc Pitch</span>
                        </div>
                        <span className={cn(
                          "text-lg font-black font-mono",
                          state.pitch > 0 ? "text-blue-400" : state.pitch < 0 ? "text-purple-400" : "text-white"
                        )}>
                          {state.pitch > 0 ? "+" : ""}{state.pitch.toFixed(1)}°
                        </span>
                      </div>

                      {/* Forward Force */}
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MoveHorizontal className="w-3 h-3 text-yellow-400" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Lực Tiến</span>
                        </div>
                        <span className="text-lg font-black font-mono text-yellow-400">
                          {state.sideForce.toFixed(2)} N
                        </span>
                      </div>

                      {/* Direction */}
                      <div className={cn(
                        "p-3 rounded-lg border transition-all",
                        state.frontRPM - state.rearRPM > 100 ? "bg-blue-500/10 border-blue-500/30" :
                        state.frontRPM - state.rearRPM < -100 ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/10"
                      )}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Target className="w-3 h-3 text-white/60" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Hướng di chuyển</span>
                        </div>
                        <span className={cn(
                          "text-lg font-black",
                          state.frontRPM - state.rearRPM > 100 ? "text-blue-400" : 
                          state.frontRPM - state.rearRPM < -100 ? "text-purple-400" : "text-white/60"
                        )}>
                          {state.frontRPM - state.rearRPM > 100 ? "↓ Lên" : 
                           state.frontRPM - state.rearRPM < -100 ? "↑ Xuống" : "⊕ Ổn định"}
                        </span>
                      </div>
                    </div>

                    {/* Educational Text */}
                    <div className="p-3 rounded-md bg-cyan-500/5 border border-cyan-500/10 mt-3">
                      <p className="text-[9px] text-white/50 leading-relaxed">
                        Khi phía trước quay nhanh hơn, mũi drone chúc xuống, 
                        tạo lực đẩy về phía trước. Ngược lại khi phía sau quay nhanh hơn.
                      </p>
                    </div>
                  </div>

                  {/* ─── PITCH PHYSICS FORMULA PANEL ─── */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-purple-500/20 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-purple-400" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Công thức Vật lý</span>
                    </div>

                    {/* RPM -> Lift Force */}
                    <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[9px] text-white/40 font-black uppercase mb-2">Bước 1: Tính Lực Nâng</div>
                      <div className="text-[11px] text-white/80 font-mono">
                        <span className="text-emerald-400">F<sub>nâng</sub></span>
                        <span className="text-white/40"> = k × RPM²</span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono">
                        = 3.52×10⁻⁷ × {state.frontRPM.toFixed(0)}²
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-[10px] text-white/60">Lực nâng TB:</span>
                        <span className="text-[11px] font-mono font-black text-emerald-400">
                          {state.liftForce.toFixed(2)} N
                        </span>
                      </div>
                    </div>

                    {/* Pitch Angle */}
                    <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[9px] text-white/40 font-black uppercase mb-2">Bước 2: Tính Góc Pitch</div>
                      <div className="text-[11px] text-white/80 font-mono">
                        <span className="text-cyan-400">θ</span>
                        <span className="text-white/40"> = (RPM<sub>truoc</sub> − RPM<sub>sau</sub>) / 100</span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono">
                        = ({state.frontRPM.toFixed(0)} − {state.rearRPM.toFixed(0)}) / 100
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-[10px] text-white/60">Góc pitch:</span>
                        <span className="text-[11px] font-mono font-black text-cyan-400">
                          {state.pitch.toFixed(1)}°
                        </span>
                      </div>
                    </div>

                    {/* Force Components */}
                    <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[9px] text-white/40 font-black uppercase mb-2">Bước 3: Phân tích Lực</div>
                      
                      {/* Total Lift */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span className="text-[10px] text-white/60">Tổng F nâng</span>
                        </div>
                        <span className="text-[11px] font-mono font-black text-cyan-400">
                          {state.liftForce.toFixed(2)} N
                        </span>
                      </div>
                      
                      {/* Vertical Component */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-[10px] text-white/60">F<sub>y</sub> (đứng)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-white/30">
                            {state.liftForce.toFixed(1)} × {Math.cos(state.pitch * Math.PI / 180).toFixed(2)} =
                          </span>
                          <span className="text-[11px] font-mono font-black text-emerald-400">
                            {(state.liftForce * Math.cos(state.pitch * Math.PI / 180)).toFixed(2)} N
                          </span>
                        </div>
                      </div>
                      
                      {/* Forward Component */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-400" />
                          <span className="text-[10px] text-white/60">F<sub>x</sub> (tiến)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-white/30">
                            {state.liftForce.toFixed(1)} × {Math.sin(state.pitch * Math.PI / 180).toFixed(2)} =
                          </span>
                          <span className="text-[11px] font-mono font-black text-yellow-400">
                            {state.sideForce.toFixed(2)} N
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Main Formula */}
                    <div className="p-4 rounded-md bg-gradient-to-r from-yellow-500/10 to-blue-500/10 border border-yellow-500/30">
                      <div className="text-[9px] text-yellow-400/60 uppercase text-center mb-2 font-black">Công thức tính Lực Tiến</div>
                      <div className="text-[14px] text-white font-mono text-center font-black">
                        <span className="text-yellow-400">F<sub>x</sub></span>
                        <span className="text-white/40"> = </span>
                        <span className="text-cyan-400">F</span>
                        <span className="text-white/40"> × sin(</span>
                        <span className="text-cyan-400">θ</span>
                        <span className="text-white/40">)</span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono text-center mt-1">
                        = {state.liftForce.toFixed(1)} × sin({state.pitch.toFixed(1)}°)
                      </div>
                      <div className="text-[12px] text-white font-mono text-center mt-2 pt-2 border-t border-yellow-500/20">
                        <span className="text-yellow-400 font-black">= {state.sideForce.toFixed(2)} N</span>
                      </div>
                    </div>

                    {/* Trigonometry Values */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded bg-white/5 border border-white/5 text-center">
                        <div className="text-[8px] text-white/40 uppercase">sin(θ)</div>
                        <div className="text-[12px] font-mono font-black text-yellow-400">
                          {Math.sin(state.pitch * Math.PI / 180).toFixed(3)}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-white/5 border border-white/5 text-center">
                        <div className="text-[8px] text-white/40 uppercase">cos(θ)</div>
                        <div className="text-[12px] font-mono font-black text-emerald-400">
                          {Math.cos(state.pitch * Math.PI / 180).toFixed(3)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── YAW CONTROLS ─── */}
              {activeId === "yaw" && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl bg-slate-950/80 border border-white/10 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-orange-500/5 opacity-50" />
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 text-center relative z-10">Cấu hình Động cơ</div>
                    
                    <div className="relative w-48 h-48 mx-auto mb-4 flex items-center justify-center">
                      <div className="absolute w-full h-0.5 bg-white/5 rotate-45" />
                      <div className="absolute w-full h-0.5 bg-white/5 -rotate-45" />
                      <div className="absolute w-12 h-12 rounded-full border-2 border-white/10 bg-slate-900 flex items-center justify-center">
                        <RotateCw className="w-4 h-4 text-white/20" />
                      </div>

                      {/* FL */}
                      <div className="absolute -top-2 -left-2 flex flex-col items-center">
                        <div className={cn("w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all", state.motorFL_RPM > 6000 ? "bg-blue-500/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-slate-900 border-white/10")}>
                          <span className="text-[10px] font-black text-blue-400">FL</span>
                          <span className="text-[11px] font-mono font-bold text-white">{Math.round(state.motorFL_RPM)}</span>
                        </div>
                        <span className="text-[8px] mt-1 font-black text-blue-400/60 uppercase">CCW ↺</span>
                      </div>

                      {/* FR */}
                      <div className="absolute -top-2 -right-2 flex flex-col items-center">
                        <div className={cn("w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all", state.motorFR_RPM > 6000 ? "bg-orange-500/20 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]" : "bg-slate-900 border-white/10")}>
                          <span className="text-[10px] font-black text-orange-400">FR</span>
                          <span className="text-[11px] font-mono font-bold text-white">{Math.round(state.motorFR_RPM)}</span>
                        </div>
                        <span className="text-[8px] mt-1 font-black text-orange-400/60 uppercase">CW ↻</span>
                      </div>

                      {/* RL */}
                      <div className="absolute -bottom-2 -left-2 flex flex-col items-center">
                        <div className={cn("w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all", state.motorRL_RPM > 6000 ? "bg-orange-500/20 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]" : "bg-slate-900 border-white/10")}>
                          <span className="text-[10px] font-black text-orange-400">RL</span>
                          <span className="text-[11px] font-mono font-bold text-white">{Math.round(state.motorRL_RPM)}</span>
                        </div>
                        <span className="text-[8px] mt-1 font-black text-orange-400/60 uppercase">CW ↻</span>
                      </div>

                      {/* RR */}
                      <div className="absolute -bottom-2 -right-2 flex flex-col items-center">
                        <div className={cn("w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all", state.motorRR_RPM > 6000 ? "bg-blue-500/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-slate-900 border-white/10")}>
                          <span className="text-[10px] font-black text-blue-400">RR</span>
                          <span className="text-[11px] font-mono font-bold text-white">{Math.round(state.motorRR_RPM)}</span>
                        </div>
                        <span className="text-[8px] mt-1 font-black text-blue-400/60 uppercase">CCW ↺</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-orange-500" />
                           <span className="text-[10px] font-black text-orange-400 uppercase">Nhóm CW (FR + RL)</span>
                        </div>
                        <span className="text-[12px] font-mono font-black text-orange-400">{Math.round(state.motorFR_RPM)} RPM</span>
                      </div>
                      <input 
                        type="range" min="3000" max="9000" 
                        value={state.motorFR_RPM} 
                        onChange={(e) => {
                          const val = +e.target.value;
                          setState(p => ({...p, motorFR_RPM: val, motorRL_RPM: val}));
                        }} 
                        disabled={isSimulating} 
                        className="w-full h-1.5 bg-orange-500/10 rounded-full appearance-none accent-orange-500 cursor-pointer" 
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-blue-500" />
                           <span className="text-[10px] font-black text-blue-400 uppercase">Nhóm CCW (FL + RR)</span>
                        </div>
                        <span className="text-[12px] font-mono font-black text-blue-400">{Math.round(state.motorFL_RPM)} RPM</span>
                      </div>
                      <input 
                        type="range" min="3000" max="9000" 
                        value={state.motorFL_RPM} 
                        onChange={(e) => {
                          const val = +e.target.value;
                          setState(p => ({...p, motorFL_RPM: val, motorRR_RPM: val}));
                        }} 
                        disabled={isSimulating} 
                        className="w-full h-1.5 bg-blue-500/10 rounded-full appearance-none accent-blue-500 cursor-pointer" 
                      />
                    </div>
                  </div>

                  {/* ─── YAW DATA PANEL ─── */}
                  <div className="p-4 rounded-lg bg-slate-950/80 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-orange-400" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Dữ liệu Yaw</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* CW Torque */}
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <RotateCw className="w-3 h-3 text-orange-400" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Mô-men CW</span>
                        </div>
                        <span className="text-lg font-black font-mono text-orange-400">
                          {state.cwTorque.toFixed(2)} N
                        </span>
                      </div>

                      {/* CCW Torque */}
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <RotateCw className="w-3 h-3 text-blue-400" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Mô-men CCW</span>
                        </div>
                        <span className="text-lg font-black font-mono text-blue-400">
                          {state.ccwTorque.toFixed(2)} N
                        </span>
                      </div>

                      {/* Net Torque */}
                      <div className={cn(
                        "p-3 rounded-lg border transition-all",
                        state.yawTorque > 0.1 ? "bg-blue-500/10 border-blue-500/30" :
                        state.yawTorque < -0.1 ? "bg-orange-500/10 border-orange-500/30" : "bg-white/5 border-white/10"
                      )}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3 h-3 text-white/60" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Mô-men Ròng</span>
                        </div>
                        <span className={cn(
                          "text-lg font-black font-mono",
                          state.yawTorque > 0.1 ? "text-blue-400" : 
                          state.yawTorque < -0.1 ? "text-orange-400" : "text-white"
                        )}>
                          {state.yawTorque > 0 ? "+" : ""}{state.yawTorque.toFixed(2)} N
                        </span>
                      </div>

                      {/* Rotation Direction */}
                      <div className={cn(
                        "p-3 rounded-lg border transition-all",
                        state.yawTorque > 0.1 ? "bg-blue-500/10 border-blue-500/30" :
                        state.yawTorque < -0.1 ? "bg-orange-500/10 border-orange-500/30" : "bg-white/5 border-white/10"
                      )}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Target className="w-3 h-3 text-white/60" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Hướng Quay</span>
                        </div>
                        <span className={cn(
                          "text-lg font-black",
                          state.yawTorque > 0.1 ? "text-blue-400" : 
                          state.yawTorque < -0.1 ? "text-orange-400" : "text-white/60"
                        )}>
                          {state.yawTorque > 0.1 ? "↺ Ngược" : 
                           state.yawTorque < -0.1 ? "↻ Thuận" : "⊕ Cân bằng"}
                        </span>
                      </div>
                    </div>

                    {/* Educational Text */}
                    <div className="p-3 rounded-md bg-orange-500/5 border border-orange-500/10 mt-3">
                      <p className="text-[9px] text-white/50 leading-relaxed">
                        Khi hai nhóm motor quay với tốc độ khác nhau, chênh lệch mô-men xoắn 
                        tạo ra lực làm drone xoay quanh trục đứng (yaw).
                      </p>
                    </div>
                  </div>

                    {/* ─── YAW PHYSICS FORMULA PANEL ─── */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-orange-500/20 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-orange-400" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Công thức Vật lý</span>
                    </div>

                    {/* Lực từng motor */}
                    <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[9px] text-white/40 font-black uppercase mb-2">Bước 1: Tính Lực từng Motor</div>
                      <div className="text-[10px] text-white/70 font-mono space-y-1">
                        <div>F<sub>FL</sub> = 3.52×10⁻⁷ × {state.motorFL_RPM.toFixed(0)}² = <span className="text-blue-400">{(calculateLiftForce(state.motorFL_RPM)).toFixed(2)} N</span></div>
                        <div>F<sub>FR</sub> = 3.52×10⁻⁷ × {state.motorFR_RPM.toFixed(0)}² = <span className="text-orange-400">{(calculateLiftForce(state.motorFR_RPM)).toFixed(2)} N</span></div>
                        <div>F<sub>RL</sub> = 3.52×10⁻⁷ × {state.motorRL_RPM.toFixed(0)}² = <span className="text-orange-400">{(calculateLiftForce(state.motorRL_RPM)).toFixed(2)} N</span></div>
                        <div>F<sub>RR</sub> = 3.52×10⁻⁷ × {state.motorRR_RPM.toFixed(0)}² = <span className="text-blue-400">{(calculateLiftForce(state.motorRR_RPM)).toFixed(2)} N</span></div>
                      </div>
                    </div>

                    {/* Tính Mô-men */}
                    <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[9px] text-white/40 font-black uppercase mb-2">Bước 2: Tính Mô-men</div>
                      <div className="text-[11px] text-white/80 font-mono">
                        <span className="text-orange-400">τ<sub>CW</sub></span>
                        <span className="text-white/40"> = F<sub>FR</sub> + F<sub>RL</sub></span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono">
                        = {(calculateLiftForce(state.motorFR_RPM)).toFixed(2)} + {(calculateLiftForce(state.motorRL_RPM)).toFixed(2)}
                      </div>
                      <div className="text-[11px] font-mono text-orange-400 font-black pt-1 border-t border-white/5">
                        = {state.cwTorque.toFixed(2)} N
                      </div>
                      
                      <div className="text-[11px] text-white/80 font-mono mt-2">
                        <span className="text-blue-400">τ<sub>CCW</sub></span>
                        <span className="text-white/40"> = F<sub>FL</sub> + F<sub>RR</sub></span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono">
                        = {(calculateLiftForce(state.motorFL_RPM)).toFixed(2)} + {(calculateLiftForce(state.motorRR_RPM)).toFixed(2)}
                      </div>
                      <div className="text-[11px] font-mono text-blue-400 font-black pt-1 border-t border-white/5">
                        = {state.ccwTorque.toFixed(2)} N
                      </div>
                    </div>

                    {/* Mô-men Ròng */}
                    <div className="p-4 rounded-md bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                      <div className="text-[9px] text-yellow-400/60 uppercase text-center mb-2 font-black">Mô-men Xoắn Ròng</div>
                      <div className="text-[14px] text-white font-mono text-center font-black">
                        <span className="text-yellow-400">τ<sub>net</sub></span>
                        <span className="text-white/40"> = </span>
                        <span className="text-blue-400">τ<sub>CCW</sub></span>
                        <span className="text-white/40"> − </span>
                        <span className="text-orange-400">τ<sub>CW</sub></span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono text-center mt-1">
                        = {state.ccwTorque.toFixed(2)} − {state.cwTorque.toFixed(2)}
                      </div>
                      <div className="text-[12px] text-white font-mono text-center mt-2 pt-2 border-t border-yellow-500/20">
                        <span className={state.yawTorque > 0 ? "text-blue-400" : state.yawTorque < 0 ? "text-orange-400" : "text-white"}>
                          = {state.yawTorque > 0 ? "+" : ""}{state.yawTorque.toFixed(2)} N
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── WIND CONTROL ─── */}
              {activeId === "wind" && (
                <div className="space-y-5">
                  {/* Wind Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-sky-400" />
                        <span className="text-[11px] font-bold text-white/60">Cường độ gió thổi</span>
                      </div>
                      <span className="text-cyan-400 font-mono font-black">{state.windForce}%</span>
                    </div>
                    <div className="relative">
                      <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-white/10 rounded-full" />
                      <input type="range" min="0" max="100" value={state.windForce} onChange={(e) => setState(p => ({...p, windForce: +e.target.value}))} disabled={isSimulating} className="w-full h-3 bg-transparent rounded-full appearance-none cursor-pointer relative z-10" style={{ WebkitAppearance: 'none', background: 'transparent' }} />
                    </div>
                    <div className="flex justify-between text-[8px] text-white/30">
                      <span>0 m/s</span>
                      <span className="text-sky-400/60 font-bold">{(state.windForce / 100 * 10).toFixed(1)} m/s</span>
                      <span>10 m/s</span>
                    </div>
                  </div>

                  {/* ─── WIND DATA PANEL ─── */}
                  <div className="p-4 rounded-lg bg-slate-950/80 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-sky-400" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Dữ liệu Gió</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Wind Speed */}
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Wind className="w-3 h-3 text-sky-400" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Tốc độ Gió</span>
                        </div>
                        <span className="text-lg font-black font-mono text-sky-400">
                          {(state.windForce / 100 * 10).toFixed(1)} m/s
                        </span>
                      </div>

                      {/* Wind Force */}
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <ArrowUp className="w-3 h-3 text-cyan-400" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Lực Gió</span>
                        </div>
                        <span className="text-lg font-black font-mono text-cyan-400">
                          {state.windForceN.toFixed(3)} N
                        </span>
                      </div>

                      {/* Drag Force */}
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3 h-3 text-orange-400" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Lực Cản</span>
                        </div>
                        <span className="text-lg font-black font-mono text-orange-400">
                          {state.dragForceN.toFixed(3)} N
                        </span>
                      </div>

                      {/* Wind Direction */}
                      <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/30">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Target className="w-3 h-3 text-white/60" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Hướng</span>
                        </div>
                        <span className="text-lg font-black text-sky-400">
                          → Phải
                        </span>
                      </div>
                    </div>

                    {/* Educational Text */}
                    <div className="p-3 rounded-md bg-sky-500/5 border border-sky-500/10 mt-3">
                      <p className="text-[9px] text-white/50 leading-relaxed">
                        Gió thổi ngang tạo lực đẩy lên drone. Lực cản không khí 
                        chống lại chuyển động của drone trong không khí.
                      </p>
                    </div>
                  </div>

                  {/* ─── WIND PHYSICS FORMULA PANEL ─── */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-sky-500/20 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-sky-400" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Công thức Vật lý</span>
                    </div>

                    {/* Wind Speed */}
                    <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[9px] text-white/40 font-black uppercase mb-2">Bước 1: Tốc độ Gió</div>
                      <div className="text-[11px] text-white/80 font-mono">
                        <span className="text-sky-400">v</span>
                        <span className="text-white/40"> = (Gió / 100) × 10 m/s</span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono">
                        = ({state.windForce} / 100) × 10 = <span className="text-sky-400">{(state.windForce / 100 * 10).toFixed(1)} m/s</span>
                      </div>
                    </div>

                    {/* Wind Force */}
                    <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[9px] text-white/40 font-black uppercase mb-2">Bước 2: Lực Gió</div>
                      <div className="text-[11px] text-white/80 font-mono">
                        <span className="text-cyan-400">F<sub>gió</sub></span>
                        <span className="text-white/40"> = ½ × ρ × v² × Cd × A</span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono">
                        = ½ × 1.225 × {(state.windForce / 100 * 10) ** 2}.toFixed(1) × 1.0 × 0.05
                      </div>
                      <div className="text-[11px] font-mono font-black text-cyan-400 pt-1 border-t border-white/10">
                        = {state.windForceN.toFixed(3)} N
                      </div>
                    </div>

                    {/* Main Formula */}
                    <div className="p-4 rounded-md bg-gradient-to-r from-cyan-500/10 to-sky-500/10 border border-sky-500/30">
                      <div className="text-[9px] text-sky-400/60 uppercase text-center mb-2 font-black">Công thức Lực Cản</div>
                      <div className="text-[14px] text-white font-mono text-center font-black">
                        <span className="text-orange-400">F<sub>cản</sub></span>
                        <span className="text-white/40"> = ½</span>
                        <span className="text-white">ρ</span>
                        <span className="text-white/40">v²</span>
                        <span className="text-white">Cd</span>
                        <span className="text-white/40">A</span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono text-center mt-1">
                        = ½ × 1.225 × {(state.windForce / 100 * 10).toFixed(1)}² × 1.0 × 0.05
                      </div>
                      <div className="text-[12px] text-white font-mono text-center mt-2 pt-2 border-t border-sky-500/20">
                        <span className="text-orange-400 font-black">= {state.dragForceN.toFixed(3)} N</span>
                      </div>
                    </div>

                    {/* Physics Constants */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded bg-white/5 border border-white/5 text-center">
                        <div className="text-[7px] text-white/40 uppercase">ρ (kg/m³)</div>
                        <div className="text-[10px] font-mono font-black text-sky-400">1.225</div>
                      </div>
                      <div className="p-2 rounded bg-white/5 border border-white/5 text-center">
                        <div className="text-[7px] text-white/40 uppercase">Cd</div>
                        <div className="text-[10px] font-mono font-black text-white">1.0</div>
                      </div>
                      <div className="p-2 rounded bg-white/5 border border-white/5 text-center">
                        <div className="text-[7px] text-white/40 uppercase">A (m²)</div>
                        <div className="text-[10px] font-mono font-black text-white">0.05</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── WEIGHT OFFSET CONTROL ─── */}
              {activeId === "weight" && (
                <div className="space-y-5">
                  {/* Weight Offset Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Weight className="w-4 h-4 text-red-400" />
                        <span className="text-[11px] font-bold text-white/60">Độ lệch thiết bị</span>
                      </div>
                      <span className={cn(
                        "font-mono font-black",
                        state.weightOffset > 0 ? "text-orange-400" : state.weightOffset < 0 ? "text-blue-400" : "text-white"
                      )}>
                        {state.weightOffset > 0 ? "→ Phải" : state.weightOffset < 0 ? "← Trái" : "⊕ Cân bằng"}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-white/10 rounded-full" />
                      {/* Center marker */}
                      <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/30 -translate-x-1/2 left-1/2" />
                      <input type="range" min="-1" max="1" step="0.2" value={state.weightOffset} onChange={(e) => setState(p => ({...p, weightOffset: +e.target.value}))} disabled={isSimulating} className="w-full h-3 bg-transparent rounded-full appearance-none cursor-pointer relative z-10" style={{ WebkitAppearance: 'none', background: 'transparent' }} />
                    </div>
                    <div className="flex justify-between text-[8px] text-white/30">
                      <span>← Lệch Trái</span>
                      <span className="text-white/50">Cân bằng</span>
                      <span>Lệch Phải →</span>
                    </div>
                  </div>

                  {/* ─── WEIGHT DATA PANEL ─── */}
                  <div className="p-4 rounded-lg bg-slate-950/80 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-red-400" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Dữ liệu Trọng tâm</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Weight Offset */}
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Weight className="w-3 h-3 text-red-400" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Độ lệch</span>
                        </div>
                        <span className={cn(
                          "text-lg font-black font-mono",
                          state.weightOffset > 0 ? "text-orange-400" : state.weightOffset < 0 ? "text-blue-400" : "text-white"
                        )}>
                          {state.weightOffset > 0 ? "+" : ""}{state.weightOffset.toFixed(1)}
                        </span>
                      </div>

                      {/* Distance */}
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MoveHorizontal className="w-3 h-3 text-white/60" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Khoảng cách</span>
                        </div>
                        <span className="text-lg font-black font-mono text-white">
                          {(state.weightOffset * 0.15).toFixed(2)} m
                        </span>
                      </div>

                      {/* Torque */}
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                          <RotateCw className="w-3 h-3 text-purple-400" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Mô-men</span>
                        </div>
                        <span className="text-lg font-black font-mono text-purple-400">
                          {state.torqueFromWeight.toFixed(3)} N·m
                        </span>
                      </div>

                      {/* Roll Angle */}
                      <div className={cn(
                        "p-3 rounded-lg border transition-all",
                        state.roll > 1 ? "bg-orange-500/10 border-orange-500/30" :
                        state.roll < -1 ? "bg-blue-500/10 border-blue-500/30" : "bg-white/5 border-white/10"
                      )}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3 h-3 text-white/60" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Góc Nghiêng</span>
                        </div>
                        <span className={cn(
                          "text-lg font-black font-mono",
                          state.roll > 1 ? "text-orange-400" : 
                          state.roll < -1 ? "text-blue-400" : "text-white"
                        )}>
                          {state.roll > 0 ? "+" : ""}{state.roll.toFixed(1)}°
                        </span>
                      </div>
                    </div>

                    {/* Educational Text */}
                    <div className="p-3 rounded-md bg-red-500/5 border border-red-500/10 mt-3">
                      <p className="text-[9px] text-white/50 leading-relaxed">
                        Khi đặt thiết bị lệch khỏi trọng tâm, trọng lượng tạo ra 
                        mô-men làm drone nghiêng sang một bên.
                      </p>
                    </div>
                  </div>

                  {/* ─── WEIGHT PHYSICS FORMULA PANEL ─── */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-red-500/20 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-red-400" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Công thức Vật lý</span>
                    </div>

                    {/* Distance Calculation */}
                    <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[9px] text-white/40 font-black uppercase mb-2">Bước 1: Khoảng cách lệch</div>
                      <div className="text-[11px] text-white/80 font-mono">
                        <span className="text-white">d</span>
                        <span className="text-white/40"> = offset × 0.15 m</span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono">
                        = {state.weightOffset.toFixed(1)} × 0.15
                      </div>
                      <div className="text-[11px] font-mono font-black text-yellow-400 pt-1 border-t border-white/10">
                        = {(state.weightOffset * 0.15).toFixed(2)} m
                      </div>
                    </div>

                    {/* Torque Calculation */}
                    <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[9px] text-white/40 font-black uppercase mb-2">Bước 2: Tính Mô-men</div>
                      <div className="text-[11px] text-white/80 font-mono">
                        <span className="text-red-400">τ</span>
                        <span className="text-white/40"> = m × g × d</span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono">
                        = 0.5 × 9.81 × {state.weightOffset.toFixed(1)} × 0.15 × 0.5
                      </div>
                      <div className="text-[11px] font-mono font-black text-purple-400 pt-1 border-t border-white/10">
                        = {state.torqueFromWeight.toFixed(3)} N·m
                      </div>
                    </div>

                    {/* Roll Angle */}
                    <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[9px] text-white/40 font-black uppercase mb-2">Bước 3: Góc Nghiêng</div>
                      <div className="text-[11px] text-white/80 font-mono">
                        <span className="text-cyan-400">θ</span>
                        <span className="text-white/40"> = τ × 3</span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono">
                        = {state.torqueFromWeight.toFixed(3)} × 3
                      </div>
                      <div className="text-[11px] font-mono font-black text-cyan-400 pt-1 border-t border-white/10">
                        = {(state.torqueFromWeight * 3).toFixed(1)}°
                      </div>
                    </div>

                    {/* Main Formula */}
                    <div className="p-4 rounded-md bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30">
                      <div className="text-[9px] text-red-400/60 uppercase text-center mb-2 font-black">Công thức Mô-men</div>
                      <div className="text-[14px] text-white font-mono text-center font-black">
                        <span className="text-red-400">τ</span>
                        <span className="text-white/40"> = </span>
                        <span className="text-white">m</span>
                        <span className="text-white/40"> × </span>
                        <span className="text-yellow-400">g</span>
                        <span className="text-white/40"> × </span>
                        <span className="text-yellow-400">d</span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono text-center mt-1">
                        = 0.5 × 9.81 × {(state.weightOffset * 0.15).toFixed(2)}
                      </div>
                      <div className="text-[12px] text-white font-mono text-center mt-2 pt-2 border-t border-red-500/20">
                        <span className="text-red-400 font-black">= {state.torqueFromWeight.toFixed(3)} N·m</span>
                      </div>
                    </div>

                    {/* Physics Constants */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded bg-white/5 border border-white/5 text-center">
                        <div className="text-[7px] text-white/40 uppercase">m (kg)</div>
                        <div className="text-[10px] font-mono font-black text-red-400">0.5</div>
                      </div>
                      <div className="p-2 rounded bg-white/5 border border-white/5 text-center">
                        <div className="text-[7px] text-white/40 uppercase">g (m/s²)</div>
                        <div className="text-[10px] font-mono font-black text-yellow-400">9.81</div>
                      </div>
                      <div className="p-2 rounded bg-white/5 border border-white/5 text-center">
                        <div className="text-[7px] text-white/40 uppercase">d (m)</div>
                        <div className="text-[10px] font-mono font-black text-white">{(state.weightOffset * 0.15).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STABILIZATION CONTROL ─── */}
              {activeId === "stabilization" && (
                <div className="space-y-5">
                  {/* Auto-Level Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Gauge className="w-5 h-5 text-emerald-400" />
                      <span className="text-[11px] font-bold text-white/60">Chế độ Auto-Level</span>
                    </div>
                    <button 
                      onClick={() => setState(p => ({...p, isStabilized: !p.isStabilized}))} 
                      disabled={isSimulating} 
                      className={cn(
                        "px-6 py-2 rounded-md text-[11px] font-black uppercase transition-all",
                        state.isStabilized 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                          : "bg-white/5 text-white/30 border border-white/10"
                      )}
                    >
                      {state.isStabilized ? "ON ✓" : "OFF"}
                    </button>
                  </div>

                  {/* ─── STABILIZATION DATA PANEL ─── */}
                  <div className="p-4 rounded-lg bg-slate-950/80 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Dữ liệu Ổn định</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Roll Angle */}
                      <div className={cn(
                        "p-3 rounded-lg border transition-all",
                        Math.abs(state.roll) > 5 ? "bg-red-500/10 border-red-500/30" :
                        Math.abs(state.roll) > 2 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-emerald-500/10 border-emerald-500/30"
                      )}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <RotateCw className="w-3 h-3 text-cyan-400" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Roll</span>
                        </div>
                        <span className={cn(
                          "text-lg font-black font-mono",
                          Math.abs(state.roll) > 5 ? "text-red-400" :
                          Math.abs(state.roll) > 2 ? "text-yellow-400" : "text-emerald-400"
                        )}>
                          {state.roll > 0 ? "+" : ""}{state.roll.toFixed(1)}°
                        </span>
                      </div>

                      {/* Pitch Angle */}
                      <div className={cn(
                        "p-3 rounded-lg border transition-all",
                        Math.abs(state.pitch) > 5 ? "bg-red-500/10 border-red-500/30" :
                        Math.abs(state.pitch) > 2 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-emerald-500/10 border-emerald-500/30"
                      )}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Wind className="w-3 h-3 text-purple-400" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Pitch</span>
                        </div>
                        <span className={cn(
                          "text-lg font-black font-mono",
                          Math.abs(state.pitch) > 5 ? "text-red-400" :
                          Math.abs(state.pitch) > 2 ? "text-yellow-400" : "text-emerald-400"
                        )}>
                          {state.pitch > 0 ? "+" : ""}{state.pitch.toFixed(1)}°
                        </span>
                      </div>

                      {/* Stabilization Status */}
                      <div className={cn(
                        "p-3 rounded-lg border transition-all col-span-2",
                        state.isStabilized ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
                      )}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Gauge className="w-3 h-3 text-white/60" />
                          <span className="text-[8px] font-bold text-white/40 uppercase">Trạng thái</span>
                        </div>
                        <span className={cn(
                          "text-lg font-black",
                          state.isStabilized ? "text-emerald-400" : "text-red-400"
                        )}>
                          {state.isStabilized ? "✓ Tự cân bằng" : "✗ Không ổn định"}
                        </span>
                      </div>
                    </div>

                    {/* Educational Text */}
                    <div className={cn(
                      "p-3 rounded-md mt-3 border",
                      state.isStabilized ? "bg-emerald-500/5 border-emerald-500/10" : "bg-red-500/5 border-red-500/10"
                    )}>
                      <p className="text-[9px] text-white/50 leading-relaxed">
                        {state.isStabilized 
                          ? "Auto-Level đang bật: Drone tự động về vị trí cân bằng nhờ bộ điều khiển PID."
                          : "Auto-Level đang tắt: Drone sẽ bị nghiêng và trôi dần do nhiễu ngẫu nhiên."}
                      </p>
                    </div>
                  </div>

                  {/* ─── STABILIZATION PHYSICS FORMULA PANEL ─── */}
                  <div className="p-4 rounded-lg bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-emerald-500/20 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Bộ điều khiển PID</span>
                    </div>

                    {/* PID Components */}
                    <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[9px] text-white/40 font-black uppercase mb-2">Thành phần PID</div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 rounded bg-white/5">
                          <div className="text-[8px] text-white/40 uppercase mb-1">K<sub>p</sub></div>
                          <div className="text-[11px] font-mono font-black text-emerald-400">5.0</div>
                        </div>
                        <div className="text-center p-2 rounded bg-white/5">
                          <div className="text-[8px] text-white/40 uppercase mb-1">K<sub>i</sub></div>
                          <div className="text-[11px] font-mono font-black text-cyan-400">0.1</div>
                        </div>
                        <div className="text-center p-2 rounded bg-white/5">
                          <div className="text-[8px] text-white/40 uppercase mb-1">K<sub>d</sub></div>
                          <div className="text-[11px] font-mono font-black text-purple-400">2.0</div>
                        </div>
                      </div>
                    </div>

                    {/* PID Formula */}
                    <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-2">
                      <div className="text-[9px] text-white/40 font-black uppercase mb-2">Công thức PID</div>
                      <div className="text-[11px] text-white/80 font-mono">
                        <span className="text-emerald-400">u(t)</span>
                        <span className="text-white/40"> = K</span>
                        <sub className="text-emerald-400">p</sub>
                        <span className="text-white/40">e + K</span>
                        <sub className="text-cyan-400">i</sub>
                        <span className="text-white/40">∫e dt + K</span>
                        <sub className="text-purple-400">d</sub>
                        <span className="text-white/40">de/dt</span>
                      </div>
                    </div>

                    {/* Current State */}
                    <div className="p-4 rounded-md bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
                      <div className="text-[9px] text-emerald-400/60 uppercase text-center mb-2 font-black">Giá trị Hiện tại</div>
                      <div className="text-[14px] text-white font-mono text-center font-black">
                        <span className="text-cyan-400">θ<sub>target</sub></span>
                        <span className="text-white/40"> = </span>
                        <span className="text-white">0°</span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono text-center mt-1">
                        Roll hiện tại: <span className="text-cyan-400">{state.roll.toFixed(1)}°</span>
                      </div>
                      <div className="text-[10px] text-white/50 font-mono text-center">
                        Pitch hiện tại: <span className="text-purple-400">{state.pitch.toFixed(1)}°</span>
                      </div>
                      <div className="text-[11px] text-white font-mono text-center mt-2 pt-2 border-t border-emerald-500/20">
                        <span className={state.isStabilized ? "text-emerald-400" : "text-red-400"}>
                          {state.isStabilized ? "✓ Đang ổn định" : "✗ Đang trôi"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
        
        {/* Footer info */}
        <div className="p-4 bg-white/5 flex items-center gap-3">
          <Info className="w-3.5 h-3.5 text-white/20" />
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-none">Vật lý mô phỏng dựa trên công thức Newton thực tế</p>
        </div>
      </aside>

      <KnowledgeRecapModal 
        isOpen={showRecap}
        onClose={() => setShowRecap(false)}
        onNext={handleNextLesson}
        lessonId={activeId}
        lessonTitle={activeExp?.title || ""}
        isLastLesson={isLastLesson}
        isCompleted={isModuleComplete}
      />
    </div>
  );
}
