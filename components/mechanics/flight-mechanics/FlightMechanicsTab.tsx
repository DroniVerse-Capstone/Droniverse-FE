"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlightState,
  ControlValues,
  runFlightController,
  updatePhysics,
  INITIAL_STATE,
} from "./physics";
import { FlightDroneViewer } from "./FlightDroneViewer";
import { useDroneSound } from "./useDroneSound";
import { cn } from "@/lib/utils";
import { Rocket, Cpu, Activity, Info, Power } from "lucide-react";

// ─── CONSTANTS ───
const INITIAL_CONTROLS: ControlValues = {
  throttle: 0,
  pitch: 0,
  roll: 0,
  yaw: 0,
};

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function ControlSlider({ label, keys, value, isCentered = true }: { label: string, keys: string, value: number, isCentered?: boolean }) {
  return (
    <div className="mb-2 bg-slate-800/30 p-2.5 border border-slate-700">
      <div className="flex justify-between items-center mb-2">
         <div className="flex items-center gap-2">
           <span className="text-[11px] font-bold text-slate-200 tracking-wide">{label}</span>
           <kbd className="text-[8px] bg-slate-900 border border-slate-600 px-1 py-0.5 text-slate-400 font-mono tracking-wider">{keys}</kbd>
         </div>
         <span className="text-[11px] font-mono font-bold text-cyan-400">{value > 0 && isCentered ? "+" : ""}{value.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-slate-950 border border-slate-800 relative overflow-hidden">
        {isCentered ? (
          <>
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-500 z-10" />
            <div 
              className="absolute h-full bg-cyan-500 transition-all duration-75"
              style={{
                width: `${Math.abs(value) / 2}%`,
                left: value >= 0 ? "50%" : "auto",
                right: value < 0 ? "50%" : "auto"
              }}
            />
          </>
        ) : (
          <div 
            className="absolute h-full bg-cyan-500 transition-all duration-75" 
            style={{ width: `${value}%`, left: 0 }} 
          />
        )}
      </div>
    </div>
  );
}

function MotorNode({ id, val, isCW, label }: { id: string, val: number, isCW: boolean, label: string }) {
  const intensity = val / 100;
  const color = isCW ? "rgb(0, 229, 255)" : "rgb(251, 191, 36)"; 
  
  const isHigh = val > 55;
  
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (intensity) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className={cn("text-[8px] text-center mb-0.5 font-bold tracking-wider transition-colors", isHigh ? "text-white" : "text-slate-500")}>{label}</div>
      <div 
        className="relative w-14 h-14 bg-slate-900 flex items-center justify-center transition-all duration-150"
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
            strokeLinecap="butt"
            className="transition-all duration-75"
            style={{ filter: isHigh ? `drop-shadow(0 0 4px currentColor)` : 'none' }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center opacity-30" style={{ transform: isCW ? 'scaleX(1)' : 'scaleX(-1)' }}>
          <svg 
            className="w-10 h-10" 
            viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-[9px] font-black text-slate-300">{id}</span>
          <span className={cn("text-[14px] leading-tight font-mono font-bold", isHigh ? "text-white" : "text-white/80")}>
            {val.toFixed(0)}
          </span>
        </div>
      </div>
      <div className="text-[8px] font-bold mt-1 tracking-widest bg-slate-900 px-2 py-0.5 border border-slate-700" style={{ color }}>
        {isCW ? "↻ CW" : "↺ CCW"}
      </div>
    </div>
  );
}

function MathRow({ label, formula, result }: { label: string, formula: string, result: number }) {
  return (
    <div className="flex items-center justify-between p-2 bg-slate-800/40 border border-slate-700 mb-1.5">
       <span className="text-[8px] font-bold text-slate-400 uppercase w-16 tracking-wider">{label}</span>
       <span className="text-[9px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 border border-slate-800">{formula}</span>
       <span className="text-[11px] font-mono font-bold text-white w-8 text-right">{result > 0 ? "+" : ""}{result.toFixed(0)}</span>
    </div>
  );
}

// ─── MAIN COMPONENT (Trigger Refresh) ───────────────────────────────────────

export default function FlightMechanicsTab() {
  const [controls, setControls] = useState<ControlValues>(INITIAL_CONTROLS);
  const [physics, setPhysics] = useState<FlightState>(INITIAL_STATE);
  const physicsRef = useRef<FlightState>(INITIAL_STATE);
  const controlsRef = useRef<ControlValues>(INITIAL_CONTROLS);
  const keysRef = useRef<Set<string>>(new Set());

  // ─── AUDIO ───
  const droneSound = useDroneSound();

  // ─── ANALOG INPUT: Track how long each key has been held ───
  const holdTimeRef = useRef({
    throttleUp: 0, throttleDown: 0,
    pitchFwd: 0, pitchBack: 0,
    rollLeft: 0, rollRight: 0,
    yawLeft: 0, yawRight: 0,
  });

  // ─── ENGINE STATE ───
  const [engineState, setEngineState] = useState<"OFF" | "STARTING" | "ON">("OFF");
  const engineRef = useRef<"OFF" | "STARTING" | "ON">("OFF");

  const handleToggleEngine = useCallback(() => {
    if (engineState === "OFF") {
      // Start engine sequence
      setEngineState("STARTING");
      engineRef.current = "STARTING";
      droneSound.init();
      // Startup takes ~1.5s
      setTimeout(() => {
        setEngineState("ON");
        engineRef.current = "ON";
      }, 1500);
    } else if (engineState === "ON") {
      // Shut down immediately
      setEngineState("OFF");
      engineRef.current = "OFF";
      droneSound.stop();
      // Reset controls and physics when shutting down
      setControls(INITIAL_CONTROLS);
      setPhysics(INITIAL_STATE);
      physicsRef.current = INITIAL_STATE;
      controlsRef.current = INITIAL_CONTROLS;
      // Reset analog hold timers
      holdTimeRef.current = { throttleUp: 0, throttleDown: 0, pitchFwd: 0, pitchBack: 0, rollLeft: 0, rollRight: 0, yawLeft: 0, yawRight: 0 };
    }
  }, [engineState]);

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase());
    const handleUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);

    const interval = setInterval(() => {
      const dt = 1 / 60;
      const keys = keysRef.current;

      // If engine is OFF, keep everything zeroed
      if (engineRef.current === "OFF") {
        const zeroMotors = { m1: 0, m2: 0, m3: 0, m4: 0 };
        const state = { ...INITIAL_STATE, motors: zeroMotors };
        physicsRef.current = state;
        if (Date.now() % 48 < 16) {
          setPhysics(state);
          setControls(INITIAL_CONTROLS);
        }
        return;
      }

      // If engine is STARTING, run a gentle spool-up animation
      if (engineRef.current === "STARTING") {
        // Gradually increase idle motors during startup
        const prev = physicsRef.current;
        const startupRamp = Math.min(12, (prev.motors.m1 || 0) + 8 * dt);
        const startupMotors = { m1: startupRamp, m2: startupRamp, m3: startupRamp, m4: startupRamp };
        droneSound.updateThrottle(startupMotors);
        const state: FlightState = { ...INITIAL_STATE, motors: startupMotors };
        physicsRef.current = state;
        if (Date.now() % 48 < 16) {
          setPhysics(state);
        }
        return;
      }

      // ─── ENGINE ON: Linear keyboard input (like real joystick) ───
      const next = { ...controlsRef.current };
      const precision = keys.has("shift");

      // Linear ramp: constant speed per frame. 
      // Normal: ~1.1s to reach 100% | Shift: ~2.5s to reach 100% (capped at 40%)
      const baseSpeed = 90 * dt;  // ~1.5 units/frame at 60fps
      const speed = precision ? baseSpeed * 0.4 : baseSpeed;
      const maxVal = precision ? 40 : 100;

      // Smooth return-to-center on release
      const decayFactor = 0.90;

      // ── THROTTLE (Arrow Up/Down) ──
      const throttleSpeed = precision ? 20 * dt : 40 * dt;
      if (keys.has("arrowup")) next.throttle = Math.min(100, next.throttle + throttleSpeed);
      else if (keys.has("arrowdown")) next.throttle = Math.max(0, next.throttle - throttleSpeed);
      else {
        // Return to hover (50%)
        const diff = next.throttle - 50;
        if (Math.abs(diff) < 0.5) next.throttle = 50;
        else next.throttle = 50 + diff * decayFactor;
      }

      // ── PITCH (W/S) ──
      if (keys.has("w")) next.pitch = Math.max(-maxVal, next.pitch - speed);
      else if (keys.has("s")) next.pitch = Math.min(maxVal, next.pitch + speed);
      else {
        if (Math.abs(next.pitch) < 0.5) next.pitch = 0;
        else next.pitch *= decayFactor;
      }

      // ── ROLL (A/D) ──
      if (keys.has("d")) next.roll = Math.min(maxVal, next.roll + speed);
      else if (keys.has("a")) next.roll = Math.max(-maxVal, next.roll - speed);
      else {
        if (Math.abs(next.roll) < 0.5) next.roll = 0;
        else next.roll *= decayFactor;
      }

      // ── YAW (Arrow Left/Right) ──
      if (keys.has("arrowright")) next.yaw = Math.min(maxVal, next.yaw + speed);
      else if (keys.has("arrowleft")) next.yaw = Math.max(-maxVal, next.yaw - speed);
      else {
        if (Math.abs(next.yaw) < 0.5) next.yaw = 0;
        else next.yaw *= decayFactor;
      }

      if (keys.has("r")) {
        handleReset();
        return;
      }

      setControls(next);
      controlsRef.current = next;
      const motors = runFlightController(next, physicsRef.current, dt);
      droneSound.updateThrottle(motors);
      const newState = updatePhysics(physicsRef.current, motors, dt);
      physicsRef.current = newState;

      if (Date.now() % 48 < 16) {
        setPhysics(newState);
      }
    }, 16);

    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
      clearInterval(interval);
    };
  }, []);

  const handleReset = () => {
    setControls(INITIAL_CONTROLS);
    setPhysics(INITIAL_STATE);
    physicsRef.current = INITIAL_STATE;
    controlsRef.current = INITIAL_CONTROLS;
    holdTimeRef.current = { throttleUp: 0, throttleDown: 0, pitchFwd: 0, pitchBack: 0, rollLeft: 0, rollRight: 0, yawLeft: 0, yawRight: 0 };
  };

  const pitchDiff = (physics.motors.m3 + physics.motors.m4) - (physics.motors.m1 + physics.motors.m2);
  const rollDiff = (physics.motors.m1 + physics.motors.m3) - (physics.motors.m2 + physics.motors.m4);
  const yawDiff = (physics.motors.m2 + physics.motors.m3) - (physics.motors.m1 + physics.motors.m4);

  return (
    <div className="grid grid-cols-[260px_1fr_280px] gap-4 h-full">
      
      {/* ─── LEFT: BẢNG ĐIỀU KHIỂN ─── */}
      <div className="flex flex-col bg-slate-900 border border-slate-800 p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-black uppercase tracking-[0.1em] text-white">Điều khiển</h2>
          </div>
          <button 
            onClick={handleReset}
            className="text-[8px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 px-2 py-1 border border-white/5 transition-colors"
          >
            Làm Lại
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          <button 
            onClick={handleToggleEngine}
            disabled={engineState === "STARTING"}
            className={cn(
              "w-full py-2 border transition-all duration-500 mb-3 flex items-center justify-center gap-2 group",
              engineState === "OFF" 
                ? "bg-slate-800 border-slate-700 hover:bg-slate-800/80 text-slate-300" 
                : "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
            )}
          >
            <Power className={cn("w-3.5 h-3.5 transition-transform group-active:scale-90", engineState !== "OFF" && "animate-pulse")} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              {engineState === "OFF" ? "Khởi động máy" : engineState === "STARTING" ? "Đang chạy..." : "Tắt máy"}
            </span>
          </button>

          <ControlSlider label="Lực Nâng (Throttle)" keys="↑ / ↓" value={controls.throttle} isCentered={false} />
          <ControlSlider label="Tiến/Lùi (Pitch)" keys="W / S" value={controls.pitch} />
          <ControlSlider label="Trái/Phải (Roll)" keys="A / D" value={controls.roll} />
          <ControlSlider label="Xoay Mũi (Yaw)" keys="← / →" value={controls.yaw} />
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase mb-3 tracking-widest">
            <Info className="w-3 h-3" /> Hướng Dẫn
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-y-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-tight">
            <span>Khởi động</span>
            <kbd className="bg-slate-800 px-1 py-0.5 border border-slate-700 text-emerald-400 text-[7px]">ENTER</kbd>

            <span>Cất / Hạ cánh</span>
            <div className="flex gap-1"><kbd className="bg-slate-800 px-1 py-0.5 border border-slate-700">↑</kbd><kbd className="bg-slate-800 px-1 py-0.5 border border-slate-700">↓</kbd></div>
            
            <span>Di chuyển</span>
            <div className="flex gap-1"><kbd className="bg-slate-800 px-1 py-0.5 border border-slate-700">W</kbd><kbd className="bg-slate-800 px-1 py-0.5 border border-slate-700">S</kbd></div>
            
            <span>Nghiêng</span>
            <div className="flex gap-1"><kbd className="bg-slate-800 px-1 py-0.5 border border-slate-700">A</kbd><kbd className="bg-slate-800 px-1 py-0.5 border border-slate-700">D</kbd></div>
            
            <span>Xoay Mũi</span>
            <div className="flex gap-1"><kbd className="bg-slate-800 px-1 py-0.5 border border-slate-700">←</kbd><kbd className="bg-slate-800 px-1 py-0.5 border border-slate-700">→</kbd></div>
          </div>
        </div>
      </div>

      {/* ─── CENTER: 3D VIEWER ─── */}
      <div className="relative border border-slate-800 overflow-hidden bg-black">
        <FlightDroneViewer physicsRef={physicsRef} showForces={true} />
        
        <div className="absolute bottom-4 right-4 flex gap-3 bg-slate-900/80 px-4 py-2 border border-slate-700">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Độ Cao</span>
            <span className="text-xs font-mono font-bold text-cyan-400">{physics.altitude.toFixed(1)}m</span>
          </div>
          <div className="w-px h-full bg-slate-700" />
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Cân bằng</span>
            <span className="text-xs font-mono font-bold text-emerald-400">{physics.stability.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: VẬT LÝ ─── */}
      <div className="flex flex-col bg-slate-900 border border-slate-800 p-4 overflow-hidden">
        
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-black uppercase tracking-[0.1em] text-white">Hệ Thống Vật Lý</h2>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4 bg-slate-800/40 py-2 border border-slate-700 shrink-0">
          <div className={cn(
            "w-1.5 h-1.5 transition-all duration-300",
            engineState === "OFF" ? "bg-slate-600" : 
            engineState === "STARTING" ? "bg-amber-400 animate-pulse" :
            physics.altitude < 0.2 ? "bg-emerald-500" : "bg-cyan-400 animate-pulse"
          )} />
          <span className="text-[9px] text-white font-bold uppercase tracking-widest">
            {engineState === "OFF" ? "Máy tắt" :
             engineState === "STARTING" ? "Đang chạy..." :
             physics.altitude < 0.2 ? "Sẵn sàng cất cánh" : "Đang bay"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          <div className="text-[9px] font-bold text-slate-500 uppercase mb-3 tracking-[0.2em] flex items-center gap-2">
            <Activity className="w-3 h-3" /> Lực đẩy (Thrust)
          </div>
          <div className="relative w-full max-w-[190px] min-h-[230px] mx-auto mb-4 bg-slate-950 border border-slate-800/80 p-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-[80%] h-px bg-slate-700 rotate-45" />
              <div className="w-[80%] h-px bg-slate-700 -rotate-45 absolute" />
            </div>
            <div className="grid grid-cols-2 grid-rows-2 w-full relative z-20 gap-x-2 gap-y-10 scale-[0.95] origin-center">
              <div className="flex items-start justify-start"><MotorNode id="M1" label="FL" isCW={true} val={physics.motors.m1} /></div>
              <div className="flex items-start justify-end"><MotorNode id="M2" label="FR" isCW={false} val={physics.motors.m2} /></div>
              <div className="flex items-end justify-start"><MotorNode id="M3" label="RL" isCW={false} val={physics.motors.m3} /></div>
              <div className="flex items-end justify-end"><MotorNode id="M4" label="RR" isCW={true} val={physics.motors.m4} /></div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-slate-900 border border-slate-800 flex items-center justify-center z-30">
               <div className="w-1.5 h-1.5 bg-slate-700" />
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-800/80">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Phương trình lực</div>
            <div className="space-y-1.5">
              <MathRow label="Pitch (Tới)" formula="(M3+M4)-(M1+M2)" result={pitchDiff} />
              <MathRow label="Roll (Nghiêng)" formula="(M1+M3)-(M2+M4)" result={rollDiff} />
              <MathRow label="Yaw (Xoay)" formula="(M2+M3)-(M1+M4)" result={yawDiff} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
