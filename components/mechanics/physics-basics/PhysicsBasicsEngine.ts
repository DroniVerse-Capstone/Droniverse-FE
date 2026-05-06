"use client";

import * as THREE from "three";

export type LessonId =
  | "lift" | "roll" | "pitch" | "yaw"
  | "equilibrium" | "drag" | "wind" | "weight"
  | "stabilization" | "battery";

export interface PhysicsState {
  // Common
  posX: number;
  posY: number;
  posZ: number;
  pitch: number;
  roll: number;
  yaw: number;
  velX: number;
  velY: number;
  velZ: number;

  // Lesson specific inputs
  thrust: number; // 0-100
  leftPower: number; // 0-100 (legacy, for pitch)
  rightPower: number; // 0-100 (legacy, for pitch)
  frontPower: number; // 0-100
  rearPower: number; // 0-100

  // ─── EXPERIMENT 02: ROLL (RPM-based) ───
  leftRPM: number; // 3000-9000 RPM for left motor
  rightRPM: number; // 3000-9000 RPM for right motor

  yawForce: number; // -100 to 100

  // Individual Motor Power (for Yaw experiment)
  motorFL: number; // Front Left - quay CW
  motorFR: number; // Front Right - quay CCW
  motorRL: number; // Rear Left - quay CCW
  motorRR: number; // Rear Right - quay CW

  // Real Physics & Smart Systems
  windForce: number; // 0-100
  dragCoeff: number; // 0-1
  weightOffset: number; // -1 to 1 (shifting CoM)
  isStabilized: boolean;
  batteryLevel: number; // 0-100

  // Simulation control
  isRunning: boolean;

  // ─── EXPERIMENT 01: REAL PHYSICS DATA (Lift vs Gravity) ───
  // These are calculated/display values for educational purposes
  rpm: number;              // Motor RPM (0-9000)
  liftForce: number;        // Calculated lift force in Newtons
  weightForce: number;      // Constant weight force in Newtons (mass × gravity)
  netForce: number;         // Lift - Weight
  verticalAccel: number;    // Vertical acceleration in m/s²
  droneState: "grounded" | "hovering" | "ascending" | "descending" | "stabilizing";
  timeInHoverZone: number;  // Time spent in hover zone (for smooth transitions)

  // ─── EXPERIMENT 02: ROLL DATA ───
  tiltAngle: number;        // Calculated tilt angle in degrees (-20 to +20)
  sideForce: number;        // Horizontal force from tilt (Newtons)
  rpmDifference: number;    // Left RPM - Right RPM

  // ─── EXPERIMENT 03: PITCH DATA ───
  pitchAngle: number;       // Calculated pitch angle in degrees
  forwardForce: number;     // Forward force from pitch (Newtons)
  frontRPM: number;         // Front motor RPM
  rearRPM: number;          // Rear motor RPM

  // ─── EXPERIMENT 04: YAW DATA ───
  yawTorque: number;        // Net torque causing yaw rotation
  cwTorque: number;         // Clockwise torque
  ccwTorque: number;        // Counter-clockwise torque
  motorFL_RPM: number;      // Front Left motor RPM
  motorFR_RPM: number;      // Front Right motor RPM
  motorRL_RPM: number;      // Rear Left motor RPM
  motorRR_RPM: number;      // Rear Right motor RPM

  // ─── EXPERIMENT 05: WIND DATA ───
  windForceN: number;       // Wind force in Newtons
  dragForceN: number;        // Drag force in Newtons

  // ─── EXPERIMENT 06: WEIGHT DATA ───
  comOffset: number;        // Center of mass offset
  torqueFromWeight: number; // Torque from weight offset

  // ─── EXPERIMENT 07: BATTERY DATA ───
  voltage: number;          // Battery voltage
  effectiveRPM: number;     // RPM after voltage drop
}

// ─── PHYSICS CONSTANTS FOR EXPERIMENT 01 ───────────────────────────────────
export const DRONE_MASS_KG = 1.38;           // Drone mass in kilograms
export const GRAVITY_MS2 = 9.81;              // Gravitational acceleration (m/s²)
export const WEIGHT_FORCE_N = DRONE_MASS_KG * GRAVITY_MS2; // = 13.54 N

// Thrust coefficient: F = K × RPM²
// At 6200 RPM: thrust = K × 6200² = 13.54 N  →  K = 13.54 / 38,440,000
const HOVER_RPM = 6200;
export const THRUST_K = WEIGHT_FORCE_N / (HOVER_RPM * HOVER_RPM); // ≈ 3.52 × 10⁻⁷

// ─── HOVER ZONE CONSTANTS ──────────────────────────────────────────────────
// Stable hover zone: drone stays balanced in this RPM range
export const HOVER_ZONE_MIN = 5800;  // Below this: descending
export const HOVER_ZONE_MAX = 6600;  // Above this: ascending

// ─── ROLL EXPERIMENT CONSTANTS ──────────────────────────────────────────────
export const ROLL_RPM_MIN = 3000;      // Minimum RPM for roll experiment
export const ROLL_RPM_MAX = 9000;      // Maximum RPM for roll experiment
export const ROLL_RPM_DEFAULT = 6000;   // Default/hover RPM
export const TILT_SENSITIVITY = 150;    // RPM difference per degree of tilt
export const MAX_TILT_ANGLE = 20;       // Maximum tilt angle in degrees
export const LIFT_COEFFICIENT = 0.35;  // How much tilt generates horizontal force (increased for visible drift)
export const ROLL_VELOCITY_MULTIPLIER = 2.5; // Increased from 0.5 to make drift more visible
export const ROLL_BASE_HEIGHT = 2.5;          // Default height when starting roll experiment

// ─── PITCH EXPERIMENT CONSTANTS ────────────────────────────────────────────
export const PITCH_BASE_HEIGHT = 2.5;   // Default height for pitch experiment
export const PITCH_POWER_DEFAULT = 6200; // Default RPM for both front/rear (hover RPM)

// ─── YAW EXPERIMENT CONSTANTS ──────────────────────────────────────────────
export const MOTOR_POWER_DEFAULT = 60;  // Default individual motor power
export const YAW_SENSITIVITY = 0.8;     // How much power difference creates yaw

// ─── WIND EXPERIMENT CONSTANTS ─────────────────────────────────────────────
export const DRONE_DRAG_AREA = 0.05;    // Drone frontal area in m²
export const AIR_DENSITY = 1.225;       // kg/m³ at sea level
export const WIND_FORCE_COEFFICIENT = 0.0005; // Convert wind speed to force

// ─── WEIGHT EXPERIMENT CONSTANTS ───────────────────────────────────────────
export const WEIGHT_MASS_KG = 0.5;      // Added weight mass in kg
export const WEIGHT_TORQUE_ARM = 0.15;   // Distance from center in meters
export const GRAVITY_TORQUE_FACTOR = 0.5; // How weight offset creates roll torque

// ─── BATTERY EXPERIMENT CONSTANTS ─────────────────────────────────────────
export const BATTERY_NOMINAL_VOLTAGE = 22.2;  // 6S LiPo nominal voltage
export const BATTERY_MAX_VOLTAGE = 25.2;       // Full charge (4.2V per cell)
export const BATTERY_MIN_VOLTAGE = 18.0;       // Cutoff voltage (3.0V per cell)
export const BATTERY_INTERNAL_RESISTANCE = 0.02; // Ohms per cell

// ─── AERODYNAMICS CONSTANTS ────────────────────────────────────────────────
export const DRAG_COEFFICIENT = 1.0; // Drag coefficient for drone shape

// General physics behavior constants
export const VELOCITY_DAMPING = 0.98;        // Velocity damping each frame (inertia)
export const ACCEL_LERP_SPEED = 2.0;        // Smooth acceleration interpolation
export const HOVER_VELOCITY_THRESHOLD = 0.05; // Velocity threshold for true hover (m/s)
export const HOVER_STABILIZATION_TIME = 0.5;  // Seconds to stabilize before true hover

export function calculateLiftForce(rpm: number): number {
  // Lift force grows with RPM squared: F = K × RPM²
  return THRUST_K * rpm * rpm;
}

export function getRPMFromThrust(thrustPercent: number): number {
  // Convert 0-100 thrust percentage to RPM (0-9000)
  // At thrust=50%, we want 6200 RPM for hover
  return (thrustPercent / 50) * HOVER_RPM;
}

export function getThrustFromRPM(rpm: number): number {
  // Convert RPM back to thrust percentage for compatibility
  return (rpm / HOVER_RPM) * 50;
}

// ─── DRONE STATE DETERMINATION ─────────────────────────────────────────────
export function determineDroneState(
  rpm: number,
  altitude: number,
  velocity: number,
  timeInHoverZone: number,
  isInHoverZone: boolean
): "grounded" | "stabilizing" | "hovering" | "ascending" | "descending" {
  // Grounded: on ground
  if (altitude === 0 && Math.abs(velocity) < 0.01) {
    return "grounded";
  }

  // Check hover zone first
  if (isInHoverZone) {
    // Only true "hovering" when velocity is very low AND been in zone long enough
    if (Math.abs(velocity) < HOVER_VELOCITY_THRESHOLD && timeInHoverZone > HOVER_STABILIZATION_TIME) {
      return "hovering";
    }
    // Otherwise, still stabilizing in hover zone
    return "stabilizing";
  }

  // Below hover zone: descending or grounded
  if (rpm < HOVER_ZONE_MIN) {
    return "descending";
  }

  // Above hover zone: ascending
  return "ascending";
}

export const INITIAL_STATE: PhysicsState = {
  posX: 0, posY: 0, posZ: 0,
  pitch: 0, roll: 0, yaw: 0,
  velX: 0, velY: 0, velZ: 0,
  thrust: 0, // Start at 0 RPM for Experiment 01 - user must drag to take off
  leftPower: 50, rightPower: 50,
  frontPower: 50, rearPower: 50,
  yawForce: 0,
  motorFL: 60, motorFR: 60, motorRL: 60, motorRR: 60, // Individual motor power
  windForce: 0,
  dragCoeff: 1.5, // Increased for stability
  weightOffset: 0,
  isStabilized: false,
  batteryLevel: 100,
  isRunning: false,

  // Experiment 01 calculated values
  rpm: getRPMFromThrust(0),                    // 0 RPM at 0% thrust - drone grounded
  liftForce: calculateLiftForce(getRPMFromThrust(0)), // 0 N when starting
  weightForce: WEIGHT_FORCE_N,                  // ~13.54 N
  netForce: -WEIGHT_FORCE_N,                   // Negative = grounded
  verticalAccel: 0,
  droneState: "grounded",
  timeInHoverZone: 0,  // Track time spent in hover zone for smooth transitions

  // Experiment 02: Roll
  leftRPM: ROLL_RPM_DEFAULT,
  rightRPM: ROLL_RPM_DEFAULT,
  tiltAngle: 0,
  sideForce: 0,
  rpmDifference: 0,

  // Experiment 03: Pitch
  pitchAngle: 0,
  forwardForce: 0,
  frontRPM: 6200,  // Hover RPM
  rearRPM: 6200,   // Hover RPM

  // Experiment 04: Yaw
  yawTorque: 0,
  cwTorque: 0,
  ccwTorque: 0,
  motorFL_RPM: 5400,
  motorFR_RPM: 5400,
  motorRL_RPM: 5400,
  motorRR_RPM: 5400,

  // Experiment 05: Wind
  windForceN: 0,
  dragForceN: 0,

  // Experiment 06: Weight
  comOffset: 0,
  torqueFromWeight: 0,

  // Experiment 07: Battery
  voltage: 22.2, // 6S LiPo nominal voltage
  effectiveRPM: 0,
};

export function updatePhysics(state: PhysicsState, lessonId: LessonId, delta: number): PhysicsState {
  if (!state.isRunning) {
    // Even when not running, calculate the physics values for display
    const rpm = getRPMFromThrust(state.thrust);
    const liftForce = calculateLiftForce(rpm);
    const netForce = liftForce - WEIGHT_FORCE_N;
    const verticalAccel = netForce / DRONE_MASS_KG;

    return {
      ...state,
      rpm,
      liftForce,
      netForce,
      verticalAccel,
      droneState: determineDroneState(rpm, state.posY, state.velY, state.timeInHoverZone, rpm >= HOVER_ZONE_MIN && rpm <= HOVER_ZONE_MAX),
    };
  }

  const newState = { ...state };
  const batteryScale = state.batteryLevel / 100;

  // ─── EXPERIMENT 01: REAL PHYSICS MODEL WITH SMOOTH HOVER ─────────────────
  // if (lessonId === "lift" || lessonId === "equilibrium" || lessonId === "battery" || lessonId === "drag") {
  if (lessonId === "lift" || lessonId === "equilibrium" || lessonId === "drag") {

    // Calculate RPM from thrust percentage 
    const rpm = getRPMFromThrust(state.thrust) * batteryScale;

    const liftForce = calculateLiftForce(rpm);

    const isInHoverZone = rpm >= HOVER_ZONE_MIN && rpm <= HOVER_ZONE_MAX;

    const netForce = liftForce - WEIGHT_FORCE_N;

    let timeInHoverZone = isInHoverZone ? state.timeInHoverZone + delta : 0;
    const targetAccel = netForce / DRONE_MASS_KG;

    if (isInHoverZone) {
      newState.verticalAccel = THREE.MathUtils.lerp(
        state.verticalAccel,
        0,
        delta * ACCEL_LERP_SPEED
      );

      newState.velY *= VELOCITY_DAMPING;

      if (Math.abs(newState.velY) < 0.01) {
        newState.velY = 0;
      }
    } else {
      newState.verticalAccel = THREE.MathUtils.lerp(
        state.verticalAccel,
        targetAccel,
        delta * ACCEL_LERP_SPEED
      );

      newState.velY += newState.verticalAccel * delta;

      newState.velY *= (1 - state.dragCoeff * delta * 0.1);
    }
    newState.posY += newState.velY * delta;

    if (newState.posY <= 0) {
      newState.posY = 0;
      newState.velY = 0;
      newState.verticalAccel = 0;
      timeInHoverZone = 0;
    }

    newState.rpm = rpm;
    newState.liftForce = liftForce;
    newState.weightForce = WEIGHT_FORCE_N;
    newState.netForce = netForce;
    newState.timeInHoverZone = timeInHoverZone;
    newState.droneState = determineDroneState(rpm, newState.posY, newState.velY, timeInHoverZone, isInHoverZone);
  }

  else {
    const gravity = 50;

    newState.velX *= (1 - state.dragCoeff * delta);
    newState.velZ *= (1 - state.dragCoeff * delta);

    switch (lessonId) {
      case "roll": {
        const rpmDiff = state.leftRPM - state.rightRPM;
        newState.rpmDifference = rpmDiff;
        const targetTilt = THREE.MathUtils.clamp(rpmDiff / TILT_SENSITIVITY, -MAX_TILT_ANGLE, MAX_TILT_ANGLE);
        newState.tiltAngle = targetTilt;

        newState.roll = THREE.MathUtils.lerp(state.roll, targetTilt, delta * 4);

        const leftLift = calculateLiftForce(state.leftRPM);
        const rightLift = calculateLiftForce(state.rightRPM);
        const avgLift = (leftLift + rightLift) / 2;

        const isAboveHover = avgLift >= WEIGHT_FORCE_N * 0.9;
        const tiltRadians = (newState.roll * Math.PI) / 180;

        const horizontalForce = avgLift * Math.sin(tiltRadians) * LIFT_COEFFICIENT;

        newState.sideForce = horizontalForce;
        newState.liftForce = avgLift;
        newState.weightForce = WEIGHT_FORCE_N;

        newState.velX += horizontalForce * delta * ROLL_VELOCITY_MULTIPLIER;

        if (isAboveHover) {
          const heightTarget = ROLL_BASE_HEIGHT;
          const heightDiff = heightTarget - newState.posY;

          if (Math.abs(heightDiff) < 0.05) {
            newState.posY = heightTarget;
            newState.velY = 0;
          } else {
            newState.velY += heightDiff * delta * 4;
          }
        } else {
          const netVerticalForce = avgLift - WEIGHT_FORCE_N;
          newState.velY += netVerticalForce / DRONE_MASS_KG * delta * 0.1;
        }

        if (newState.posY > ROLL_BASE_HEIGHT + 0.5) {
          newState.posY = ROLL_BASE_HEIGHT + 0.5;
          newState.velY = Math.min(0, newState.velY);
        }
        if (newState.posY < 1.0) {
          newState.posY = 1.0;
          newState.velY = Math.max(0, newState.velY);
        }
        break;
      }
      case "pitch": {
        const frontRPM = state.frontRPM;
        const rearRPM = state.rearRPM;

        const rpmDiffPitch = (frontRPM - rearRPM) / 100;
        const targetPitch = THREE.MathUtils.clamp(rpmDiffPitch, -MAX_TILT_ANGLE, MAX_TILT_ANGLE);
        newState.pitch = THREE.MathUtils.lerp(state.pitch, targetPitch, delta * 4);

        const frontLift = calculateLiftForce(frontRPM);
        const rearLift = calculateLiftForce(rearRPM);
        const avgLiftPitch = (frontLift + rearLift) / 2;

        const isAboveHoverPitch = avgLiftPitch >= WEIGHT_FORCE_N * 0.9;

        const pitchRadians = (newState.pitch * Math.PI) / 180;
        const forwardForce = avgLiftPitch * Math.sin(pitchRadians) * LIFT_COEFFICIENT;

        newState.velZ += forwardForce * delta * ROLL_VELOCITY_MULTIPLIER;

        if (isAboveHoverPitch) {
          const heightTarget = ROLL_BASE_HEIGHT;
          const heightDiff = heightTarget - newState.posY;

          if (Math.abs(heightDiff) < 0.05) {
            newState.posY = heightTarget;
            newState.velY = 0;
          } else {
            newState.velY += heightDiff * delta * 4;
          }
        } else {
          const netVerticalForce = avgLiftPitch - WEIGHT_FORCE_N;
          newState.velY += netVerticalForce / DRONE_MASS_KG * delta * 0.1;
        }

        // Clamp height
        if (newState.posY > ROLL_BASE_HEIGHT + 0.5) {
          newState.posY = ROLL_BASE_HEIGHT + 0.5;
          newState.velY = Math.min(0, newState.velY);
        }
        if (newState.posY < 1.0) {
          newState.posY = 1.0;
          newState.velY = Math.max(0, newState.velY);
        }

        // Store values for display
        newState.liftForce = avgLiftPitch;
        newState.sideForce = forwardForce;
        break;
      }
      case "yaw": {
        const motorFL_RPM = state.motorFL_RPM;
        const motorFR_RPM = state.motorFR_RPM;
        const motorRL_RPM = state.motorRL_RPM;
        const motorRR_RPM = state.motorRR_RPM;

        // CW torque (FR, RL motors)
        const cwTorque = calculateLiftForce(motorFR_RPM) + calculateLiftForce(motorRL_RPM);
        // CCW torque (FL, RR motors)
        const ccwTorque = calculateLiftForce(motorFL_RPM) + calculateLiftForce(motorRR_RPM);

        // Net yaw torque: CW motors (FR, RL) create CCW torque (+), CCW motors (FL, RR) create CW torque (-)
        const netYawTorque = (cwTorque - ccwTorque) * YAW_SENSITIVITY;

        // Apply yaw rotation (multiplier increased from 0.01 to 5.0 for visibility)
        newState.yaw += netYawTorque * delta * 5.0;

        // Store values for display
        newState.cwTorque = cwTorque;
        newState.ccwTorque = ccwTorque;
        newState.yawTorque = netYawTorque;
        newState.motorFL_RPM = motorFL_RPM;
        newState.motorFR_RPM = motorFR_RPM;
        newState.motorRL_RPM = motorRL_RPM;
        newState.motorRR_RPM = motorRR_RPM;

        // Calculate total lift for maintaining height
        const totalLift = cwTorque + ccwTorque;
        const avgLiftYaw = totalLift / 4;

        // Maintain altitude
        if (avgLiftYaw >= WEIGHT_FORCE_N * 0.9) {
          newState.velY = 0;
          newState.posY = ROLL_BASE_HEIGHT;
        }

        break;
      }
      case "wind": {
        const windSpeed = state.windForce / 100 * 10;
        const windForceN = 0.5 * AIR_DENSITY * windSpeed * windSpeed * DRAG_COEFFICIENT * DRONE_DRAG_AREA;

        newState.velX += windForceN * delta * 0.5;

        const velMag = Math.sqrt(newState.velX * newState.velX + newState.velZ * newState.velZ);
        const dragForceN = 0.5 * AIR_DENSITY * velMag * velMag * state.dragCoeff * DRONE_DRAG_AREA;

        if (velMag > 0.01) {
          const dragDecel = dragForceN / DRONE_MASS_KG;
          newState.velX -= (newState.velX / velMag) * dragDecel * delta;
          newState.velZ -= (newState.velZ / velMag) * dragDecel * delta;
        }

        // Store values for display
        newState.windForceN = windForceN;
        newState.dragForceN = dragForceN;

        // Maintain altitude with base thrust
        const baseLift = 6200 * 6200 * THRUST_K; // Hover RPM lift
        if (baseLift >= WEIGHT_FORCE_N) {
          newState.velY = 0;
          newState.posY = ROLL_BASE_HEIGHT;
        }

        break;
      }
      case "weight": {

        const weightOffset = state.weightOffset;

        const torqueFromWeight = WEIGHT_MASS_KG * GRAVITY_MS2 * weightOffset * WEIGHT_TORQUE_ARM * GRAVITY_TORQUE_FACTOR;

        const targetRollFromWeight = THREE.MathUtils.clamp(torqueFromWeight * 3, -MAX_TILT_ANGLE, MAX_TILT_ANGLE);

        newState.roll = THREE.MathUtils.lerp(state.roll, targetRollFromWeight, delta * 4);

        const weightRollRadians = (newState.roll * Math.PI) / 180;
        const baseLiftWeight = 6200 * 6200 * THRUST_K;
        const horizontalForceWeight = baseLiftWeight * Math.sin(weightRollRadians) * LIFT_COEFFICIENT;

        newState.velX += horizontalForceWeight * delta * ROLL_VELOCITY_MULTIPLIER;

        newState.comOffset = weightOffset;
        newState.torqueFromWeight = torqueFromWeight;

        newState.velY = 0;
        newState.posY = ROLL_BASE_HEIGHT;

        break;
      }
      case "stabilization": {

        if (state.isStabilized) {
          newState.roll = THREE.MathUtils.lerp(state.roll, 0, delta * 5);
          newState.pitch = THREE.MathUtils.lerp(state.pitch, 0, delta * 5);

          if (Math.abs(newState.roll) < 1 && Math.abs(newState.pitch) < 1) {
            newState.velX *= 0.95;
            newState.velZ *= 0.95;
          }
        } else {
          newState.roll += (Math.random() - 0.5) * delta * 10;
          newState.pitch += (Math.random() - 0.5) * delta * 10;

          newState.velX += (Math.random() - 0.5) * delta * 0.5;
          newState.velZ += (Math.random() - 0.5) * delta * 0.5;
        }

        if (Math.abs(newState.roll) < MAX_TILT_ANGLE * 0.5) {
          newState.velY = 0;
          newState.posY = ROLL_BASE_HEIGHT;
        }

        break;
      }
      case "battery": {

        const batteryPercent = state.batteryLevel / 100;

        const currentVoltage = BATTERY_MIN_VOLTAGE + (BATTERY_MAX_VOLTAGE - BATTERY_MIN_VOLTAGE) * batteryPercent;

        const avgMotorPower = (state.motorFL + state.motorFR + state.motorRL + state.motorRR) / 4;
        const currentDraw = (avgMotorPower / 100) * 20;
        const voltageSag = currentDraw * BATTERY_INTERNAL_RESISTANCE * 6;
        const effectiveVoltage = currentVoltage - voltageSag;

        const voltageRatio = effectiveVoltage / BATTERY_MAX_VOLTAGE;
        const effectiveRPM = 6200 * voltageRatio;

        newState.voltage = effectiveVoltage;
        newState.effectiveRPM = effectiveRPM;
        newState.liftForce = calculateLiftForce(effectiveRPM);

        if (effectiveRPM >= HOVER_RPM * 0.9) {
          newState.velY = 0;
          newState.posY = ROLL_BASE_HEIGHT;
        }

        break;
      }
    }

    newState.posX += newState.velX * delta;
    newState.posY = Math.max(0, newState.posY + newState.velY * delta);
    newState.posZ += newState.velZ * delta;

    if (newState.posY <= 0) {
      newState.velY = 0;
      newState.velX *= 0.9;
      newState.velZ *= 0.9;
    }
  }
  const MAX_VEL = 5;
  newState.velX = THREE.MathUtils.clamp(newState.velX, -MAX_VEL, MAX_VEL);
  newState.velY = THREE.MathUtils.clamp(newState.velY, -MAX_VEL, MAX_VEL);
  newState.velZ = THREE.MathUtils.clamp(newState.velZ, -MAX_VEL, MAX_VEL);

  return newState;
}
