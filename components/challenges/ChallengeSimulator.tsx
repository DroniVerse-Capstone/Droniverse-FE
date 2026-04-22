"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Rocket, Cpu, Activity, Info, Power, Timer, Trophy, 
  RotateCcw, LayoutGrid, Video 
} from "lucide-react";

// Import physics types and functions
import { FlightState, MotorValues } from "@/components/challenges/physics";
import { processKeyboardInput, runFlightController, updatePhysics, INITIAL_STATE } from "@/components/challenges/physics";

// Import drone viewer
import { FlightDroneViewer } from "@/components/challenges/FlightDroneViewer";

// Import level components
import { LevelRegistry, mockLabs, LabData } from "@/components/challenges/levels/registry";
import { LevelFactory, LevelResult, LevelStatus } from "@/components/challenges/levels/types";

type CameraMode = "FOLLOW" | "ORBIT" | "TOP" | "FPV";

const INITIAL_CONTROLS = {
  throttle: 0,
  pitch: 0,
  roll: 0,
  yaw: 0,
} as const;

const CONTROL_CONFIG = {
  throttleSpeed: 50,
  throttlePrecisionSpeed: 20,
  throttleDecay: 0.90,
  pitchSpeed: 90,
  pitchDecay: 0.90,
  pitchDeadZone: 0.5,
  rollSpeed: 200,
  rollDecay: 0.90,
  rollDeadZone: 0.5,
  yawSpeed: 90,
  yawDecay: 0.90,
  yawDeadZone: 0.5,
  precisionMultiplier: 0.4,
  precisionMaxVal: 40,
} as const;

function ControlSlider({ label, keys, value, isCentered = true }: { 
  label: string; 
  keys: string; 
  value: number; 
  isCentered?: boolean 
}) {
  return (
    <div className="mb-2 bg-slate-800/30 p-2.5 rounded-md border border-slate-700/50 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-200 tracking-wide">{label}</span>
          <kbd className="text-[8px] bg-slate-900 border border-slate-700 px-1 py-0.5 rounded text-slate-400 font-mono tracking-wider">{keys}</kbd>
        </div>
        <span className="text-[11px] font-mono font-bold text-cyan-400">{value > 0 && isCentered ? "+" : ""}{value.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-slate-950 rounded-full border border-slate-800/80 relative overflow-hidden shadow-inner">
        {isCentered ? (
          <>
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-500 z-10" />
            <div
              className="absolute h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-75"
              style={{
                width: `${Math.abs(value) / 2}%`,
                left: value >= 0 ? "50%" : "auto",
                right: value < 0 ? "50%" : "auto"
              }}
            />
          </>
        ) : (
          <div
            className="absolute h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-75"
            style={{ width: `${value}%`, left: 0 }}
          />
        )}
      </div>
    </div>
  );
}

function MotorNode({ id, val, isCW, label }: { id: string; val: number; isCW: boolean; label: string }) {
  const intensity = val / 100;
  const color = isCW ? "rgb(6, 182, 212)" : "rgb(245, 158, 11)";
  const isHigh = val > 55;
  const isLow = val < 45;

  return (
    <div className="flex flex-col items-center gap-1">
      <div 
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center text-[8px] font-black transition-all duration-150",
          isHigh && "ring-2 ring-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
          isLow && "opacity-50"
        )}
        style={{ 
          backgroundColor: `rgba(${isCW ? '6, 182, 212' : '245, 158, 11'}, ${0.15 + intensity * 0.25})`,
          borderColor: color,
          borderWidth: '1px',
          boxShadow: `inset 0 0 ${10 + intensity * 20}px rgba(${isCW ? '6, 182, 212' : '245, 158, 11'}, ${0.1 + intensity * 0.3})`
        }}
      >
        <span style={{ color }}>{id}</span>
      </div>
      <span className="text-[9px] font-bold text-slate-500">{label}</span>
      <span className="text-[10px] font-mono font-bold" style={{ color }}>{val.toFixed(0)}%</span>
    </div>
  );
}

function StatusIndicator({ label, value, unit, color, icon: Icon }: { 
  label: string; 
  value: string | number; 
  unit?: string; 
  color?: string; 
  icon?: any 
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/30">
      {Icon && <Icon className="w-3.5 h-3.5" style={{ color }} />}
      <div className="flex flex-col">
        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-[11px] font-mono font-bold" style={{ color: color || 'white' }}>
          {value}{unit && <span className="text-[8px] text-slate-400 ml-0.5">{unit}</span>}
        </span>
      </div>
    </div>
  );
}

function CameraModeButton({ mode, current, onClick }: { 
  mode: CameraMode; 
  current: CameraMode; 
  onClick: () => void 
}) {
  const isActive = current === mode;
  const labels: Record<CameraMode, string> = { FOLLOW: "Theo dõi", ORBIT: "Quanh đây", TOP: "Bên trên", FPV: "Máy bay" };
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all",
        isActive 
          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
          : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
      )}
    >
      {labels[mode]}
    </button>
  );
}

interface ChallengeSimulatorProps {
  labId: string;
}

export default function ChallengeSimulator({ labId }: ChallengeSimulatorProps) {
  const lab: LabData | undefined = mockLabs[labId];
  
  // Flight state
  const [flightState, setFlightState] = useState<FlightState>(INITIAL_STATE);
  const flightStateRef = useRef<FlightState>(INITIAL_STATE);
  
  // Controls
  const [controls, setControls] = useState({ throttle: 0, pitch: 0, roll: 0, yaw: 0 });
  
  // Game state
  const [isRunning, setIsRunning] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>("FOLLOW");
  const [activeView, setActiveView] = useState<"3d" | "dashboard">("3d");
  const [precisionMode, setPrecisionMode] = useState(false);
  const [levelResult, setLevelResult] = useState<LevelResult | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [objective, setObjective] = useState("Đang chờ...");
  
  const keysPressed = useRef<Set<string>>(new Set());
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const physicsRef = useRef<FlightState>(INITIAL_STATE);
  
  // Get level factory from registry
  const levelFactory: LevelFactory | undefined = lab ? LevelRegistry[lab.levelCode] : undefined;

  // Handle level result
  const handleLevelUpdate = useCallback((result: LevelResult) => {
    if (result.status !== "PLAYING") {
      setLevelResult(result);
      setIsComplete(true);
      setIsRunning(false);
    } else if (result.objective) {
      setObjective(result.objective);
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete) return;
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
        e.preventDefault();
      }
      keysPressed.current.add(key);
      if (key === "shift") setPrecisionMode(true);
      if (key === " ") setIsRunning(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
      if (key === "shift") setPrecisionMode(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isComplete]);

  // Main update loop
  useEffect(() => {
    const updateLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Step 1: Process keyboard input to get control values
      const newControls = processKeyboardInput(
        keysPressed.current,
        controls,
        precisionMode,
        CONTROL_CONFIG
      );
      setControls(newControls);

      // Step 2: Run flight controller (convert controls to motor values)
      const motorValues = runFlightController(
        newControls,
        physicsRef.current,
        deltaTime
      );

      // Step 3: Update physics with motor values
      const newState = updatePhysics(physicsRef.current, motorValues, deltaTime);
      physicsRef.current = newState;
      flightStateRef.current = newState;
      setFlightState(newState);

      // Update timer
      if (isRunning) {
        setElapsedTime((t) => t + deltaTime);
      }

      animationRef.current = requestAnimationFrame(updateLoop);
    };

    animationRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [controls, precisionMode, isRunning]);

  // Reset function
  const handleReset = () => {
    physicsRef.current = INITIAL_STATE;
    setFlightState(INITIAL_STATE);
    setControls(INITIAL_CONTROLS);
    setIsRunning(false);
    setElapsedTime(0);
    setLevelResult(null);
    setIsComplete(false);
    setObjective("Đang chờ...");
    keysPressed.current.clear();
  };

  // If lab not found, show error
  if (!lab) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Không tìm thấy thử thách</h2>
          <p className="text-slate-400">ID: {labId}</p>
        </div>
      </div>
    );
  }

  const getStatusMessage = () => {
    if (!levelResult) return "";
    switch (levelResult.status) {
      case "WIN": return "Hoàn thành!";
      case "FAIL": return "Thất bại";
      default: return "";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* TOP BAR */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-slate-900/40 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              isRunning 
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
            )}
          >
            <div className={cn("w-1.5 h-1.5 rounded-full", isRunning ? "bg-amber-400 animate-pulse" : "bg-emerald-400")} />
            {isRunning ? "Đang bay" : "Bắt đầu"}
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white hover:bg-slate-800 transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          <div className="flex items-center gap-1 bg-slate-800/30 rounded-lg p-1">
            {(["FOLLOW", "ORBIT", "TOP", "FPV"] as CameraMode[]).map((mode) => (
              <CameraModeButton
                key={mode}
                mode={mode}
                current={cameraMode}
                onClick={() => setCameraMode(mode)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/30">
            <Timer className="w-4 h-4 text-amber-400" />
            <span className="text-lg font-mono font-bold text-white">
              {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toFixed(0).padStart(2, '0')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/30">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-lg font-mono font-bold text-cyan-400">
              {controls.throttle.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView("3d")}
            className={cn("p-2 rounded-lg transition-all", activeView === "3d" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-500 hover:text-slate-300")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveView("dashboard")}
            className={cn("p-2 rounded-lg transition-all", activeView === "dashboard" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-500 hover:text-slate-300")}
          >
            <Video className="w-4 h-4" />
          </button>
          
          <div className="w-px h-5 bg-white/10 mx-1" />
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={cn("p-2 rounded-lg transition-all", showInfo ? "bg-cyan-500/20 text-cyan-400" : "text-slate-500 hover:text-slate-300")}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OBJECTIVE BAR */}
      <div className="shrink-0 px-4 py-2 bg-slate-900/60 border-b border-white/5">
        <p className="text-xs text-cyan-400 font-medium">{objective}</p>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex min-h-0">
        <div className={cn("relative transition-all", activeView === "3d" ? "flex-1" : "w-64")}>
          <FlightDroneViewer 
            physicsRef={physicsRef}
            cameraMode={cameraMode}
            levelFactory={levelFactory}
            onLevelUpdate={handleLevelUpdate}
            environmentType={lab.environmentType || "INDUSTRIAL"}
          />
          
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/50"
              >
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Độ cao</span>
                    <p className="text-sm font-mono font-bold text-white">{flightState.altitude.toFixed(1)}m</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Tốc độ</span>
                    <p className="text-sm font-mono font-bold text-white">
                      {Math.sqrt(flightState.velocityX**2 + flightState.velocityZ**2 + flightState.verticalVelocity**2).toFixed(1)} m/s
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Góc nghiêng</span>
                    <p className="text-sm font-mono font-bold text-white">{(flightState.pitch).toFixed(0)}°</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Hướng</span>
                    <p className="text-sm font-mono font-bold text-white">{(flightState.yaw).toFixed(0)}°</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {activeView === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-80 border-l border-white/5 bg-slate-900/20 p-4 overflow-y-auto"
            >
              <div className="space-y-2 mb-4">
                <StatusIndicator label="Độ cao" value={flightState.altitude.toFixed(1)} unit="m" color="cyan-400" icon={Rocket} />
                <StatusIndicator label="Tốc độ" value={Math.sqrt(flightState.velocityX**2 + flightState.velocityZ**2 + flightState.verticalVelocity**2).toFixed(1)} unit="m/s" color="emerald-400" icon={Activity} />
                <StatusIndicator label="Điện" value={98} unit="%" color="amber-400" icon={Power} />
              </div>

              <div className="mb-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Động cơ</h3>
                <div className="grid grid-cols-2 gap-3">
                  <MotorNode id="FL" val={controls.throttle * 0.9} isCW={false} label="Trước-Trái" />
                  <MotorNode id="FR" val={controls.throttle * 0.95} isCW={true} label="Trước-Phải" />
                  <MotorNode id="BL" val={controls.throttle * 0.95} isCW={true} label="Sau-Trái" />
                  <MotorNode id="BR" val={controls.throttle * 0.9} isCW={false} label="Sau-Phải" />
                </div>
              </div>

              <div className="space-y-1">
                <ControlSlider label="Ga" keys="↑↓" value={controls.throttle} isCentered={false} />
                <ControlSlider label="Nghiêng" keys="W/S" value={controls.pitch} />
                <ControlSlider label="Cuộn" keys="A/D" value={controls.roll} />
                <ControlSlider label="Yaw" keys="←→" value={controls.yaw} />
              </div>

              {precisionMode && (
                <div className="mt-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Chế độ Precision đang bật
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* COMPLETE MODAL */}
      <AnimatePresence>
        {isComplete && levelResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/90 border border-white/10 rounded-2xl p-8 text-center max-w-sm mx-4"
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg",
                levelResult.status === "WIN" ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30" : "bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/30"
              )}>
                <Trophy className={cn("w-8 h-8", levelResult.status === "WIN" ? "text-white" : "text-white")} />
              </div>
              
              <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">
                {getStatusMessage()}
              </h2>
              
              <p className="text-sm text-slate-400 mb-4">
                {levelResult.message || levelResult.objective}
              </p>

              <div className="flex justify-center gap-3 mb-6">
                <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Thời gian</span>
                  <p className="text-lg font-mono font-bold text-white">{elapsedTime.toFixed(1)}s</p>
                </div>
                {levelResult.objective && (
                  <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Nhiệm vụ</span>
                    <p className="text-sm font-mono font-bold text-cyan-400">✓</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 font-bold text-sm hover:bg-slate-800 transition-colors"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => window.location.href = "/mechanics/quadcopter"}
                  className="flex-1 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-sm hover:bg-cyan-500/30 transition-colors"
                >
                  Quay về
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
