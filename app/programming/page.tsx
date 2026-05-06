"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Drone3D from "@/components/programming/Drone3D";
import ControlPanel from "@/components/programming/ControlPanel";
import DroneOnboarding from "@/components/programming/DroneOnboarding";
import ManualControl from "@/components/programming/ManualControl";
import { mqttClient } from "@/lib/mqttClient";
import { parseScriptToJSON } from "@/lib/blockParser";
import { useDroneStore } from "@/lib/droneStore";

const BlocklyEditor = dynamic(() => import("@/components/programming/BlocklyEditor"), { ssr: false });

export type DroneState = {
  throttle: number; // 0 to 100
  pitch: number;    // -100 to 100
  roll: number;     // -100 to 100
  yaw: number;      // -100 to 100
  altitude: number; // in meters
  motors: {
    m1: number;
    m2: number;
    m3: number;
    m4: number;
  };
  resetFlag?: number;
};

export default function ProgrammingPage() {
  const [droneState, setDroneState] = useState<DroneState>({
    throttle: 0,
    pitch: 0,
    roll: 0,
    yaw: 0,
    altitude: 0,
    motors: { m1: 0, m2: 0, m3: 0, m4: 0 },
    resetFlag: 0,
  });

  const [targetDroneState, setTargetDroneState] = useState<DroneState>({
    throttle: 0,
    pitch: 0,
    roll: 0,
    yaw: 0,
    altitude: 0,
    motors: { m1: 0, m2: 0, m3: 0, m4: 0 },
    resetFlag: 0,
  });

  const [generatedScript, setGeneratedScript] = useState<string>("");
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'blockly' | 'manual'>('blockly');
  const [simulationStatus, setSimulationStatus] = useState<"ĐÃ DỪNG" | "ĐANG CHẠY">("ĐÃ DỪNG");
  const [currentCommandDisplay, setCurrentCommandDisplay] = useState<string>("Sẵn sàng");
  const [showOnboarding, setShowOnboarding] = useState(false); // [Tinh chỉnh] Mặc định không hiện để user trải nghiệm trước

  // Drone Store Integration
  const { droneId, status, setStatus, setDroneId, updateTelemetry, checkConnection, addDiscoveredDrone, discoveredDrones } = useDroneStore();
  const executionIdRef = React.useRef(0);

  // MQTT Initialization
  useEffect(() => {
    mqttClient.connect().catch(console.error);

    mqttClient.onDiscovery((data) => {
      if (data.droneId) {
        // [Tinh chỉnh] Thêm vào danh sách, không auto-chọn — để user tự chọn
        addDiscoveredDrone({
          droneId: data.droneId,
          online: data.online ?? true,
          armed: data.armed ?? false,
        });
      }
    });

    mqttClient.onStatus((data) => {
      // Chỉ cập nhật bảng thông số bên dưới (Dashboard numbers)
      // Không override setTargetDroneState() để mô phỏng 3D luôn mượt mà trên web
      updateTelemetry({
        thr: data.thr,
        pit: data.pit,
        rol: data.rol,
        yaw: data.yaw,
        alt: data.alt
      });
    });

    return () => mqttClient.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [Fix] Bỏ 'status' khỏi deps để tránh ngắt kết nối MQTT mỗi khi status đổi (từ online -> running)

  // [Tinh chỉnh] Connection check interval (every 2s)
  useEffect(() => {
    const interval = setInterval(() => {
      checkConnection();
    }, 2000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  const updateDroneState = useCallback((newState: Partial<DroneState>) => {
    setTargetDroneState((prev) => {
      const updated = { ...prev, ...newState };
      const t = updated.throttle || 0;
      const p = updated.pitch || 0;
      const r = updated.roll || 0;
      const y = updated.yaw || 0;

      const clamp = (val: number) => {
        if (t === 0) return 0;
        return Math.max(20, Math.min(100, val));
      };

      let m1 = t - p + r + y;
      let m2 = t - p - r - y;
      let m3 = t + p + r - y;
      let m4 = t + p - r + y;

      const maxMotor = Math.max(Math.abs(m1), Math.abs(m2), Math.abs(m3), Math.abs(m4), 100);
      const scale = 100 / maxMotor;

      updated.motors = {
        m1: clamp(m1 * scale),
        m2: clamp(m2 * scale),
        m3: clamp(m3 * scale),
        m4: clamp(m4 * scale),
      };

      return updated;
    });
  }, []);

  // Smooth interpolation loop
  React.useEffect(() => {
    let animationFrameId: number;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const loop = () => {
      setDroneState(prev => {
        return {
          throttle: lerp(prev.throttle, targetDroneState.throttle, 0.05),
          pitch: lerp(prev.pitch, targetDroneState.pitch, 0.05),
          roll: lerp(prev.roll, targetDroneState.roll, 0.05),
          yaw: lerp(prev.yaw, targetDroneState.yaw, 0.05),
          motors: {
            m1: lerp(prev.motors.m1, targetDroneState.motors.m1, 0.1),
            m2: lerp(prev.motors.m2, targetDroneState.motors.m2, 0.1),
            m3: lerp(prev.motors.m3, targetDroneState.motors.m3, 0.1),
            m4: lerp(prev.motors.m4, targetDroneState.motors.m4, 0.1),
          },
          altitude: prev.altitude,
          resetFlag: targetDroneState.resetFlag
        };
      });
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetDroneState]);

  const onUpdateAltitude = useCallback((alt: number) => {
    setDroneState(prev => {
      if (Math.abs(prev.altitude - alt) < 0.01) return prev;
      return { ...prev, altitude: alt };
    });
  }, []);

  const lastRunRef = React.useRef(0);

  const handleRunScript = useCallback((script: string) => {
    const now = Date.now();
    // [Chống spam] Prevent running scripts more often than once per second, and block if already running
    if (simulationStatus === "ĐANG CHẠY" || (now - lastRunRef.current < 1000)) return;
    lastRunRef.current = now;

    // [Auto-Reset] Tự động reset trạng thái 3D về mặc định trước khi bay
    setTargetDroneState({
      throttle: 0, pitch: 0, roll: 0, yaw: 0, altitude: 0,
      motors: { m1: 0, m2: 0, m3: 0, m4: 0 },
      resetFlag: Date.now()
    });

    setGeneratedScript(script);
    executionIdRef.current += 1;

    // [Fix] Nếu chưa chọn drone nhưng có trong danh sách → auto-chọn cái đầu tiên online
    let activeId = droneId;
    if (!activeId && discoveredDrones.length > 0) {
      const firstOnline = discoveredDrones.find(d => d.online) ?? discoveredDrones[0];
      setDroneId(firstOnline.droneId);
      setStatus('online');
      activeId = firstOnline.droneId;
      console.log('[Auto-select] Drone:', firstOnline.droneId);
    }

    // Publish MQTT nếu có kết nối
    if (activeId && status !== 'offline') {
      const jsonCommand = parseScriptToJSON(script, activeId);
      mqttClient.publishCommand(activeId, jsonCommand.commands);
      setStatus('running');
    }

    executeScript(script, executionIdRef.current);
  }, [simulationStatus, droneId, status, setStatus, showOnboarding]);

  const handleStop = () => {
    executionIdRef.current += 1;
    setSimulationStatus("ĐÃ DỪNG");
    if (status === 'running') setStatus('online');
    
    // Emergency stop via MQTT if online
    let currentDroneId = droneId;
    if (!currentDroneId && discoveredDrones.length > 0) {
      currentDroneId = discoveredDrones[0].droneId; // fallback
    }
    if (currentDroneId) {
      mqttClient.publishRaw(`drone/${currentDroneId}/emergency`, { action: 'STOP' });
    }

    setCurrentCommandDisplay("Đã dừng");
    updateDroneState({ throttle: 0, pitch: 0, roll: 0, yaw: 0 });
    setActiveBlockId(null);
  };

  const handleReset = () => {
    const resetState = {
      throttle: 0, pitch: 0, roll: 0, yaw: 0, altitude: 0,
      motors: { m1: 0, m2: 0, m3: 0, m4: 0 },
      resetFlag: Date.now()
    };
    setTargetDroneState(resetState);
    setDroneState(resetState);
    setCurrentCommandDisplay("Hệ thống sẵn sàng");
    setSimulationStatus("ĐÃ DỪNG");
    if (status === 'running') setStatus('online');
    setActiveBlockId(null);
    executionIdRef.current += 1;
  };

  const executeScript = async (script: string, runId: number) => {
    const lines = script.trim().split('\n');
    const cancelled = () => executionIdRef.current !== runId;

    setSimulationStatus("ĐANG CHẠY");
    setCurrentCommandDisplay("Khởi động...");

    const nonEmpty = lines.filter(l => l.trim());

    try {
      let i = 0;
      while (i < nonEmpty.length) {
        if (cancelled()) break;

        const [fullCmd, ...args] = nonEmpty[i].trim().split(' ');
        const [cmd, blockId] = fullCmd.split('|');

        setActiveBlockId(blockId || null);

        const durationVal = args[1] ? Number(args[1]) : 1.5;
        const durationMs = durationVal * 1000;

        switch (cmd) {
          case 'TAKEOFF':
            setCurrentCommandDisplay("Cất cánh...");
            updateDroneState({ throttle: 58 });
            await sleep(2000);
            if (cancelled()) break;
            updateDroneState({ throttle: 55 });
            await sleep(500);
            break;

          case 'LAND':
            setCurrentCommandDisplay("Hạ cánh...");
            updateDroneState({ throttle: 45, pitch: 0, roll: 0, yaw: 0 });
            await sleep(1000);
            updateDroneState({ throttle: 0 });
            await sleep(1000);
            break;

          case 'GO': {
            const dir = args[0];
            const dur = Number(args[1]);
            const pwr = Number(args[2]);
            const labelMap: any = { FORWARD: 'Tiến', BACKWARD: 'Lùi', LEFT: 'Trái', RIGHT: 'Phải', UP: 'Lên cao', DOWN: 'Xuống thấp' };
            setCurrentCommandDisplay(`Di chuyển: ${labelMap[dir] || dir} (${dur}s, ${pwr}%)`);

            let state: any = { pitch: 0, roll: 0, throttle: 55 };
            if (dir === 'FORWARD') state.pitch = pwr * 0.3;
            if (dir === 'BACKWARD') state.pitch = -pwr * 0.3;
            if (dir === 'LEFT') state.roll = -pwr * 0.3;
            if (dir === 'RIGHT') state.roll = pwr * 0.3;
            if (dir === 'UP') state.throttle = 55 + (pwr * 0.45);
            if (dir === 'DOWN') state.throttle = 55 - (pwr * 0.45);

            updateDroneState(state);
            await sleep(dur * 1000);
            if (cancelled()) break;
            updateDroneState({ pitch: 0, roll: 0, throttle: 55 });
            break;
          }

          case 'TURN': {
            const dir = args[0];
            const dur = Number(args[1]);
            const pwr = Number(args[2]);
            setCurrentCommandDisplay(`Quay: ${dir === 'LEFT' ? 'Trái' : 'Phải'} (${dur}s, ${pwr}%)`);
            const yawVal = dir === 'LEFT' ? -pwr : pwr;
            updateDroneState({ yaw: yawVal });
            await sleep(dur * 1000);
            if (cancelled()) break;
            updateDroneState({ yaw: 0 });
            break;
          }

          case 'TURN_DEG': {
            const dir = args[0];
            const deg = Number(args[1]);
            setCurrentCommandDisplay(`Quay: ${dir === 'LEFT' ? 'Trái' : 'Phải'} ${deg}°`);
            // Approximate duration for visual simulation: 1 sec per 90 degrees at ~50% power
            const dur = (deg / 90) * 1; 
            const yawVal = dir === 'LEFT' ? -50 : 50;
            updateDroneState({ yaw: yawVal });
            await sleep(dur * 1000);
            if (cancelled()) break;
            updateDroneState({ yaw: 0 });
            break;
          }

          case 'THROTTLE': {
            const pwr = Number(args[0]);
            const dur = Number(args[1]);
            setCurrentCommandDisplay(`Lực nâng: ${pwr}% (${dur}s)`);
            updateDroneState({ throttle: pwr });
            await sleep(dur * 1000);
            if (cancelled()) break;
            updateDroneState({ throttle: 55 }); // Hover power
            break;
          }

          case 'PITCH': {
            const dir = args[0];
            const pwr = Number(args[1]);
            const dur = Number(args[2]);
            setCurrentCommandDisplay(`Chúi: ${dir === 'FORWARD' ? 'Tiến' : 'Lùi'} ${pwr}% (${dur}s)`);
            updateDroneState({ pitch: dir === 'BACKWARD' ? -pwr * 0.3 : pwr * 0.3 });
            await sleep(dur * 1000);
            if (cancelled()) break;
            updateDroneState({ pitch: 0 });
            break;
          }

          case 'ROLL': {
            const dir = args[0];
            const pwr = Number(args[1]);
            const dur = Number(args[2]);
            setCurrentCommandDisplay(`Nghiêng: ${dir === 'LEFT' ? 'Trái' : 'Phải'} ${pwr}% (${dur}s)`);
            updateDroneState({ roll: dir === 'LEFT' ? -pwr * 0.3 : pwr * 0.3 });
            await sleep(dur * 1000);
            if (cancelled()) break;
            updateDroneState({ roll: 0 });
            break;
          }

          case 'YAW': {
            const dir = args[0];
            const pwr = Number(args[1]);
            const dur = Number(args[2]);
            setCurrentCommandDisplay(`Xoay: ${dir === 'LEFT' ? 'Trái' : 'Phải'} ${pwr}% (${dur}s)`);
            updateDroneState({ yaw: dir === 'LEFT' ? -pwr : pwr });
            await sleep(dur * 1000);
            if (cancelled()) break;
            updateDroneState({ yaw: 0 });
            break;
          }

          case 'EMERGENCY_STOP':
            setCurrentCommandDisplay("Dừng khẩn cấp!");
            updateDroneState({ throttle: 0, pitch: 0, roll: 0, yaw: 0 });
            // Exit loop immediately
            i = nonEmpty.length;
            break;

          case 'DELAY':
            setCurrentCommandDisplay(`Tạm dừng...`);
            await sleep(Number(args[0]) * 1000);
            break;
        }

        if (cancelled()) break;
        i++;
      }
    } finally {
      if (!cancelled()) {
        setActiveBlockId(null);
        updateDroneState({ pitch: 0, roll: 0, yaw: 0 });
        setSimulationStatus("ĐÃ DỪNG");
        setCurrentCommandDisplay("Hoàn thành");
        if (status === 'running') setStatus('online');
      }
    }
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  return (
    <main className="h-screen w-screen bg-[#0f172a] text-slate-200 overflow-hidden flex flex-col font-sans selection:bg-[#db4139]/30">
      {showOnboarding && <DroneOnboarding onComplete={() => setShowOnboarding(false)} />}
      
      <header className="h-14 border-b border-white/10 bg-[#1a2333]/90 backdrop-blur-xl flex items-center justify-between px-8 z-50 shrink-0 relative shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#db4139] to-[#c53a33] flex items-center justify-center shadow-lg shadow-red-900/30">
            <span className="text-white font-black text-sm">D</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[#db4139] uppercase tracking-widest leading-none">DroniVerse</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Hệ thống điều khiển</span>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 p-1 rounded-2xl border border-white/10 shadow-inner">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('TRIGGER_RUN_SCRIPT'))}
            disabled={simulationStatus === "ĐANG CHẠY"}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#db4139] hover:bg-[#c53a33] disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-red-900/40"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Bắt đầu
          </button>

          <button
            onClick={handleStop}
            disabled={simulationStatus === "ĐÃ DỪNG"}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-20"
          >
            Dừng lại
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Smart drone status chip */}
          <button
            onClick={() => setShowOnboarding(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-[9px] font-bold uppercase tracking-widest ${
              status === 'running'
                ? 'bg-[#db4139]/15 border-[#db4139]/40 text-[#db4139]'
                : status === 'online'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              status === 'running' ? 'bg-[#db4139] animate-pulse' :
              status === 'online' ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-slate-600'
            }`} />
            {status === 'offline'
              ? 'Kết nối Drone'
              : droneId
              ? droneId.replace('drone_', '').toUpperCase()
              : status === 'online' ? 'Online' : 'Đang bay'
            }
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        <div className="w-[45%] h-full relative flex flex-col gap-2">
          
          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-[#1a2333] p-1 rounded-md border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab('blockly')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
                activeTab === 'blockly' 
                  ? 'bg-[#db4139] text-white shadow-lg shadow-red-900/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Khối lệnh (Blockly)
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
                activeTab === 'manual' 
                  ? 'bg-[#2dd4bf] text-[#0f172a] shadow-lg shadow-teal-900/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Điều khiển thủ công
            </button>
          </div>

          {/* Panel Content */}
          <div className="flex-1 relative overflow-hidden group">
            {activeTab === 'blockly' ? (
              <BlocklyEditor onRunScript={handleRunScript} activeBlockId={activeBlockId} />
            ) : (
              <ManualControl />
            )}
          </div>
        </div>

        <div className="w-[55%] h-full relative rounded-2xl overflow-hidden border border-white/10 bg-[#1a2333] shadow-2xl">
          <Drone3D droneState={droneState} onUpdateAltitude={onUpdateAltitude} />

          <div className="absolute top-6 left-6 z-20 pointer-events-none flex items-center gap-3">
            <div className="bg-[#243147]/95 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-5">
              <div className="flex items-center gap-2.5 pr-5 border-r border-white/10">
                <div className={`w-2 h-2 rounded-full ${
                  status === 'running' ? 'bg-[#db4139] animate-pulse shadow-[0_0_10px_#db4139]' :
                  status === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-600'
                }`} />
                <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest">
                  {status === 'running' ? 'Đang bay' : status === 'online' ? 'Sẵn sàng' : 'Ngoại tuyến'}
                </span>
              </div>
              
              <div className="flex items-baseline gap-2 pr-5 border-r border-white/10">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Độ cao</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-sm font-mono font-black text-[#2dd4bf]">{droneState.altitude.toFixed(1)}</span>
                  <span className="text-[8px] font-bold text-slate-600 uppercase">m</span>
                </div>
              </div>

              {simulationStatus === 'ĐANG CHẠY' && (
                <div className="flex flex-col">
                  <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-0.5">Lệnh</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">{currentCommandDisplay}</span>
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-6 right-6 z-20 w-[240px] pointer-events-auto">
            <div className="bg-[#243147]/90 backdrop-blur-2xl border border-white/10 p-2.5 rounded-2xl shadow-2xl ring-1 ring-white/10">
              <ControlPanel droneState={droneState} compact={true} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
