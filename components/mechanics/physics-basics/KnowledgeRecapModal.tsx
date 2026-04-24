"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { LessonId } from "./PhysicsBasicsEngine";

export const TAKEAWAYS: Partial<Record<LessonId, { points: string[], formula?: string }>> = {
  lift: {
    points: [
      "Lực nâng (Thrust) phải lớn hơn Trọng lực (Gravity) để drone cất cánh.",
      "Khi Thrust = Gravity, drone ở trạng thái Hover (đứng yên lơ lửng).",
    ],
    formula: "F_lift = k × RPM²"
  },
  roll: {
    points: [
      "Để nghiêng sang trái/phải, cần tạo sự chênh lệch lực đẩy giữa motor Trái và Phải.",
      "Drone sẽ nghiêng về phía motor quay chậm hơn (lực đẩy yếu hơn).",
    ],
    formula: "Roll ∝ (F_left - F_right)"
  },
  pitch: {
    points: [
      "Để tiến/lùi, cần tạo sự chênh lệch lực đẩy giữa motor Trước và Sau.",
      "Drone sẽ nghiêng chúc mũi về phía motor quay chậm hơn.",
    ],
    formula: "Pitch ∝ (F_rear - F_front)"
  },
  yaw: {
    points: [
      "Để xoay tại chỗ, cần tạo chênh lệch công suất giữa 2 cặp motor chéo nhau.",
      "Mô-men xoắn (Torque) sinh ra do phản lực quay của cánh quạt.",
    ],
    formula: "Yaw ∝ (τ_cw - τ_ccw)"
  },
  /*
  equilibrium: {
    points: [
      "Trạng thái cân bằng đạt được khi tổng lực tác động lên drone bằng không.",
      "Đây là nền tảng để giữ drone đứng yên lơ lửng (Hovering).",
    ],
    formula: "ΣF = F_lift - F_weight = 0"
  },
  drag: {
    points: [
      "Lực cản không khí tỷ lệ thuận với bình phương vận tốc của drone.",
      "Lực cản này giới hạn tốc độ tối đa và làm tiêu tốn năng lượng pin.",
    ],
    formula: "F_drag = 1/2 × ρ × v² × Cd × A"
  },
  wind: {
    points: [
      "Gió tạo ra lực đẩy ngang tác động vào diện tích bề mặt của drone.",
      "Để đứng yên trong gió, drone cần nghiêng một góc để tạo lực đối kháng.",
    ],
    formula: "F_wind = P_wind × Area"
  },
  weight: {
    points: [
      "Lệch trọng tâm khiến drone bị tự động nghiêng về phía nặng hơn.",
      "Cần điều chỉnh lực đẩy motor không đều để bù đắp cho sự mất cân bằng này.",
    ],
    formula: "τ = Force × Distance"
  },
  battery: {
    points: [
      "Điện áp pin giảm dần theo thời gian sử dụng, làm giảm RPM tối đa.",
      "Cùng một mức Throttle, pin yếu sẽ sinh ra lực nâng thấp hơn pin đầy.",
    ],
    formula: "RPM ∝ Voltage"
  },
  stabilization: {
    points: [
      "Hệ thống PID liên tục tính toán sai số góc để điều chỉnh RPM từng motor.",
      "Giúp drone tự động chống lại nhiễu loạn và trở về trạng thái cân bằng hoàn hảo.",
    ],
    formula: "PID = P*e + I*∫e dt + D*de/dt"
  }
  */
};

interface KnowledgeRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  lessonId: LessonId;
  lessonTitle: string;
  isLastLesson: boolean;
  isCompleted?: boolean;
}

export function KnowledgeRecapModal({ isOpen, onClose, onNext, lessonId, lessonTitle, isLastLesson, isCompleted }: KnowledgeRecapModalProps) {
  if (!isOpen) return null;
  const recap = TAKEAWAYS[lessonId];
  if (!recap) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 p-6 border-b border-white/10 text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3 border border-emerald-500/30">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-black text-white">Tuyệt vời!</h3>
            <p className="text-xs text-white/60 font-medium mt-1">Bạn đã hoàn thành: {lessonTitle}</p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Tri thức cốt lõi</span>
            </div>

            <ul className="space-y-4">
              {recap.points.map((pt, i) => (
                <li key={i} className="flex gap-3 text-[13px] text-white/80 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            {recap.formula && (
              <div className="mt-4 p-3 rounded-lg bg-black/50 border border-white/5 font-mono text-center text-cyan-400 text-xs">
                {recap.formula}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white/5 border-t border-white/10 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-[11px] font-bold uppercase tracking-wider transition-all"
            >
              Đóng lại
            </button>
            <button
              onClick={() => {
                onClose();
                onNext();
              }}
              className="flex-[2] px-4 py-3 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              {isLastLesson ? (
                isCompleted ? (
                  <>Quay lại lộ trình <ArrowRight className="w-4 h-4" /></>
                ) : (
                  <>Hoàn tất khóa <CheckCircle className="w-4 h-4" /></>
                )
              ) : (
                <>Bài tiếp theo <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
