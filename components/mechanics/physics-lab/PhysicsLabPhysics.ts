// ─── PHYSICS LAB ENGINE ──────────────────────────────────────────────────────
export const MASS = 1.38;
export const GRAVITY = 9.81;
export const MAX_THRUST = 27.1;

export interface LabControls {
  throttle: number; // 0–100
  pitch: number;    // -100 to 100
  roll: number;     // -100 to 100
  yaw: number;      // -100 to 100
}

export interface MotorPowers {
  fl: number; fr: number; rl: number; rr: number; // fl=M1, fr=M2, rl=M3, rr=M4
}

export interface LabPhysicsState {
  posX: number; posZ: number;
  velX: number; velZ: number;
  altitude: number; verticalVel: number;
  pitch: number; roll: number; yaw: number; yawRate: number;
  totalThrust: number; gravityForce: number; netVertical: number;
  forwardForce: number; sideForce: number;
  stability: number;
  motors: MotorPowers;
}

export const INITIAL_CONTROLS: LabControls = { throttle: 0, pitch: 0, roll: 0, yaw: 0 };

export const INITIAL_STATE: LabPhysicsState = {
  posX: 0, posZ: 0,
  velX: 0, velZ: 0,
  altitude: 0, verticalVel: 0,
  pitch: 0, roll: 0, yaw: 0, yawRate: 0,
  totalThrust: 0, gravityForce: MASS * GRAVITY,
  netVertical: -(MASS * GRAVITY),
  forwardForce: 0, sideForce: 0,
  stability: 100,
  motors: { fl: 15, fr: 15, rl: 15, rr: 15 },
};

function computeMotors(ctrl: LabControls, state: LabPhysicsState): MotorPowers {
  const base = ctrl.throttle;
  const pCorr = ctrl.pitch * 0.55;
  const rCorr = ctrl.roll * 0.55;
  const yCorr = ctrl.yaw * 0.45;

  const clamp = (v: number) => Math.max(15, Math.min(100, v));

  // Motor Mixing - Standard X-config
  // W = pitch+ -> rear motors stronger -> nose DOWN -> move FORWARD (+Z)
  // S = pitch- -> front motors stronger -> nose UP -> move BACKWARD (-Z)
  // D = roll+ -> LEFT motors stronger -> tilt RIGHT on screen -> drift RIGHT (+X)
  // A = roll- -> RIGHT motors stronger -> tilt LEFT on screen -> drift LEFT (-X)
  // Arrow Right = yaw+ -> CW spin -> drone yaws RIGHT
  return {
    fl: clamp(base - pCorr + rCorr - yCorr), // m1: front-left
    fr: clamp(base - pCorr - rCorr + yCorr), // m2: front-right
    rl: clamp(base + pCorr + rCorr + yCorr), // m3: rear-left
    rr: clamp(base + pCorr - rCorr - yCorr), // m4: rear-right
  };
}

export function stepPhysics(prev: LabPhysicsState, ctrl: LabControls, dt: number): LabPhysicsState {
  const motors = computeMotors(ctrl, prev);
  const avg = (motors.fl + motors.fr + motors.rl + motors.rr) / 4;
  const rawThrust = (avg / 100) * MAX_THRUST;

  const pitchRad = (prev.pitch * Math.PI) / 180;
  const rollRad = (prev.roll * Math.PI) / 180;
  const cosTilt = Math.cos(pitchRad) * Math.cos(rollRad);

  const vertThrust = rawThrust * cosTilt;
  const gravityForce = MASS * GRAVITY;
  const netVertical = vertThrust - gravityForce;

  const vertAcc = netVertical / MASS - prev.verticalVel * 0.45;
  let newVV = Math.max(-8, Math.min(8, prev.verticalVel + vertAcc * dt));
  let newAlt = prev.altitude + newVV * dt;

  if (ctrl.throttle < 5 || newAlt <= 0) {
    newAlt = 0;
    newVV = Math.max(0, newVV);
  }
  newAlt = Math.min(500, newAlt);

  // Horizontal Movement Integration (Rotated by Yaw)
  // Roll: right motors stronger -> tilt right -> drift right
  const forwardForce = rawThrust * Math.sin(pitchRad);
  const sideForce = rawThrust * Math.sin(rollRad);

  const yawRad = (prev.yaw * Math.PI) / 180;
  const cosY = Math.cos(yawRad);
  const sinY = Math.sin(yawRad);

  // Rotate local forces to global movement
  // +roll = right stronger = tilt right = drift right (+X in screen space)
  const moveX = sideForce * cosY + forwardForce * sinY;
  const moveZ = forwardForce * cosY - sideForce * sinY;

  const accX = moveX / MASS;
  const accZ = moveZ / MASS;

  const drag = 0.97;
  let newVelX = (prev.velX + accX * dt) * drag;
  let newVelZ = (prev.velZ + accZ * dt) * drag;

  let newPosX = prev.posX + newVelX * dt;
  let newPosZ = prev.posZ + newVelZ * dt;

  // Imbalance calculation for tilt
  // When right motors stronger (fr, rr) -> tilt RIGHT on screen -> drift RIGHT (+X)
  // Positive tRoll = right motors stronger = right side down = tilt right
  const tPitch = ((motors.rl + motors.rr) - (motors.fl + motors.fr)) * 0.40;
  const tRoll = ((motors.fr + motors.rr) - (motors.fl + motors.rl)) * 0.40;
  const tYaw = ((motors.fl ** 2 + motors.rr ** 2) - (motors.fr ** 2 + motors.rl ** 2)) * 0.012;

  const damp = newAlt < 0.05 ? 0.04 : 0.18;
  let newPitch = prev.pitch + (tPitch - prev.pitch) * damp;
  let newRoll = prev.roll + (tRoll - prev.roll) * damp;
  const newYawRate = prev.yawRate + (tYaw - prev.yawRate) * damp;
  const newYaw = prev.yaw + newYawRate * dt;

  newPitch = Math.max(-35, Math.min(35, newPitch));
  newRoll = Math.max(-35, Math.min(35, newRoll));

  return {
    posX: newPosX, posZ: newPosZ,
    velX: newVelX, velZ: newVelZ,
    altitude: newAlt,
    verticalVel: newVV,
    pitch: newPitch,
    roll: newRoll,
    yaw: newYaw,
    yawRate: newYawRate,
    totalThrust: rawThrust,
    gravityForce,
    netVertical,
    forwardForce,
    sideForce,
    stability: Math.max(0, 100 - (Math.abs(newPitch) + Math.abs(newRoll)) * 1.8),
    motors,
  };
}

// ─── LESSON SYSTEM ───────────────────────────────────────────────────────────
export interface LessonStep {
  instruction: string;
  explain: string;
  objective?: string;
  done?: (s: LabPhysicsState, c: LabControls) => boolean;
}

export interface TelemetryKey {
  label: string;
  getValue: (s: LabPhysicsState) => string;
  unit: string;
  color: string;
  isAdvanced?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  emoji: string;
  tagline: string;
  summary: string;
  steps: LessonStep[];
  controls: LabControls;
  focusArrow: "thrust" | "gravity" | "forward" | "side" | "yaw" | "all" | "none";
  telemetry: TelemetryKey[];
  color: string;
}

export const LESSONS: Lesson[] = [
  {
    id: "thrust",
    title: "Lực Nâng vs Trọng Lực",
    emoji: "🚀",
    tagline: "Lực nào giúp Drone cất cánh?",
    summary: "Học về sự cân bằng giữa Thrust (Lực nâng) và Gravity (Trọng lực).",
    color: "cyan",
    focusArrow: "thrust",
    controls: { throttle: 0, pitch: 0, roll: 0, yaw: 0 },
    telemetry: [
      { label: "Lực Nâng", getValue: s => s.totalThrust.toFixed(0), unit: "N", color: "text-cyan-400" },
      { label: "Trọng Lực", getValue: () => (MASS * GRAVITY).toFixed(0), unit: "N", color: "text-red-400" },
      { label: "Độ Cao", getValue: s => s.altitude.toFixed(1), unit: "m", color: "text-white" },
    ],
    steps: [
      { objective: "Cất cánh", instruction: "Kéo Throttle lên 60%", explain: "Thrust > Gravity tạo ra lực dư dương, nhấc drone lên khỏi mặt đất." },
      { objective: "Lơ lửng", instruction: "Giữ Throttle khoảng 51%", explain: "Khi Thrust = Gravity, drone đạt trạng thái Hover.", done: s => s.altitude > 0.5 && Math.abs(s.verticalVel) < 0.2 },
    ],
  },
  {
    id: "pitch",
    title: "Pitch – Bay Tiến",
    emoji: "🎯",
    tagline: "Làm sao để bay về phía trước?",
    summary: "Khám phá cách thay đổi tốc độ động cơ để tạo độ nghiêng và lực tiến.",
    color: "blue",
    focusArrow: "forward",
    controls: { throttle: 55, pitch: 0, roll: 0, yaw: 0 },
    telemetry: [
      { label: "Góc Pitch", getValue: s => s.pitch.toFixed(0), unit: "°", color: "text-blue-400" },
      { label: "Lực Tiến", getValue: s => Math.abs(s.forwardForce).toFixed(0), unit: "N", color: "text-emerald-400" },
      { label: "Mũi vs Đuôi", getValue: s => (s.motors.fl - s.motors.rl).toFixed(0), unit: "Δ%", color: "text-white" },
    ],
    steps: [
      { objective: "Nghiêng mũi", instruction: "Đẩy Pitch lên (W key)", explain: "M1+M2 mạnh hơn M3+M4 -> đẩy đuôi lên -> chúi mũi xuống." },
      { objective: "Tạo lực tiến", instruction: "Giữ Pitch dương", explain: "Khi drone nghiêng, lực nâng được chuyển hóa thành lực đẩy ngang.", done: s => s.pitch > 10 },
    ],
  },
  {
    id: "roll",
    title: "Roll – Dạt Ngang",
    emoji: "↔️",
    tagline: "Di chuyển sang hai bên",
    summary: "Cách drone dạt ngang bằng cách tạo chênh lệch lực đẩy giữa bên trái và bên phải.",
    color: "orange",
    focusArrow: "side",
    controls: { throttle: 55, pitch: 0, roll: 0, yaw: 0 },
    telemetry: [
      { label: "Góc Roll", getValue: s => s.roll.toFixed(0), unit: "°", color: "text-orange-400" },
      { label: "Lực Ngang", getValue: s => Math.abs(s.sideForce).toFixed(0), unit: "N", color: "text-amber-400" },
    ],
    steps: [
      { objective: "Nghiêng phải", instruction: "Đẩy Roll sang phải (D key)", explain: "Các motor bên phải mạnh hơn bên trái -> drone nghiêng sang phải trên màn hình." },
      { objective: "Dạt ngang", instruction: "Duy trì góc Roll dương", explain: "Góc nghiêng càng lớn, lực dạt ngang càng mạnh -> drone dạt sang phải.", done: s => s.roll > 15 },
    ],
  },
  {
    id: "yaw",
    title: "Yaw – Xoay Mũi",
    emoji: "🔄",
    tagline: "Đổi hướng nhìn tại chỗ",
    summary: "Học về mô-men xoắn phản lực và cách nó làm drone xoay.",
    color: "purple",
    focusArrow: "yaw",
    controls: { throttle: 52, pitch: 0, roll: 0, yaw: 0 },
    telemetry: [
      { label: "Góc Yaw", getValue: s => s.yaw.toFixed(0), unit: "°", color: "text-purple-400" },
      { label: "Tốc độ xoay", getValue: s => s.yawRate.toFixed(0), unit: "°/s", color: "text-purple-300" },
    ],
    steps: [
      { objective: "Xoay phải", instruction: "Đẩy Yaw sang phải (→)", explain: "Tăng tốc cặp CCW (M2, M3) tạo mô-men xoắn CW làm drone xoay phải." },
      { objective: "Bảo toàn năng lượng", instruction: "Quan sát tổng lực nâng", explain: "Tổng công suất không đổi để drone không bị bay lên khi xoay.", done: s => Math.abs(s.yawRate) > 10 },
    ],
  },
  {
    id: "mixing",
    title: "Phối Hợp Động Cơ",
    emoji: "⚙️",
    tagline: "Tổng hợp các lực phức tạp",
    summary: "Xem cách các lệnh điều khiển cộng hưởng hoặc triệt tiêu nhau trên từng motor.",
    color: "white",
    focusArrow: "all",
    controls: { throttle: 55, pitch: 40, roll: 40, yaw: 0 },
    telemetry: [
      { label: "M1 FL", getValue: s => s.motors.fl.toFixed(0), unit: "%", color: "text-blue-400" },
      { label: "M2 FR", getValue: s => s.motors.fr.toFixed(0), unit: "%", color: "text-blue-400" },
      { label: "M3 RL", getValue: s => s.motors.rl.toFixed(0), unit: "N", color: "text-emerald-400" },
    ],
    steps: [
      { objective: "Tiến + Phải", instruction: "Nhấn W + D", explain: "M1 (Front-Left) nhận cả lệnh 'Tăng mũi' và 'Tăng bên trái' -> mạnh nhất." },
      { objective: "Quan sát Mixing", instruction: "Thử các tổ hợp khác", explain: "Flight Controller phối hợp 4 motor để đạt được hướng bay mong muốn." },
    ],
  },
];
