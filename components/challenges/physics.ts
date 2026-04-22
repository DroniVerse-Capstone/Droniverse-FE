/**
 * Quadcopter Physics Engine
 * 
 * CONTROL RULES:
 * - W = Forward (Rear stronger, Nose down, Pitch +)
 * - S = Backward (Front stronger, Nose up, Pitch -)
 * - A = Left (Right stronger, Tilt left, Roll -)
 * - D = Right (Left stronger, Tilt right, Roll +)
 * - Arrow Left = Rotate Left (CCW motors stronger)
 * - Arrow Right = Rotate Right (CW motors stronger)
 * 
 * MOTOR LAYOUT:
 * 1 = Front Left  (CW)
 * 2 = Front Right (CCW)
 * 3 = Rear Left   (CCW)
 * 4 = Rear Right  (CW)
 */

export interface MotorValues {
  m1: number; m2: number; m3: number; m4: number;
}

export interface ControlValues {
  throttle: number;
  pitch: number;
  roll: number;
  yaw: number;
}

export interface FlightState {
  positionX: number; positionZ: number; altitude: number;
  velocityX: number; velocityZ: number; verticalVelocity: number;
  roll: number; pitch: number; yaw: number; yawRate: number;
  thrust: number; stability: number; motors: MotorValues;
}

export interface ControlConfig {
  throttleSpeed: number;
  throttlePrecisionSpeed: number;
  throttleDecay: number;
  pitchSpeed: number;
  pitchDecay: number;
  pitchDeadZone: number;
  rollSpeed: number;
  rollDecay: number;
  rollDeadZone: number;
  yawSpeed: number;
  yawDecay: number;
  yawDeadZone: number;
  precisionMultiplier: number;
  precisionMaxVal: number;
}

// Convert keyboard input to control values
export function processKeyboardInput(
  keysPressed: Set<string>,
  currentControls: ControlValues,
  precisionMode: boolean,
  config: ControlConfig
): ControlValues {
  let throttle = currentControls.throttle;
  let pitch = currentControls.pitch;
  let roll = currentControls.roll;
  let yaw = currentControls.yaw;

  const speed = precisionMode ? config.throttlePrecisionSpeed : config.throttleSpeed;
  const multiplier = precisionMode ? config.precisionMultiplier : 1;
  const maxVal = precisionMode ? config.precisionMaxVal : 100;

  // Throttle: Arrow Up/Down
  if (keysPressed.has("arrowup")) {
    throttle = Math.min(maxVal, throttle + speed * 0.1);
  } else if (keysPressed.has("arrowdown")) {
    throttle = Math.max(0, throttle - speed * 0.1);
  } else {
    // Decay throttle when no input
    throttle *= config.throttleDecay;
    if (throttle < 0.5) throttle = 0;
  }

  // Pitch: W/S (forward/backward)
  if (keysPressed.has("w")) {
    pitch = Math.min(maxVal, pitch + config.pitchSpeed * multiplier * 0.1);
  } else if (keysPressed.has("s")) {
    pitch = Math.max(-maxVal, pitch - config.pitchSpeed * multiplier * 0.1);
  } else {
    pitch *= config.pitchDecay;
    if (Math.abs(pitch) < config.pitchDeadZone) pitch = 0;
  }

  // Roll: A/D (left/right)
  if (keysPressed.has("a")) {
    roll = Math.max(-maxVal, roll - config.rollSpeed * multiplier * 0.1);
  } else if (keysPressed.has("d")) {
    roll = Math.min(maxVal, roll + config.rollSpeed * multiplier * 0.1);
  } else {
    roll *= config.rollDecay;
    if (Math.abs(roll) < config.rollDeadZone) roll = 0;
  }

  // Yaw: Arrow Left/Right
  if (keysPressed.has("arrowleft")) {
    yaw = Math.max(-maxVal, yaw - config.yawSpeed * multiplier * 0.1);
  } else if (keysPressed.has("arrowright")) {
    yaw = Math.min(maxVal, yaw + config.yawSpeed * multiplier * 0.1);
  } else {
    yaw *= config.yawDecay;
    if (Math.abs(yaw) < config.yawDeadZone) yaw = 0;
  }

  return { throttle, pitch, roll, yaw };
}

const GRAVITY = 9.81;
const HOVER_THRUST = 50.0;
const MAX_VERTICAL_SPEED = 50.0; // Raw physics limit (allow freefall if engines die)
const MAX_ALTITUDE = 1000.0;  // 1000m ceiling   
const MAX_DISTANCE = 500.0;   // 1000x1000m flight zone
const AIR_DRAG_VERTICAL = 0.05;  // Pure aerodynamic drag (no artificial braking)
const AIR_DRAG_HORIZONTAL = 0.5;
const INERTIA_ROTATION = 0.18;

export function runFlightController(
  input: ControlValues,
  currentState: FlightState,
  dt: number
): MotorValues {
  // --- Hybrid Flight Controller (DJI Stability + FPV Acro Overrides) ---

  const IDLE_THROTTLE = 12;

  // 1. Calculate Base Throttle for Altitude Hold (Auto-Hover)
  const pRad = (currentState.pitch * Math.PI) / 180;
  const rRad = (currentState.roll * Math.PI) / 180;
  const cosTilt = Math.cos(pRad) * Math.cos(rRad);
  const hoverThrust = HOVER_THRUST / Math.max(0.5, cosTilt);

  let targetVV = 0;
  if (input.throttle > 55) {
    targetVV = ((input.throttle - 55) / 45) * 20.0; // Max climb: 20 m/s
  } else if (input.throttle < 45) {
    // Tụt ga hết cỡ -> Rơi xuống cực nhanh để tiết kiệm thời gian chờ (Max -25 m/s)
    targetVV = ((input.throttle - 45) / 45) * 25.0;

    // Cảm biến tiệm cận (Proximity Sensor): 
    // Nếu drone đang ở rất gần mặt đất (dưới 10m), tự động hãm phanh mục tiêu lại để tiếp đất êm ái
    if (currentState.altitude < 10.0) {
      const safeLandingSpeed = -3.0; // Tốc độ chạm đất an toàn
      // Càng gần đất, targetVV càng bị ép về mức an toàn
      targetVV = Math.max(targetVV, safeLandingSpeed + (targetVV - safeLandingSpeed) * (currentState.altitude / 10.0));
    }
  }

  const velocityError = targetVV - currentState.verticalVelocity;
  // Stronger P-gain (15.0) to aggressively brake and stop drifting when stick is released
  const pGain = 15.0;
  let baseThrottle = hoverThrust + (velocityError * pGain);

  // Direct Manual Overrides for "Realism" feel at the top extreme
  if (input.throttle > 95) {
    // Bấm kịch ga -> Động cơ bung hết mức 100%
    baseThrottle = 100;
  }

  // Motor cutoff when grounded completely
  if (input.throttle <= 5 && currentState.altitude < 0.2) {
    return { m1: 0, m2: 0, m3: 0, m4: 0 };
  }

  // 3. Angle P-Controller (Self-leveling)
  const pitchTarget = input.pitch * 0.45;
  const rollTarget = input.roll * 0.45;
  const yawTarget = input.yaw * 0.75;

  const gain = 1.2;
  const pCorr = (pitchTarget - currentState.pitch) * gain;
  const rCorr = (rollTarget - currentState.roll) * gain;

  // MIXER
  let t1 = + pCorr + rCorr - yawTarget; // Front Left
  let t2 = + pCorr - rCorr + yawTarget; // Front Right
  let t3 = - pCorr + rCorr + yawTarget; // Rear Left
  let t4 = - pCorr - rCorr - yawTarget; // Rear Right

  let m1 = baseThrottle + t1;
  let m2 = baseThrottle + t2;
  let m3 = baseThrottle + t3;
  let m4 = baseThrottle + t4;

  // AirMode Logic: Preserve attitude priority
  const maxM = Math.max(m1, m2, m3, m4);
  if (maxM > 100) {
    const overflow = maxM - 100;
    m1 -= overflow; m2 -= overflow; m3 -= overflow; m4 -= overflow;
  }

  const minM = Math.min(m1, m2, m3, m4);
  if (minM < IDLE_THROTTLE) {
    const underflow = IDLE_THROTTLE - minM;
    m1 += underflow; m2 += underflow; m3 += underflow; m4 += underflow;
  }

  // Final hard clamp
  return {
    m1: Math.max(IDLE_THROTTLE, Math.min(100, m1)),
    m2: Math.max(IDLE_THROTTLE, Math.min(100, m2)),
    m3: Math.max(IDLE_THROTTLE, Math.min(100, m3)),
    m4: Math.max(IDLE_THROTTLE, Math.min(100, m4)),
  };
}

export function updatePhysics(
  prevState: FlightState,
  motors: MotorValues,
  dt: number
): FlightState {
  const thrust = (motors.m1 + motors.m2 + motors.m3 + motors.m4) / 4;
  const liftForce = (thrust / HOVER_THRUST) * GRAVITY;

  // Tilt physics: Only the vertical component of the thrust fights gravity
  const pitchRad = (prevState.pitch * Math.PI) / 180;
  const rollRad = (prevState.roll * Math.PI) / 180;
  const cosTilt = Math.cos(pitchRad) * Math.cos(rollRad);
  const verticalLift = liftForce * cosTilt;

  const vAcc = verticalLift - GRAVITY - prevState.verticalVelocity * AIR_DRAG_VERTICAL;
  let nVV = prevState.verticalVelocity + vAcc * dt;
  nVV = Math.max(-MAX_VERTICAL_SPEED, Math.min(MAX_VERTICAL_SPEED, nVV));

  let nAlt = prevState.altitude + nVV * dt;

  // Ground collision stops vertical velocity
  if (nAlt <= 0) {
    nAlt = 0;
    nVV = 0;
  }
  nAlt = Math.min(MAX_ALTITUDE, nAlt);

  // pitch: M3/M4 (rear) stronger → nose tilts down → FORWARD (negative pitch)
  const tPitch = ((motors.m1 + motors.m2) - (motors.m3 + motors.m4)) * 0.45;
  // roll + = right: Left side (M1+M3) stronger → tilt right
  const tRoll = ((motors.m1 + motors.m3) - (motors.m2 + motors.m4)) * 0.45;
  // yaw: CW stronger (m1, m4) = rotate LEFT (positive yaw), CCW stronger (m2, m3) = rotate RIGHT (negative yaw)
  const tYawRate = ((motors.m1 + motors.m4) - (motors.m2 + motors.m3)) * 1.5;

  // Gravity restoring torque: When tilted, gravity pulls back toward level (like a pendulum)
  // This means motors must continuously fight gravity to hold any angle.
  // Without this, P-Controller reaches zero correction → M1 = M3 even in combined maneuvers.
  // With this, M3 must always push harder than M1 when both forward AND right are commanded.
  const gravityTorqueScale = 0.15;
  const pitchGravityTorque = -prevState.pitch * gravityTorqueScale; // pulls pitch back to 0
  const rollGravityTorque = -prevState.roll * gravityTorqueScale; // pulls roll back to 0

  const rotDamping = nAlt < 0.05 ? 0.02 : INERTIA_ROTATION;

  // Calculate new rotations with gravity restoring
  let nRoll = prevState.roll + (tRoll + rollGravityTorque - prevState.roll) * rotDamping;
  let nPitch = prevState.pitch + (tPitch + pitchGravityTorque - prevState.pitch) * rotDamping;
  const nYawRate = prevState.yawRate + (tYawRate - prevState.yawRate) * rotDamping;
  const nYaw = prevState.yaw + nYawRate * dt;

  // Clamp tilt angles for stability
  nRoll = Math.max(-35, Math.min(35, nRoll));
  nPitch = Math.max(-35, Math.min(35, nPitch));

  const pR = (nPitch * Math.PI) / 180;
  const rR = (nRoll * Math.PI) / 180;
  const yR = (nYaw * Math.PI) / 180;

  // Horizontal Acceleration
  // WORLD MAPPING (X+ is Left, Z+ is Forward)
  // Negative yaw = rotate left (CCW), Positive yaw = rotate right (CW)
  // Horizontal movement based on tilt
  const rRad = (prevState.roll * Math.PI) / 180;
  const pRad = (prevState.pitch * Math.PI) / 180;

  // Real drones have immense thrust-to-weight ratios. We multiply the horizontal component 
  // to simulate snappy, aggressive acceleration without needing extreme tilt angles.
  // Balanced to 5.0 for a fast but controllable simulation speed.
  const HORIZONTAL_THRUST_MULTIPLIER = 5.0;
  const accR = Math.sin(rRad) * liftForce * HORIZONTAL_THRUST_MULTIPLIER;  // D (+ roll) -> Positive Right
  const accF = -Math.sin(pRad) * liftForce * HORIZONTAL_THRUST_MULTIPLIER; // W (- pitch) -> Positive Forward

  // Yaw rotation (Positive yaw = CCW, standard math angle)
  const theta = (prevState.yaw * Math.PI) / 180;

  // World mapping (Forward is -Z, Right is +X)
  const hAccX = (accR * Math.cos(theta) - accF * Math.sin(theta)) - prevState.velocityX * AIR_DRAG_HORIZONTAL;
  const hAccZ = -(accR * Math.sin(theta) + accF * Math.cos(theta)) - prevState.velocityZ * AIR_DRAG_HORIZONTAL;

  let nVelX = prevState.velocityX + hAccX * dt;
  let nVelZ = prevState.velocityZ + hAccZ * dt;

  let nPosX = prevState.positionX + nVelX * dt;
  let nPosZ = prevState.positionZ + nVelZ * dt;

  // Horizontal Invisible Walls (bức tường)
  if (nPosX > MAX_DISTANCE) { nPosX = MAX_DISTANCE; nVelX = 0; }
  if (nPosX < -MAX_DISTANCE) { nPosX = -MAX_DISTANCE; nVelX = 0; }
  if (nPosZ > MAX_DISTANCE) { nPosZ = MAX_DISTANCE; nVelZ = 0; }
  if (nPosZ < -MAX_DISTANCE) { nPosZ = -MAX_DISTANCE; nVelZ = 0; }

  // Stability Metric (0-100)
  const stability = Math.max(0, 100 - (Math.abs(nRoll) + Math.abs(nPitch)) * 2.5);

  return {
    positionX: nPosX,
    positionZ: nPosZ,
    altitude: nAlt,
    velocityX: nVelX,
    velocityZ: nVelZ,
    verticalVelocity: nVV,
    roll: nRoll,
    pitch: nPitch,
    yaw: nYaw,
    yawRate: nYawRate,
    thrust: thrust,
    stability: stability,
    motors: motors
  };
}

export const INITIAL_STATE: FlightState = {
  positionX: 0, positionZ: 0, altitude: 0,
  velocityX: 0, velocityZ: 0, verticalVelocity: 0,
  roll: 0, pitch: 0, yaw: 0, yawRate: 0,
  thrust: 0, stability: 100,
  motors: { m1: 0, m2: 0, m3: 0, m4: 0 }
};

export const PRESETS = [
  { label: "Bay Cân Bằng", controls: { throttle: 50, pitch: 0, roll: 0, yaw: 0 }, description: "Drone đứng yên tại chỗ." },
  { label: "Bay Tới Trước", controls: { throttle: 58, pitch: 20, roll: 0, yaw: 0 }, description: "Mô phỏng động cơ sau đẩy mạnh." },
  { label: "Dạt Sang Phải", controls: { throttle: 55, pitch: 0, roll: 20, yaw: 0 }, description: "Mô phỏng động cơ trái đẩy mạnh." },
];
