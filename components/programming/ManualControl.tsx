"use client";

import React, { useState, useEffect } from 'react';
import { useDroneStore } from '@/lib/droneStore';
import { mqttClient } from '@/lib/mqttClient';

export default function ManualControl() {
  const { droneId, status } = useDroneStore();
  const [controlMode, setControlMode] = useState<'flight' | 'motor_test'>('flight');
  const [armed, setArmed] = useState(false);

  const [flightVals, setFlightVals] = useState({ thrust: 0, roll: 0, pitch: 0, yaw: 0 });
  const [motorVals, setMotorVals] = useState({ m1: 0, m2: 0, m3: 0, m4: 0 });

  const sendCommand = (forceDisarm = false) => {
    if (!droneId || !mqttClient) return;
    const payload = controlMode === 'motor_test' ? {
      mode: 'motor_test',
      motor1: motorVals.m1,
      motor2: motorVals.m2,
      motor3: motorVals.m3,
      motor4: motorVals.m4,
      armed: forceDisarm ? false : armed
    } : {
      mode: 'flight',
      thrust: flightVals.thrust,
      roll: flightVals.roll,
      pitch: flightVals.pitch,
      yaw: flightVals.yaw,
      armed: forceDisarm ? false : armed
    };
    mqttClient.publishRaw(`drone/${droneId}/cmd`, payload);
  };

  // Send command at 10Hz if armed
  useEffect(() => {
    if (!armed || !droneId) return;
    const interval = setInterval(() => sendCommand(false), 100);
    return () => clearInterval(interval);
  }, [armed, droneId, controlMode, flightVals, motorVals]);

  const handleStopAll = () => {
    sendCommand(true); // Gửi cữ cuối báo tắt sạch
    setArmed(false);
    setFlightVals({ thrust: 0, roll: 0, pitch: 0, yaw: 0 });
    setMotorVals({ m1: 0, m2: 0, m3: 0, m4: 0 });
    
    if (droneId && mqttClient) {
      mqttClient.publishRaw(`drone/${droneId}/emergency`, { action: 'STOP' });
    }
  };

  const zeroSliders = () => {
    setFlightVals({ thrust: 0, roll: 0, pitch: 0, yaw: 0 });
    setMotorVals({ m1: 0, m2: 0, m3: 0, m4: 0 });
  };

  const isConnected = status !== 'offline' && droneId;

  return (
    <div className="w-full h-full bg-[#1a2333] border border-white/10 rounded-md flex flex-col overflow-hidden text-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1f2937]/50">
        <h2 className="font-black text-white uppercase tracking-widest text-xs">Điều khiển thủ công</h2>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded text-[10px] font-bold ${armed ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
            {armed ? 'ARMED' : 'DISARM'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isConnected && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md text-xs font-bold text-center">
            Vui lòng kết nối Drone để sử dụng điều khiển thủ công.
          </div>
        )}

        <div className="flex gap-2 bg-black/20 p-1 rounded-md">
          <button 
            onClick={() => { setControlMode('flight'); setArmed(false); }}
            className={`flex-1 py-2 rounded-md font-bold text-[10px] uppercase tracking-widest transition-all ${controlMode === 'flight' ? 'bg-[#2dd4bf] text-[#0f172a]' : 'text-slate-400 hover:bg-white/5'}`}
          >
            Chế độ bay
          </button>
          <button 
            onClick={() => { setControlMode('motor_test'); setArmed(false); }}
            className={`flex-1 py-2 rounded-md font-bold text-[10px] uppercase tracking-widest transition-all ${controlMode === 'motor_test' ? 'bg-[#2dd4bf] text-[#0f172a]' : 'text-slate-400 hover:bg-white/5'}`}
          >
            Test Động cơ
          </button>
        </div>

        {controlMode === 'flight' ? (
          <div className="space-y-3 bg-white/5 p-4 rounded-md border border-white/10">
            {[
              { label: 'Lực nâng (Thrust)', key: 'thrust', min: 0, max: 60000, val: flightVals.thrust },
              { label: 'Nghiêng (Roll)', key: 'roll', min: -180, max: 180, val: flightVals.roll },
              { label: 'Chúi (Pitch)', key: 'pitch', min: -180, max: 180, val: flightVals.pitch },
              { label: 'Xoay (Yaw)', key: 'yaw', min: -180, max: 180, val: flightVals.yaw }
            ].map(item => (
              <div key={item.key} className="flex items-center gap-3">
                <span className="w-32 text-slate-400 font-bold text-xs">{item.label}</span>
                <input 
                  type="range" min={item.min} max={item.max} value={item.val}
                  onChange={(e) => setFlightVals(p => ({ ...p, [item.key]: Number(e.target.value) }))}
                  className="flex-1 accent-[#2dd4bf]"
                  disabled={!isConnected}
                />
                <span className="w-12 text-right font-mono text-[#2dd4bf]">{item.val}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 bg-white/5 p-4 rounded-md border border-white/10">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className="flex items-center gap-3">
                <span className="w-20 text-slate-400 font-bold text-xs">Động cơ {num}</span>
                <input 
                  type="range" min="0" max="65535" value={(motorVals as any)[`m${num}`]}
                  onChange={(e) => setMotorVals(p => ({ ...p, [`m${num}`]: Number(e.target.value) }))}
                  className="flex-1 accent-[#db4139]"
                  disabled={!isConnected}
                />
                <span className="w-12 text-right font-mono text-[#db4139]">{(motorVals as any)[`m${num}`]}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => setArmed(true)} disabled={!isConnected}
            className="py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 font-black text-[10px] uppercase tracking-widest rounded-md transition-all"
          >
            KHỞI ĐỘNG (ARM)
          </button>
          <button 
            onClick={() => { sendCommand(true); setArmed(false); }} disabled={!isConnected}
            className="py-3 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest rounded-md transition-all"
          >
            NGẮT (DISARM)
          </button>
          <button 
            onClick={handleStopAll} disabled={!isConnected}
            className="py-3 bg-[#db4139] hover:bg-[#c53a33] disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest rounded-md transition-all shadow-lg shadow-red-900/30"
          >
            DỪNG KHẨN CẤP
          </button>
        </div>

      </div>
    </div>
  );
}
