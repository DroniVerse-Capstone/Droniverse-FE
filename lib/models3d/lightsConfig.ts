
import { SIMULATION_CANVAS, WORLD_SCALE } from "../config3D/constants";

export const HEMISPHERE_LIGHT_CONFIG = {
  skyColor: "#e0f2fe",
  groundColor: "#0f172a",
  intensity: 0.6,
  position: [0, 1, 0] as [number, number, number],
};

export const AMBIENT_LIGHT_CONFIG = {
  color: "#ffffff",
  intensity: 1.2,
};
export const SHOW_AMBIENT_LIGHT = true;

export const DIRECTIONAL_LIGHT_CONFIG = {
  position: [50, 120, 50] as [number, number, number],
  intensity: 0.6,
  color: "#f8f3e6",
  castShadow: false,
  shadowMapSize: {
    width: 2048,
    height: 2048,
  },
  shadowBias: -0.001,
};

const WORLD_WIDTH = SIMULATION_CANVAS.WIDTH * WORLD_SCALE.POSITION;
const WORLD_HEIGHT = SIMULATION_CANVAS.HEIGHT * WORLD_SCALE.POSITION;
const WORLD_CENTER_X = 0;
const WORLD_CENTER_Z = 0;
const DEFAULT_POINT_HEIGHT = Math.max(WORLD_WIDTH, WORLD_HEIGHT) * 0.6;

export const POINT_LIGHT_CONFIG = {
  position: [WORLD_CENTER_X, DEFAULT_POINT_HEIGHT, WORLD_CENTER_Z] as [number, number, number],
  intensity: 1.2,
  color: "#38bdf8",
};

export const CONTACT_SHADOWS_CONFIG = {
  position: [0, 0, 0] as [number, number, number],
  opacity: 0.6,
  scale: Math.max(80, Math.max(WORLD_WIDTH, WORLD_HEIGHT) * 0.8),
  blur: Math.max(2.5, Math.min(8, Math.max(WORLD_WIDTH, WORLD_HEIGHT) * 0.02)),
  far: Math.max(40, Math.max(WORLD_WIDTH, WORLD_HEIGHT) * 0.5),
};

export const SHOW_POINT_LIGHT = true;
export const SHOW_CONTACT_SHADOWS = false;

