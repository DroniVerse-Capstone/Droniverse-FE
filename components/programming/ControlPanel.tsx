"use client";

import React from "react";
import { DroneState } from "@/app/programming/page";

type ControlPanelProps = {
  droneState: DroneState;
  compact?: boolean;
};

// Compact Circular Gauge
function CompactGauge({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const percentage = Math.min(Math.abs(value) / max, 1);
  const size = 36;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - percentage * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-200"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-black" style={{ color }}>{value.toFixed(0)}</span>
        </div>
      </div>
      <span className="text-[6px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

// Full Circular Gauge for non-compact
function CircularGauge({ value, max, label, unit, color, size = 48 }: { value: number; max: number; label: string; unit: string; color: string; size?: number }) {
  const percentage = Math.min(Math.abs(value) / max, 1);
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - percentage * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-[10px] font-black ${color.replace('text-', 'text-')}`}>{value.toFixed(0)}</span>
        </div>
      </div>
      <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</span>
      <span className="text-[6px] text-slate-600">{unit}</span>
    </div>
  );
}

// Mini Motor for compact mode
function CompactMotor({ id, power }: { id: string; power: number }) {
  const isActive = power > 0;
  const color = power > 75 ? '#10b981' : power > 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-6 rounded border transition-all flex items-center justify-center" style={{
        borderColor: isActive ? `${color}40` : 'rgba(255,255,255,0.05)',
        backgroundColor: isActive ? `${color}10` : 'transparent'
      }}>
        <span className="text-[6px] font-black" style={{ color: isActive ? color : '#4b5563' }}>{id}</span>
      </div>
      <span className="text-[8px] font-mono font-bold" style={{ color: isActive ? color : '#4b5563' }}>
        {power.toFixed(0)}%
      </span>
    </div>
  );
}

// Motor with animation for non-compact
function MotorIndicator({ id, power, position }: { id: string; power: number; position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const isActive = power > 0;
  const color = power > 75 ? '#10b981' : power > 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className={`flex items-center gap-2 ${position === 'tr' || position === 'bl' ? 'flex-row-reverse' : ''}`}>
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-lg border-2 transition-all duration-300" style={{ borderColor: isActive ? `${color}40` : undefined }}>
          <div className="absolute inset-1 rounded" style={{ overflow: 'hidden' }}>
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ animation: isActive ? `spin ${1 / (power / 30)}s linear infinite` : 'none' }}
            >
              <div className="relative w-full h-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full transition-colors" style={{ backgroundColor: isActive ? color : '#374151' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-1.5 rounded-full transition-colors" style={{ backgroundColor: isActive ? color : '#374151' }} />
              </div>
            </div>
          </div>
          {isActive && <div className="absolute inset-0 rounded-lg opacity-30 blur-sm" style={{ backgroundColor: color }} />}
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[6px] font-black text-slate-500">{id}</div>
      </div>
      <div className="flex flex-col items-center">
        <span className={`text-[10px] font-black tabular-nums transition-colors`} style={{ color: isActive ? color : '#4b5563' }}>
          {power.toFixed(0)}<span className="text-[6px] opacity-50">%</span>
        </span>
      </div>
    </div>
  );
}

export default function ControlPanel({ droneState, compact = false }: ControlPanelProps) {
  if (compact) {
    return (
      <div className="h-full flex flex-col gap-1.5">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
            <span className="text-[9px] font-bold text-slate-200 uppercase tracking-wider">Điều khiển</span>
          </div>
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[6px] font-bold ${
            droneState.throttle > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
          }`}>
            <div className={`w-1 h-1 rounded-full ${droneState.throttle > 0 ? 'bg-emerald-400' : 'bg-slate-400'}`} />
            {droneState.throttle > 0 ? 'BAY' : 'CHỜ'}
          </div>
        </div>

        {/* Compact Gauges Row */}
        <div className="flex items-center justify-around px-1">
          <CompactGauge value={droneState.throttle} max={100} label="THR" color="#10b981" />
          <CompactGauge value={droneState.pitch} max={100} label="PIT" color="#3b82f6" />
          <CompactGauge value={droneState.roll} max={100} label="ROL" color="#f59e0b" />
          <CompactGauge value={droneState.yaw} max={100} label="YAW" color="#a855f7" />
        </div>

        {/* Motors Grid */}
        <div className="flex-1 bg-[#1a1d25] border border-white/[0.04] rounded-lg p-2 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
            backgroundSize: '12px 12px'
          }} />
          <div className="relative flex items-center justify-between h-full">
            {/* Left Motors */}
            <div className="flex flex-col gap-1">
              <CompactMotor id="M1" power={droneState.motors.m1} />
              <CompactMotor id="M3" power={droneState.motors.m3} />
            </div>

            {/* Center Drone */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/2 left-0 w-full h-px bg-indigo-500/50" />
                <div className="absolute top-0 left-1/2 w-px h-full bg-indigo-500/50" />
              </div>
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
                droneState.throttle > 0 ? 'border-indigo-400/50 bg-indigo-500/10' : 'border-white/10'
              }`}>
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={droneState.throttle > 0 ? '#818cf8' : '#94a3b8'} strokeWidth="1.5">
                  <circle cx="6" cy="6" r="2" />
                  <circle cx="18" cy="6" r="2" />
                  <circle cx="6" cy="18" r="2" />
                  <circle cx="18" cy="18" r="2" />
                  <path d="M6 6L18 18M18 6L6 18" strokeDasharray="2 2" />
                </svg>
              </div>
            </div>

            {/* Right Motors */}
            <div className="flex flex-col gap-1">
              <CompactMotor id="M2" power={droneState.motors.m2} />
              <CompactMotor id="M4" power={droneState.motors.m4} />
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between shrink-0 px-1">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${droneState.throttle > 0 ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            <span className="text-[7px] font-medium text-slate-300">
              {droneState.throttle > 0 ? 'Đang bay' : 'Chờ lệnh'}
            </span>
          </div>
          <span className="text-[7px] font-mono text-slate-400">
            TB: {((droneState.motors.m1 + droneState.motors.m2 + droneState.motors.m3 + droneState.motors.m4) / 4).toFixed(0)}%
          </span>
        </div>
      </div>
    );
  }

  // Full version (non-compact)
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[4px] animate-pulse" />
          </div>
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">DỮ LIỆU BAY</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">TRỰC TIẾP</span>
        </div>
      </div>

      {/* Main Gauges Grid */}
      <div className="grid grid-cols-4 gap-3">
        <CircularGauge value={droneState.throttle} max={100} label="Lực nâng" unit="%" color="text-emerald-400" />
        <CircularGauge value={droneState.pitch} max={100} label="Độ chúc" unit="°" color="text-blue-400" />
        <CircularGauge value={droneState.roll} max={100} label="Độ nghiêng" unit="°" color="text-orange-400" />
        <CircularGauge value={droneState.yaw} max={100} label="Góc quay" unit="°" color="text-purple-400" />
      </div>

      {/* Motors Visualization */}
      <div className="pt-2">
        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-4 h-px bg-gradient-to-r from-indigo-500/50 to-transparent" />
          Động cơ
          <span className="flex-1 h-px bg-gradient-to-l from-indigo-500/50 to-transparent" />
        </div>

        <div className="bg-[#0d1117]/60 border border-white/5 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
              backgroundSize: '12px 12px'
            }} />
          </div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          <div className="relative flex justify-between items-center">
            <div className="flex flex-col gap-4">
              <MotorIndicator id="M1" power={droneState.motors.m1} position="tl" />
              <MotorIndicator id="M3" power={droneState.motors.m3} position="bl" />
            </div>

            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/2 left-0 w-full h-px bg-indigo-500/50" />
                <div className="absolute top-0 left-1/2 w-px h-full bg-indigo-500/50" />
              </div>
              <div className={`relative w-10 h-10 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${droneState.throttle > 0 ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-white/10 bg-white/5'}`}>
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke={droneState.throttle > 0 ? '#818cf8' : '#64748b'} strokeWidth="1.5">
                  <circle cx="6" cy="6" r="2" />
                  <circle cx="18" cy="6" r="2" />
                  <circle cx="6" cy="18" r="2" />
                  <circle cx="18" cy="18" r="2" />
                  <path d="M6 6L18 18M18 6L6 18" strokeDasharray="2 2" />
                </svg>
                {droneState.throttle > 0 && <div className="absolute inset-0 bg-indigo-500/20 rounded-lg blur-sm animate-pulse" />}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <MotorIndicator id="M2" power={droneState.motors.m2} position="tr" />
              <MotorIndicator id="M4" power={droneState.motors.m4} position="br" />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${droneState.throttle > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-[7px] font-medium text-slate-500">{droneState.throttle > 0 ? 'ĐANG BẬT' : 'TẮT'}</span>
            </div>
            <span className="text-[7px] font-mono text-slate-600">TB: {((droneState.motors.m1 + droneState.motors.m2 + droneState.motors.m3 + droneState.motors.m4) / 4).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Flight Status */}
      <div className="pt-2">
        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          <span className="w-4 h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
          Trạng thái bay
          <span className="flex-1 h-px bg-gradient-to-l from-amber-500/50 to-transparent" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${droneState.altitude === 0 ? 'bg-slate-600' : droneState.altitude < 1 ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
              style={{ width: `${Math.min(droneState.altitude, 10) * 10}%` }}
            />
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-400 w-16 text-right">
            {droneState.altitude === 0 ? 'Đã đáp' : droneState.altitude < 1 ? 'Sát đất' : 'Đang bay'}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
