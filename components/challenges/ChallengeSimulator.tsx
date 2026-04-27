"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Trophy, RotateCcw, Eye, Video,
  Map, Crosshair, ChevronLeft
} from "lucide-react";

import { FlightState } from "@/components/challenges/physics";
import { processKeyboardInput, runFlightController, updatePhysics, computeTargetVV, INITIAL_STATE } from "@/components/challenges/physics";
import { FlightDroneViewer } from "@/components/challenges/FlightDroneViewer";
import { LevelRegistry, mockLabs, LabData, LevelEnvironments } from "@/components/challenges/levels/registry";
import { LevelFactory, LevelResult } from "@/components/challenges/levels/types";
import { useDroneSound } from "@/components/mechanics/flight-mechanics/useDroneSound";
import { useGetWebSimulator, useSubmitUserSimulatorLesson } from "@/hooks/simulator/useSimulator";

type CameraMode = "FOLLOW" | "ORBIT" | "TOP" | "FPV";
type GamePhase = "briefing" | "countdown" | "playing" | "complete";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const INITIAL_CONTROLS = {
  throttle: 0,
  pitch: 0,
  roll: 0,
  yaw: 0,
} as const;

const CONTROL_CONFIG = {
  throttleSpeed: 60,           // Tốc độ tăng/giảm ga (chậm hơn -> dễ hover)
  throttlePrecisionSpeed: 30,
  throttleDecay: 0.96,         // Tốc độ tự về hover khi thả phím (cao = chậm hơn)
  pitchSpeed: 90,              // Tiến/Lùi - giảm để không overshooting
  pitchDecay: 0.80,            // Tự về 0 nhanh hơn khi thả W/S
  pitchDeadZone: 0.5,
  rollSpeed: 90,               // Trái/Phải - giảm để dễ điều chỉnh
  rollDecay: 0.80,             // Tự về 0 nhanh hơn khi thả A/D  
  rollDeadZone: 0.5,
  yawSpeed: 120,               // Xoay - giữ nguyên
  yawDecay: 0.84,
  yawDeadZone: 0.5,
  precisionMultiplier: 0.4,
  precisionMaxVal: 40,
} as const;

// ─── COUNTDOWN OVERLAY (tren man hinh game) ───────────────────────────────────

function CountdownOverlay({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={count}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center"
        >
          <span className="text-[120px] font-black text-white drop-shadow-[0_0_30px_rgba(0,229,255,0.6)] leading-none">
            {count}
          </span>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-400 mt-2">Sẵn sàng</p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ─── BRIEFING SCREEN ───────────────────────────────────────────────────────────

function BriefingScreen({ lab, onStart, onResume, timeRemaining, isPaused }: {
  lab: LabData;
  onStart: () => void;
  onResume?: () => void;
  timeRemaining?: number;
  isPaused?: boolean;
}) {
  const displaySeconds = timeRemaining ?? lab.timeLimit;
  const minutes = Math.floor(displaySeconds / 60);
  const seconds = Math.floor(displaySeconds % 60);
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
          <div className="px-6 py-5 bg-slate-800/50 border-b border-slate-700">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/80">Thử thách</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{lab.title}</h2>
          </div>

          <div className="px-6 py-5 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-cyan-400 rounded-full" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nhiệm vụ (Objective)</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed pl-3">{lab.objective}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-amber-400 rounded-full" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Luật chơi (Rules)</h3>
              </div>
              <div className="space-y-2 pl-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5 rounded">
                    <svg className="w-2.5 h-2.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L12 22M7 7L12 2L17 7M7 17L12 22L17 17" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-300 leading-relaxed">Cất cánh và điều khiển drone bằng bàn phím</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 rounded">
                    <svg className="w-2.5 h-2.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-300 leading-relaxed">Hoàn thành nhiệm vụ trong thời gian cho phép</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5 rounded">
                    <svg className="w-2.5 h-2.5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-300 leading-relaxed">Chạm đất hoặc hết giờ = Thất bại</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 border border-slate-700 rounded">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-purple-400 rounded-full" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Điều khiển (Controls)</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {[
                  { label: "Ga (lên/xuống)", keys: ["↑", "↓"] },
                  { label: "Tiến/Lùi", keys: ["W", "S"] },
                  { label: "Sang trái/phải", keys: ["A", "D"] },
                  { label: "Xoay drone", keys: ["←", "→"] },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{item.label}</span>
                    <div className="flex gap-0.5">
                      {item.keys.map((k) => (
                        <kbd key={k} className="w-5 h-5 bg-slate-800 border border-slate-600 rounded text-[8px] text-cyan-400 font-bold flex items-center justify-center">{k}</kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center rounded">
                <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-mono font-bold text-amber-400">{timeStr}</span>
                <span className="text-[9px] text-slate-500 ml-1.5">{isPaused ? "còn lại" : "giới hạn"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isPaused && onResume && (
                <button
                  onClick={onResume}
                  className="group relative px-5 py-2.5 font-bold text-sm uppercase tracking-wider text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all rounded"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Tiếp tục bay
                  </span>
                </button>
              )}
              {!isPaused && (
                <button
                  onClick={onStart}
                  className="group relative px-6 py-2.5 font-bold text-sm uppercase tracking-wider text-white overflow-hidden transition-all hover:scale-105 rounded"
                >
                  <div className="absolute inset-0 bg-cyan-500 rounded" />
                  <div className="absolute inset-0 bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity rounded" />
                  <span className="relative flex items-center gap-2">
                    Bắt đầu
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── SHARED COMPONENTS (same as FlightMechanicsTab) ───────────────────────────

const powerToRPM = (p: number) => Math.sqrt(Math.max(0, p) / 50) * 6200;
const powerToNewtons = (p: number) => (Math.max(0, p) / 50) * (1.38 * 9.81);

function ControlSlider({ label, keys, value, isCentered = true }: {
  label: string;
  keys: string;
  value: number;
  isCentered?: boolean
}) {
  const isThrottle = label.toLowerCase().includes("ga");
  const isPitch = label.toLowerCase().includes("chúc");
  const isRoll = label.toLowerCase().includes("nghiêng");
  const isYaw = label.toLowerCase().includes("xoay");

  // Vietnamese labels with English technical terms
  let displayLabel = label;
  if (isThrottle) displayLabel = "Ga (Throttle)";
  if (isPitch) displayLabel = "Chúc/Ngóc (Pitch)";
  if (isRoll) displayLabel = "Nghiêng (Roll)";
  if (isYaw) displayLabel = "Xoay (Yaw)";

  return (
    <div className="mb-2 bg-slate-800/30 p-2.5 rounded-lg border border-slate-700">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-slate-200 tracking-tight uppercase leading-none">{displayLabel}</span>
          <kbd className="text-[8px] bg-slate-900 border border-slate-600 px-1 py-0.5 rounded text-slate-400 font-mono tracking-wider">{keys}</kbd>
        </div>
        <div className="flex flex-col items-end">
          {isThrottle ? (
            <span className="text-[11px] font-mono font-black text-cyan-400 leading-none">{powerToNewtons(value).toFixed(2)} N</span>
          ) : isPitch || isRoll ? (
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-mono font-black text-cyan-400 leading-none">{value > 0 ? "+" : ""}{(value * 0.45).toFixed(0)}°</span>
              <span className="text-[7px] font-mono text-white/20">{value.toFixed(0)}%</span>
            </div>
          ) : isYaw ? (
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-mono font-black text-cyan-400 leading-none">{value > 0 ? "+" : ""}{(value * 0.75).toFixed(0)}°</span>
              <span className="text-[7px] font-mono text-white/20">{value.toFixed(0)}%</span>
            </div>
          ) : (
            <span className="text-[11px] font-mono font-black text-cyan-400 leading-none">{value > 0 && isCentered ? "+" : ""}{value.toFixed(0)}%</span>
          )}
        </div>
      </div>
      <div className="h-1 bg-slate-950 rounded-full border border-slate-800 relative overflow-hidden">
        {isCentered ? (
          <>
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-500 z-10" />
            <div
              className="absolute h-full bg-cyan-500 transition-all duration-75 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
              style={{
                width: `${Math.abs(value) / 2}%`,
                left: value >= 0 ? "50%" : "auto",
                right: value < 0 ? "50%" : "auto"
              }}
            />
          </>
        ) : (
          <div
            className="absolute h-full bg-cyan-500 transition-all duration-75 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
            style={{ width: `${value}%`, left: 0 }}
          />
        )}
      </div>
    </div>
  );
}

function MotorNode({ id, val, isCW, label }: { id: string, val: number, isCW: boolean, label: string }) {
  const intensity = val / 100;
  const rpm = powerToRPM(val);
  const newtons = powerToNewtons(val);
  const color = isCW ? "rgb(0, 229, 255)" : "rgb(251, 191, 36)";

  const isHigh = val > 55;

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (intensity) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className={cn("text-[8px] text-center mb-0.5 font-bold tracking-wider transition-colors", isHigh ? "text-white" : "text-slate-500")}>{label}</div>
      <div
        className="relative w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center transition-all duration-150"
        style={{
          transform: `scale(${isHigh ? 1.05 : 1})`,
          boxShadow: isHigh ? `0 0 12px ${color.replace('rgb', 'rgba').replace(')', ', 0.3)')}` : 'none'
        }}
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 64 64" style={{ color }}>
          <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="3" fill="none" className="opacity-10" />
          <circle
            cx="32" cy="32" r={radius}
            stroke="currentColor"
            strokeWidth="3.5"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-75"
            style={{ filter: isHigh ? `drop-shadow(0 0 4px currentColor)` : 'none' }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center opacity-30" style={{ transform: isCW ? 'scaleX(1)' : 'scaleX(-1)' }}>
          <svg
            className="w-10 h-10"
            viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-[7px] font-black text-slate-500 leading-none mb-0.5">{id}</span>
          <span className={cn("text-[11px] leading-tight font-mono font-bold", isHigh ? "text-white" : "text-white/80")}>
            {Math.round(rpm)}
          </span>
          <span className="text-[7px] font-bold text-white/30 uppercase tracking-tighter">RPM</span>
        </div>
      </div>
      <div className="flex flex-col items-center mt-1">
        <div className="text-[8px] font-bold tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-700" style={{ color }}>
          {isCW ? "↻ CW" : "↺ CCW"}
        </div>
        <div className="text-[7px] font-mono text-white/40 mt-0.5">{newtons.toFixed(2)} N</div>
      </div>
    </div>
  );
}

function MathRow({ label, formula, result }: { label: string, formula: string, result: number }) {
  const resultInN = (result / 100) * (1.38 * 9.81);
  let vLabel = label;
  if (label.includes("PITCH")) vLabel = "Chúc mũi (Pitch)";
  if (label.includes("ROLL")) vLabel = "Nghiêng (Roll)";
  if (label.includes("YAW")) vLabel = "Xoay (Yaw)";

  return (
    <div className="flex items-center rounded-lg justify-between p-2 bg-slate-800/40 border border-slate-700 mb-1.5">
      <span className="text-[8px] font-black text-slate-400 uppercase w-20 tracking-tighter leading-tight">{vLabel}</span>
      <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 border rounded border-slate-800">{formula}</span>
      <div className="flex flex-col items-end w-14">
        <span className="text-[11px] font-mono font-black text-white leading-none">{resultInN > 0 ? "+" : ""}{resultInN.toFixed(2)} N</span>
        <span className="text-[7px] font-mono text-white/10">{result > 0 ? "+" : ""}{result.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// ─── COMPACT CAMERA MODE BUTTONS ──────────────────────────────────────────────

const CAMERA_MODES: { id: CameraMode; icon: React.ComponentType<{ className?: string }>; hint: string }[] = [
  { id: "FOLLOW", icon: Video, hint: "Theo dõi" },
  { id: "ORBIT", icon: Crosshair, hint: "Quanh đây" },
  { id: "TOP", icon: Map, hint: "Bên trên" },
  { id: "FPV", icon: Eye, hint: "Góc nhìn 1" },
];

function CameraModeSelector({ mode, onChange }: { mode: CameraMode; onChange: (m: CameraMode) => void }) {
  return (
    <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-slate-700">
      {CAMERA_MODES.map(({ id, icon: Icon, hint }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          title={hint}
          className={cn(
            "w-8 h-8 rounded flex items-center justify-center transition-all",
            mode === id
              ? "bg-cyan-500 text-white"
              : "text-white/40 hover:text-white/70 hover:bg-white/10"
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}

// ─── FLYING HUD (compact hub-style — centered top) ───────────────────────────

function FlyingHUD({ altitude, stability, vVelocity, hVelocity, roll, pitch, timeRemaining }: {
  altitude: number; stability: number; vVelocity: number; hVelocity: number; roll: number; pitch: number; timeRemaining: number;
}) {
  const isLowTime = timeRemaining <= 30;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-0 bg-slate-950/40 px-1 py-0.5 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_15px_rgba(0,229,255,0.1)] backdrop-blur-xl transition-all hover:bg-slate-950/60 group">
      {/* Time - Sleek indicator */}
      <div className="flex flex-col items-center px-4 py-1 border-r border-white/5">
        <span className="text-[6px] font-bold text-white/30 uppercase tracking-[0.2em] mb-0.5">Thời gian</span>
        <span className={cn("text-base font-mono font-black leading-none tracking-tighter", isLowTime ? "text-red-500 animate-pulse" : "text-amber-400")}>
          {formatTime(timeRemaining)}
        </span>
      </div>

      <div className="flex items-center gap-5 px-5 py-1">
        <div className="flex flex-col items-center">
          <span className="text-[6px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Độ cao (Alt)</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-mono font-black text-white leading-none">{altitude.toFixed(1)}</span>
            <span className="text-[8px] text-white/40 font-bold">m</span>
          </div>
        </div>

        <div className="w-px h-4 bg-white/5" />

        <div className="flex flex-col items-center">
          <span className="text-[6px] font-bold text-white/30 uppercase tracking-widest mb-0.5">V.Spd (Dọc)</span>
          <div className="flex items-baseline gap-0.5">
            <span className={cn("text-sm font-mono font-black leading-none", vVelocity > 0.1 ? "text-emerald-400" : vVelocity < -0.1 ? "text-red-400" : "text-white")}>
              {vVelocity.toFixed(1)}
            </span>
            <span className="text-[8px] text-white/40 font-bold">m/s</span>
          </div>
        </div>

        <div className="w-px h-4 bg-white/5" />

        <div className="flex flex-col items-center">
          <span className="text-[6px] font-bold text-white/30 uppercase tracking-widest mb-0.5">H.Spd (Ngang)</span>
          <div className="flex items-baseline gap-0.5">
            <span className={cn("text-sm font-mono font-black leading-none text-white")}>
              {hVelocity.toFixed(1)}
            </span>
            <span className="text-[8px] text-white/40 font-bold">m/s</span>
          </div>
        </div>

        {/* <div className="w-px h-4 bg-white/5" /> */}

        {/* <div className="flex flex-col items-center">
          <span className="text-[6px] font-bold text-white/30 uppercase tracking-widest mb-0.5">Nghiêng (Tilt)</span>
          <span className="text-sm font-mono font-black text-amber-500/90 leading-none">{Math.abs(roll).toFixed(0)}° / {Math.abs(pitch).toFixed(0)}°</span>
        </div> */}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

interface ChallengeSimulatorProps {
  labId: string;
  returnUrl?: string | null;
  isAdmin?: boolean;
}

export default function ChallengeSimulator({ labId, returnUrl, isAdmin }: ChallengeSimulatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lessonId");
  const enrollmentId = searchParams.get("enrollmentId");

  const { mutate: submitSimulator, isPending: isSubmitting } = useSubmitUserSimulatorLesson({
    onSuccess: () => {
      if (returnUrl) {
        // Cache đã được refetch và đợi hoàn tất ở trong useSimulator
        // Nên ở đây dùng router.push() mượt mà như SPA bình thường.
        router.push(returnUrl);
      }
    },
    onError: (err) => {
      console.error("Lỗi khi nộp bài:", err);
      alert("Nộp bài thất bại, vui lòng thử lại!");
    }
  });

  const { data: webSimulator, isLoading, isError } = useGetWebSimulator(labId);

  const lab: LabData | undefined = useMemo(() => {
    if (!webSimulator) return undefined;

    return {
      id: webSimulator.webSimulatorID,
      title: webSimulator.titleVN,
      levelCode: webSimulator.code,
      droneType: "quadcopter_basic",
      timeLimit: (webSimulator.estimatedTime || 2) * 60,
      objective: webSimulator.objectivesVN || "",
    };
  }, [webSimulator]);

  const [flightState, setFlightState] = useState<FlightState>(INITIAL_STATE);
  const flightStateRef = useRef<FlightState>(INITIAL_STATE);

  const [controls, setControls] = useState({ throttle: 0, pitch: 0, roll: 0, yaw: 0 });
  const controlsRef = useRef({ throttle: 0, pitch: 0, roll: 0, yaw: 0 });

  const [gamePhase, setGamePhase] = useState<GamePhase>("briefing");
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>("FOLLOW");
  const cameraModeRef = useRef<CameraMode>("FOLLOW");
  const precisionModeRef = useRef(false);
  const [precisionMode, setPrecisionMode] = useState(false);
  const [levelResult, setLevelResult] = useState<LevelResult | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const elapsedTimeRef = useRef(0);
  const [objective, setObjective] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(lab?.timeLimit ?? 60);
  const [resetTrigger, setResetTrigger] = useState(0);

  const keysPressed = useRef<Set<string>>(new Set());
  const physicsRef = useRef<FlightState>(INITIAL_STATE);

  const levelFactory: LevelFactory | undefined = lab ? LevelRegistry[lab.levelCode] : undefined;

  const droneSound = useDroneSound();

  // Init audio on first user interaction (required by browsers)
  useEffect(() => {
    const initAudio = () => {
      droneSound.init();
      window.removeEventListener("click", initAudio);
      window.removeEventListener("keydown", initAudio);
    };
    window.addEventListener("click", initAudio);
    window.addEventListener("keydown", initAudio);
    return () => {
      window.removeEventListener("click", initAudio);
      window.removeEventListener("keydown", initAudio);
    };
  }, []);


  const handleLevelUpdate = useCallback((result: LevelResult) => {
    if (result.status !== "PLAYING") {
      setLevelResult(result);
      setGamePhase("complete");
      setIsRunning(false);
      isRunningRef.current = false;
      droneSound.stop();
    } else if (result.objective) {
      setObjective(result.objective);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gamePhase === "complete") return;
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
        e.preventDefault();
      }
      keysPressed.current.add(key);
      if (key === "shift") {
        setPrecisionMode(true);
        precisionModeRef.current = true;
      }
      // SPACE: chỉ start khi đang ở briefing, chuyển sang playing
      if (key === " " && gamePhase === "briefing") {
        handleStartGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
      if (key === "shift") {
        setPrecisionMode(false);
        precisionModeRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gamePhase]);

  // ─── TIMER: chỉ chạy khi đang playing ───
  useEffect(() => {
    let rafId: number;
    let lastTs = 0;

    const tick = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      if (isRunningRef.current) {
        elapsedTimeRef.current += dt;
        setElapsedTime(elapsedTimeRef.current);
        setTimeRemaining((t) => Math.max(0, t - dt));
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ─── PHYSICS LOOP: chỉ chạy khi đang playing ───
  useEffect(() => {
    let rafId: number;
    let lastTs = 0;

    const updateLoop = (timestamp: number) => {
      if (!lastTs) lastTs = timestamp;
      const deltaTime = Math.min((timestamp - lastTs) / 1000, 0.05);
      lastTs = timestamp;

      // Chỉ chạy physics khi đang playing
      if (isRunningRef.current) {
        const newControls = processKeyboardInput(
          keysPressed.current,
          controlsRef.current,
          precisionModeRef.current,
          CONTROL_CONFIG,
          deltaTime
        );
        controlsRef.current = newControls;

        const motorValues = runFlightController(
          newControls,
          physicsRef.current,
          deltaTime
        );

        droneSound.updateThrottle(motorValues);

        const newState = updatePhysics(
          physicsRef.current,
          motorValues,
          deltaTime,
          computeTargetVV(newControls.throttle, physicsRef.current.altitude) // game-assist
        );
        physicsRef.current = newState;
        flightStateRef.current = newState;

        setControls(newControls);
        setFlightState(newState);
      }

      rafId = requestAnimationFrame(updateLoop);
    };

    rafId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleStartGame = () => {
    setIsPaused(false);
    setGamePhase("countdown");
    setIsRunning(false);
    isRunningRef.current = false;
    setElapsedTime(0);
    elapsedTimeRef.current = 0;
    setTimeRemaining(lab?.timeLimit ?? 60);
    setLevelResult(null);
    droneSound.stop();

    // Also reset physics when starting fresh
    physicsRef.current = INITIAL_STATE;
    flightStateRef.current = INITIAL_STATE;
    setFlightState(INITIAL_STATE);
    setControls(INITIAL_CONTROLS);
    controlsRef.current = INITIAL_CONTROLS;
    keysPressed.current.clear();
    setResetTrigger(prev => prev + 1);
  };

  const handlePauseForBriefing = () => {
    setIsPaused(true);
    setIsRunning(false);
    isRunningRef.current = false;
    droneSound.stop();
    setGamePhase("briefing");
  };

  const handleResume = () => {
    setIsPaused(false);
    setGamePhase("playing");
    // Small countdown-less resume — just set running after a brief moment
    setTimeout(() => {
      setIsRunning(true);
      isRunningRef.current = true;
    }, 300);
  };

  const handleReplayGame = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setElapsedTime(0);
    elapsedTimeRef.current = 0;
    setTimeRemaining(lab?.timeLimit ?? 60);
    setLevelResult(null);
    setObjective("");

    // Reset physics
    physicsRef.current = INITIAL_STATE;
    flightStateRef.current = INITIAL_STATE;
    setFlightState(INITIAL_STATE);

    // Reset controls
    setControls(INITIAL_CONTROLS);
    controlsRef.current = INITIAL_CONTROLS;

    // Clear keys
    keysPressed.current.clear();

    // Reset level
    setResetTrigger(prev => prev + 1);

    droneSound.stop();

    // Chuyển thẳng sang countdown để đếm ngược chơi lại
    setGamePhase("countdown");
  };

  const handleReset = () => {
    physicsRef.current = INITIAL_STATE;
    flightStateRef.current = INITIAL_STATE;
    setFlightState(INITIAL_STATE);
    setControls(INITIAL_CONTROLS);
    controlsRef.current = INITIAL_CONTROLS;
    setIsRunning(false);
    isRunningRef.current = false;
    setElapsedTime(0);
    elapsedTimeRef.current = 0;
    setTimeRemaining(lab?.timeLimit ?? 60);
    setLevelResult(null);
    setObjective("");
    keysPressed.current.clear();
    droneSound.stop();
    setResetTrigger(prev => prev + 1);
    // Quay ve man hinh briefing
    setGamePhase("briefing");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (isError || !lab) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <h2 className="text-xl font-bold text-red-400 mb-2">Không tìm thấy thử thách</h2>
        <p className="text-slate-400">ID: {labId}</p>
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

  const pitchDiff = (flightState.motors.m3 + flightState.motors.m4) - (flightState.motors.m1 + flightState.motors.m2);
  const rollDiff = (flightState.motors.m1 + flightState.motors.m3) - (flightState.motors.m2 + flightState.motors.m4);
  const yawDiff = (flightState.motors.m2 + flightState.motors.m3) - (flightState.motors.m1 + flightState.motors.m4);

  const handleSubmit = () => {
    if (!lessonId || !enrollmentId) {
      alert("Không tìm thấy thông tin bài học (lessonId hoặc enrollmentId) để nộp.");
      return;
    }

    // Gửi thời gian bay, và gửi thêm score NẾU bài tập đó có trả về score
    const payload: any = {
      flightTime: Math.floor(elapsedTimeRef.current),
      isSuccess: true,
    };

    console.log("Submitting simulator result:", { enrollmentId, lessonId, payload });

    if (levelResult?.score !== undefined) {
      payload.score = levelResult.score;
    }

    submitSimulator({ enrollmentId, lessonId, payload });
  };

  return (
    <div className="h-full flex flex-col">

      {/* ─── HEADER BAR ─── */}
      <div className="shrink-0 bg-slate-950 border-b border-slate-700">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            {/* Nút Quay lại - Giờ đã được gộp vào đây */}
            {returnUrl && (
              <button
                onClick={() => router.push(returnUrl)}
                className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">
                  {isAdmin ? "Quay lại quản trị" : "Quay lại bài học"}
                </span>
              </button>
            )}

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
              <div className="w-2 h-2 bg-cyan-400 rounded-full" />
              <span className="text-xs font-black text-white tracking-wide uppercase">{lab.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {precisionMode && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30">
                <span className="text-[7px] font-black uppercase text-amber-400 tracking-widest">Precision</span>
              </div>
            )}

            {/* NÚT NỘP BÀI KHI HOÀN THÀNH */}
            {gamePhase === "complete" && levelResult?.status === "WIN" && !isAdmin && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white transition-all shadow-md",
                  isSubmitting ? "bg-slate-600 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-400 hover:scale-105"
                )}
              >
                {isSubmitting ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trophy className="w-3.5 h-3.5" />
                )}
                {isSubmitting ? "Đang nộp..." : "Nộp bài"}
              </button>
            )}

            {gamePhase === "playing" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePauseForBriefing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-cyan-400 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all"
                >
                  <Eye className="w-3 h-3" />
                  Xem đề bài
                </button>
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all",
                  isRunning
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-slate-800 border-slate-700"
                )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full transition-all", isRunning ? "bg-emerald-400 animate-pulse" : "bg-slate-500")} />
                  <span className={cn("text-[9px] font-black uppercase tracking-wider", isRunning ? "text-emerald-400" : "text-slate-400")}>
                    {isRunning ? "Đang bay" : "Dừng"}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 border border-slate-700 hover:text-white hover:bg-slate-700 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ─── BRIEFING OVERLAY ─── */}
      <AnimatePresence>
        {gamePhase === "briefing" && (
          <BriefingScreen
            lab={lab}
            onStart={handleStartGame}
            onResume={isPaused ? handleResume : undefined}
            timeRemaining={timeRemaining}
            isPaused={isPaused}
          />
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT: 3-COLUMN GRID ─── */}
      <div className="flex-1 flex min-h-0">

        {/* ─── LEFT: BẢNG ĐIỀU KHIỂN ─── */}
        <div className="w-[200px] shrink-0 flex flex-col bg-slate-950 border-r border-slate-800 p-3 gap-2">

          <div className="flex items-center justify-center gap-2 py-2 bg-slate-900/40 rounded-lg border border-slate-800">
            <div className={cn(
              "w-2 h-2 rounded-full transition-all",
              gamePhase === "playing" && isRunning && flightState.altitude > 0.2
                ? "bg-emerald-400 animate-pulse"
                : gamePhase === "playing"
                  ? "bg-cyan-400"
                  : "bg-slate-600"
            )} />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              {gamePhase === "complete" ? "Xong" :
                gamePhase === "playing" && flightState.altitude > 0.2 ? "Đang bay" : "Sẵn sàng"}
            </span>
          </div>

          <div className="flex-1 space-y-0.5 pt-1">
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-0.5">Điều khiển (Control Panel)</div>
            <ControlSlider label="Ga" keys="↑↓" value={controls.throttle} isCentered={false} />
            <ControlSlider label="Tiến/Lùi" keys="W/S" value={controls.pitch} />
            <ControlSlider label="Trái/Phải" keys="A/D" value={controls.roll} />
            <ControlSlider label="Xoay" keys="←→" value={controls.yaw} />
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="grid grid-cols-[1fr_auto] gap-y-0.5 text-[8px] text-slate-500 font-bold uppercase">
              <span>Di chuyển (Move)</span>
              <div className="flex gap-0.5">
                <kbd className="bg-slate-900 px-0.5 rounded border border-slate-700 text-[6px]">W</kbd>
                <kbd className="bg-slate-900 px-0.5 rounded border border-slate-700 text-[6px]">S</kbd>
                <kbd className="bg-slate-900 px-0.5 rounded border border-slate-700 text-[6px]">A</kbd>
                <kbd className="bg-slate-900 px-0.5 rounded border border-slate-700 text-[6px]">D</kbd>
              </div>
              <span>Precision</span>
              <kbd className="bg-slate-900 px-1 rounded border border-slate-700 text-[7px]">SHIFT</kbd>
            </div>
          </div>
        </div>

        {/* ─── CENTER: 3D VIEWER ─── */}
        <div className="flex-1 relative">
          <FlightDroneViewer
            physicsRef={physicsRef}
            cameraMode={cameraMode}
            levelFactory={levelFactory}
            onLevelUpdate={handleLevelUpdate}
            environmentType={lab ? (LevelEnvironments[lab.levelCode] || "DAY") : "DAY"}
            resetTrigger={resetTrigger}
          />

          <AnimatePresence>
            {gamePhase === "countdown" && (
              <CountdownOverlay
                onComplete={() => {
                  setGamePhase("playing");
                  setIsRunning(true);
                  isRunningRef.current = true;
                  droneSound.init();
                }}
              />
            )}
          </AnimatePresence>

          <FlyingHUD
            altitude={flightState.altitude}
            stability={flightState.stability}
            vVelocity={flightState.verticalVelocity}
            hVelocity={Math.sqrt(flightState.velocityX ** 2 + flightState.velocityZ ** 2)}
            roll={flightState.roll}
            pitch={flightState.pitch}
            timeRemaining={timeRemaining}
          />

          <div className="absolute top-4 right-4">
            <CameraModeSelector mode={cameraMode} onChange={(m) => {
              setCameraMode(m);
              cameraModeRef.current = m;
            }} />
          </div>
        </div>

        {/* ─── RIGHT: VẬT LÝ ─── */}
        <div className="w-[200px] shrink-0 flex flex-col bg-slate-950 border-l border-slate-800 p-3 gap-2">

          <div>
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Động cơ (Motors)</div>
            <div className="relative w-full max-w-[160px] mx-auto bg-slate-900/80 rounded-lg border border-slate-700 p-2">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                <div className="w-[80%] h-px bg-slate-400 rotate-45" />
                <div className="w-[80%] h-px bg-slate-400 -rotate-45 absolute" />
              </div>
              <div className="grid grid-cols-2 w-full relative z-10 gap-x-1 gap-y-6 scale-[0.88] origin-center">
                <div className="flex items-start justify-start"><MotorNode id="M1" label="FL" isCW={false} val={flightState.motors.m1} /></div>
                <div className="flex items-start justify-end"><MotorNode id="M2" label="FR" isCW={true} val={flightState.motors.m2} /></div>
                <div className="flex items-end justify-start"><MotorNode id="M3" label="RL" isCW={true} val={flightState.motors.m3} /></div>
                <div className="flex items-end justify-end"><MotorNode id="M4" label="RR" isCW={false} val={flightState.motors.m4} /></div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-slate-900 rounded-full border border-slate-700 flex items-center justify-center z-20">
                <div className="w-1 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Trình trộn lực (Mixer)</div>
            <MathRow label="PITCH" formula="(M3+M4)-(M1+M2)" result={pitchDiff} />
            <MathRow label="ROLL" formula="(M1+M3)-(M2+M4)" result={rollDiff} />
            <MathRow label="YAW" formula="(M2+M3)-(M1+M4)" result={yawDiff} />
          </div>

          <div className="pt-1.5 border-t border-slate-800">
            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 mt-2">Tổng lực đẩy (Total Thrust)</div>
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
              <span className="text-[7px] font-bold text-slate-500 uppercase">Trung bình (Avg)</span>
              <span className="text-[11px] font-mono font-black text-cyan-400">{powerToNewtons(flightState.thrust).toFixed(2)} N</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── WIN / FAIL MODAL ─── */}
      <AnimatePresence>
        {gamePhase === "complete" && levelResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-slate-900 border border-slate-700 rounded-lg overflow-hidden max-w-sm mx-4 w-full"
            >
              <div className={cn(
                "h-1 w-full rounded-t-lg",
                levelResult.status === "WIN" ? "bg-amber-400" : "bg-red-500"
              )} />

              <div className="px-8 pt-8 pb-6 text-center ">
                <div className={cn(
                  "w-20 h-20  mx-auto flex items-center justify-center rounded-lg",
                  levelResult.status === "WIN"
                    ? "bg-amber-500"
                    : "bg-red-600"
                )}>
                  <Trophy className="w-10 h-10 text-white" />
                </div>

                <h2 className={cn(
                  "text-2xl font-bold tracking-tight my-2",
                  levelResult.status === "WIN" ? "text-amber-400" : "text-red-400"
                )}>
                  {getStatusMessage()}
                </h2>

                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  {levelResult.message || levelResult.objective}
                </p>

                <div className="flex justify-center gap-4 mb-8">
                  <div className="px-5 py-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Thời gian</span>
                    <span className="text-xl font-mono font-bold text-white">{elapsedTime.toFixed(1)}s</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleReplayGame}
                    className="flex-1 px-4 py-3 font-bold text-sm text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all rounded-lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Chơi lại
                    </span>
                  </button>

                  {levelResult.status === "FAIL" && (
                    <button
                      onClick={() => { setLevelResult(null); setGamePhase("briefing"); }}
                      className="flex-1 px-4 py-3 font-bold text-sm text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all rounded-lg"
                    >
                      Xem lại đề bài
                    </button>
                  )}

                  {levelResult.status === "WIN" && (
                    <button
                      onClick={() => {
                        if (isAdmin) {
                          if (returnUrl) router.push(returnUrl);
                        } else {
                          handleSubmit();
                        }
                      }}
                      disabled={isSubmitting}
                      className={cn(
                        "flex-1 px-4 py-3 font-bold text-sm text-white transition-all rounded-lg",
                        isSubmitting ? "bg-slate-600 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-400"
                      )}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {isSubmitting && (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {isSubmitting ? "Đang nộp..." : (isAdmin ? "Quay về" : "Nộp bài")}
                        {!isSubmitting && (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        )}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
