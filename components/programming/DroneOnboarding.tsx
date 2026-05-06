"use client";

import React, { useState, useEffect } from 'react';
import { useDroneStore, DiscoveredDrone } from '@/lib/droneStore';

const STEPS = [
  {
    title: "Kết nối WiFi",
    description: "Kết nối máy tính với mạng WiFi của Drone để bắt đầu cấu hình.",
    instruction: "WiFi: DRONE_SYSTEM",
    note: "Lưu ý: Việc mạng WiFi báo không có internet là hoàn toàn bình thường."
  },
  {
    title: "Trang cấu hình",
    description: "Sau khi kết nối thành công, mở trình duyệt và truy cập vào địa chỉ IP bên dưới.",
    instruction: "192.168.4.1",
    copyAddress: "http://192.168.4.1",
    note: "💡 Dùng Safari hoặc Firefox — Chrome thường bị lỗi với địa chỉ này"
  },
  {
    title: "Thiết lập mạng",
    description: "Nhập tên WiFi đang sử dụng và mật khẩu vào form, sau đó bấm Lưu.",
    instruction: "Sau khi bấm Lưu, Drone sẽ khởi động lại",
    note: "Lưu ý: Mạng WiFi của Drone sẽ biến mất. Bạn cần chủ động kết nối máy tính về lại WiFi nhà để tiếp tục."
  },
  {
    title: "Chọn Drone",
    description: "Đang quét tín hiệu... Chọn drone bạn muốn điều khiển.",
  },
  {
    title: "Sẵn sàng!",
    description: "Drone đã kết nối thành công và sẵn sàng nhận lệnh.",
    success: true
  }
];

function DroneCard({ drone, onSelect }: { drone: DiscoveredDrone; onSelect: () => void }) {
  const shortId = drone.droneId.replace('drone_', '').toUpperCase();
  const secAgo = Math.round((Date.now() - drone.lastSeen) / 1000);
  const isOnline = drone.online && secAgo < 10;

  return (
    <button
      onClick={isOnline ? onSelect : undefined}
      disabled={!isOnline}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group text-left ${
        isOnline
          ? 'bg-white/5 hover:bg-[#db4139]/10 border border-white/10 hover:border-[#db4139]/40'
          : 'bg-black/20 border border-white/5 opacity-50 cursor-not-allowed'
      }`}
    >
      {/* Signal Icon */}
      <div className="w-10 h-10 shrink-0 rounded-xl bg-[#db4139]/10 border border-[#db4139]/20 flex items-center justify-center group-hover:bg-[#db4139]/20 transition-all">
        <svg className="w-5 h-5 text-[#db4139]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-black text-white font-mono">{shortId}</span>
          {isOnline && drone.armed && (
            <span className="text-[8px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Armed</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-slate-600'}`} />
          <span className="text-[10px] text-slate-500">{isOnline ? 'Online' : 'Offline'} · {secAgo < 3 ? 'vừa xong' : `${secAgo}s trước`}</span>
        </div>
      </div>

      {/* Arrow */}
      {isOnline && (
        <svg className="w-4 h-4 text-slate-600 group-hover:text-[#db4139] transition-all group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}

export default function DroneOnboarding({ onComplete }: { onComplete: () => void }) {
  const { droneId, status, setDroneId, setStatus, discoveredDrones } = useDroneStore();
  const [currentStep, setCurrentStep] = useState(() => (status !== 'offline' && droneId) ? 4 : 0);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Auto-advance to success after selecting a drone
  useEffect(() => {
    if (status === 'online' && droneId && currentStep === 3) {
      setCurrentStep(4);
    }
  }, [status, droneId, currentStep]);

  const handleSelectDrone = (drone: DiscoveredDrone) => {
    setDroneId(drone.droneId);
    setStatus('online');
    setCurrentStep(4);
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
    else if (currentStep === 4) onComplete();
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a1a]/80 backdrop-blur-md p-6">
      <div className="w-full max-w-md bg-[#1a2333] border border-white/10 rounded-3xl shadow-2xl shadow-blue-900/20">

        {/* Header: step dots + close */}
        <div className="flex items-center gap-3 px-6 pt-6">
          <div className="flex flex-1 gap-1.5">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${idx <= currentStep ? 'bg-[#db4139] shadow-[0_0_6px_#db4139]' : 'bg-white/10'}`}
              />
            ))}
          </div>
          <button
            onClick={onComplete}
            className="w-7 h-7 shrink-0 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center text-center space-y-5">

            {/* Step number */}
            {currentStep !== 3 && (
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
                <span className="text-2xl font-black text-[#db4139] z-10">{currentStep + 1}</span>
                <div className="absolute inset-0 bg-gradient-to-br from-[#db4139]/20 to-transparent" />
              </div>
            )}

            {/* Title + description */}
            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{step.title}</h2>
              <p className="text-slate-400 text-sm max-w-xs">{step.description}</p>
            </div>

            {/* Instruction box (steps 0,1,2) */}
            {(step as any).instruction && (
              <div className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hướng dẫn</span>
                <span className="text-base font-mono font-bold text-[#2dd4bf]">{(step as any).instruction}</span>
                {(step as any).note && (
                  <span className="text-[10px] italic text-[#db4139]/80 mt-1 text-center">{(step as any).note}</span>
                )}
              </div>
            )}

            {/* Step 4: Drone picker */}
            {currentStep === 3 && (
              <div className="w-full space-y-3">
                {/* Scanner pulse */}
                <div className="flex items-center gap-2 justify-center py-2">
                  <div className="relative w-2 h-2">
                    <div className="absolute inset-0 rounded-full bg-[#db4139] animate-ping opacity-75" />
                    <div className="w-2 h-2 rounded-full bg-[#db4139]" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    {discoveredDrones.length === 0 ? 'Đang quét...' : `Tìm thấy ${discoveredDrones.length} drone`}
                  </span>
                </div>

                {/* Drone list */}
                {discoveredDrones.length > 0 ? (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {discoveredDrones.map(drone => (
                      <DroneCard
                        key={drone.droneId}
                        drone={drone}
                        onSelect={() => handleSelectDrone(drone)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 gap-3">
                    <div className="w-10 h-10 border-3 border-white/10 border-t-[#db4139] rounded-full animate-spin" style={{ borderWidth: 3 }} />
                    <span className="text-xs text-slate-500">Đảm bảo drone đã kết nối cùng WiFi nhà</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Success */}
            {(step as any).success && (
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-14 h-14 bg-[#2dd4bf]/20 text-[#2dd4bf] rounded-full flex items-center justify-center shadow-[0_0_20px_#2dd4bf33]">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[10px] font-black text-[#2dd4bf] uppercase tracking-widest">
                  {droneId?.replace('drone_', '').toUpperCase()}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="w-full flex flex-col gap-2 pt-2">
              {(step as any).copyAddress ? (
                <>
                  <button
                    onClick={() => window.open((step as any).copyAddress)}
                    className="w-full py-4 rounded-2xl bg-[#db4139] hover:bg-[#c53a33] text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-900/40"
                  >
                    Mở trang cấu hình
                  </button>
                  <div className="flex gap-2">
                    <button onClick={handleBack} className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold text-xs uppercase tracking-widest transition-all border border-white/10">
                      ← Quay lại
                    </button>
                    <button onClick={handleNext} className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold text-xs uppercase tracking-widest transition-all border border-white/10">
                      Tiếp theo →
                    </button>
                  </div>
                </>
              ) : currentStep === 3 ? (
                // Step 4: only back button, selection is the primary action
                <button onClick={handleBack} className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold text-xs uppercase tracking-widest transition-all border border-white/10">
                  ← Quay lại
                </button>
              ) : currentStep === 4 ? (
                <div className="w-full flex flex-col gap-2">
                  <button
                    onClick={onComplete}
                    className="w-full py-4 rounded-2xl bg-[#2dd4bf] hover:bg-[#26b5a3] text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-teal-900/30"
                  >
                    Bắt đầu lập trình
                  </button>
                  <button
                    onClick={() => {
                      setDroneId(null);
                      setStatus('offline');
                      setCurrentStep(0);
                      onComplete();
                    }}
                    className="w-full py-3 rounded-2xl bg-[#db4139]/10 hover:bg-[#db4139]/20 text-[#db4139] border border-[#db4139]/20 font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Ngắt kết nối Drone
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <button onClick={handleBack} className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-widest transition-all border border-white/10">
                      ← Quay lại
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex-1 py-4 rounded-2xl bg-[#db4139] hover:bg-[#c53a33] text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-900/40"
                  >
                    Tiếp theo →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
