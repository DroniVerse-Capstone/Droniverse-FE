import { SIMULATOR_CONFIG } from "../simulator/config";

export const DRONE_SPEED = {
  LINEAR_PX_PER_SEC: SIMULATOR_CONFIG.speed.linear,
  ANGULAR_DEG_PER_SEC: SIMULATOR_CONFIG.speed.angular,
};

export const ANIMATION_DURATION = {
  MIN_MS: SIMULATOR_CONFIG.animation.minMs,
  DEFAULT_MS: SIMULATOR_CONFIG.animation.defaultMs,
};

export const SIMULATION_CANVAS = {
  WIDTH: SIMULATOR_CONFIG.world.canvas.width,
  HEIGHT: SIMULATOR_CONFIG.world.canvas.height,
  PADDING: SIMULATOR_CONFIG.world.canvas.padding,
};

export const WORLD_SCALE = {
  POSITION: SIMULATOR_CONFIG.world.scale.position,
  ALTITUDE: SIMULATOR_CONFIG.world.scale.altitude,
};

export const DEFAULT_DRONE_STATE = {
  X: SIMULATOR_CONFIG.world.initialState.x,
  Y: SIMULATOR_CONFIG.world.initialState.y,
  HEADING_DEG: SIMULATOR_CONFIG.world.initialState.heading,
  ALTITUDE: SIMULATOR_CONFIG.world.initialState.altitude,
};
