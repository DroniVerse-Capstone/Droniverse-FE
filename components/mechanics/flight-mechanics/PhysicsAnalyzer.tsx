import React from "react";
import { MotorValues, FlightState } from "./physics";
import { cn } from "@/lib/utils";
import { Zap, Info, ArrowUp, ArrowDown, RefreshCcw } from "lucide-react";

interface PhysicsAnalyzerProps {
  motors: MotorValues;
  physics: FlightState;
}

export function PhysicsAnalyzer({ motors, physics }: PhysicsAnalyzerProps) {
  // 1. Calculate imbalances
  const frontThrust = motors.m1 + motors.m2;
  const rearThrust = motors.m3 + motors.m4;
  const leftThrust = motors.m1 + motors.m3;
  const rightThrust = motors.m2 + motors.m4;
  const cwThrust = motors.m1 + motors.m4;
  const ccwThrust = motors.m2 + motors.m3;

  const totalThrust = (frontThrust + rearThrust) / 4;

  // 2. Detect Conditions
  const isHovering = Math.abs(totalThrust - 50) < 2 &&
    Math.abs(frontThrust - rearThrust) < 5 &&
    Math.abs(leftThrust - rightThrust) < 5;

  const isPitchingForward = rearThrust > frontThrust + 5;
  const isPitchingBackward = frontThrust > rearThrust + 5;
  const isRollingRight = leftThrust > rightThrust + 5;
  const isRollingLeft = rightThrust > leftThrust + 5;
  const isYawingLeft = cwThrust > ccwThrust + 5;
  const isYawingRight = ccwThrust > cwThrust + 5;

  // 3. Generate Explanation Text
  const getMainExplanation = () => {
    if (physics.altitude < 0.1 && totalThrust < 10) return "Drone đang tắt máy trên mặt đất.";
    if (isHovering) return "Tất cả motor cân bằng → Drone đang lơ lửng (Hover).";

    const reasons: string[] = [];
    if (isPitchingForward) reasons.push("Motor SAU mạnh hơn → Tạo mô-men hướng tới → Chúi mũi xuống");
    if (isPitchingBackward) reasons.push("Motor TRƯỚC mạnh hơn → Tạo mô-men lùi sau → Ngóc mũi lên");
    if (isRollingRight) reasons.push("Motor TRÁI mạnh hơn → Đẩy drone nghiêng sang PHẢI");
    if (isRollingLeft) reasons.push("Motor PHẢI mạnh hơn → Đẩy drone nghiêng sang TRÁI");
    if (isYawingRight) reasons.push("Motor CCW (ngược chiều kim đồng hồ) mạnh hơn → Xoay mũi sang PHẢI");
    if (isYawingLeft) reasons.push("Motor CW (thuận chiều kim đồng hồ) mạnh hơn → Xoay mũi sang TRÁI");

    return reasons.length > 0 ? reasons.join(". ") : "Drone đang điều chỉnh trạng thái.";
  };

  return (
    <div className="space-y-4">
      {/* Real-time explanation */}
      <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Phân tích vật lý</span>
        </div>
        <p className="text-xs text-white/90 leading-relaxed font-medium italic">
          {`"${getMainExplanation()}"`}
        </p>
      </div>

      {/* Force Imbalance Indicators */}
      <div className="grid grid-cols-2 gap-3">
        <div className={cn("p-3 rounded-xl border transition-all",
          Math.abs(frontThrust - rearThrust) > 10 ? "bg-orange-500/10 border-orange-500/30" : "bg-white/5 border-white/10"
        )}>
          <span className="text-[9px] text-white/40 block mb-1 font-bold uppercase">Pitch (Dọc)</span>
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-white">
              {isPitchingForward ? "TIẾN" : isPitchingBackward ? "LÙI" : "CÂN BẰNG"}
            </span>
            <div className="flex flex-col gap-0.5">
              <div className={cn("w-1 h-2 rounded-full", isPitchingBackward ? "bg-orange-400" : "bg-white/10")} />
              <div className={cn("w-1 h-2 rounded-full", isPitchingForward ? "bg-orange-400" : "bg-white/10")} />
            </div>
          </div>
        </div>

        <div className={cn("p-3 rounded-xl border transition-all",
          Math.abs(leftThrust - rightThrust) > 10 ? "bg-blue-500/10 border-blue-500/30" : "bg-white/5 border-white/10"
        )}>
          <span className="text-[9px] text-white/40 block mb-1 font-bold uppercase">Roll (Ngang)</span>
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-white">
              {isRollingRight ? "PHẢI" : isRollingLeft ? "TRÁI" : "CÂN BẰNG"}
            </span>
            <div className="flex gap-0.5">
              <div className={cn("h-1 w-2 rounded-full", isRollingLeft ? "bg-blue-400" : "bg-white/10")} />
              <div className={cn("h-1 w-2 rounded-full", isRollingRight ? "bg-blue-400" : "bg-white/10")} />
            </div>
          </div>
        </div>
      </div>

      {/* Torque Indicator */}
      <div className={cn("p-3 rounded-xl border transition-all",
        Math.abs(cwThrust - ccwThrust) > 5 ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/10"
      )}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[9px] text-white/40 font-bold uppercase">Mô-men xoắn (Yaw)</span>
          <RefreshCcw className={cn("w-3 h-3", isYawingRight || isYawingLeft ? "text-purple-400 animate-spin" : "text-white/10")} />
        </div>
        <p className="text-[10px] text-white/70">
          {isYawingRight ? "Motor CCW thắng thế → Phản lực xoay drone sang phải" :
            isYawingLeft ? "Motor CW thắng thế → Phản lực xoay drone sang trái" :
              "Lực xoắn triệt tiêu lẫn nhau → Hướng mũi ổn định"}
        </p>
      </div>
    </div>
  );
}
