

export const GOAL_COLORS = {
  GROUND_RING: {
    color: "#22c55e",
    transparent: true,
    opacity: 0.25,
  },

  MAIN_RING: {
    color: "#22c55e",
    transparent: true,
    opacity: 0.9,
  },

  PILLAR: {
    color: "#4ade80",
    emissive: "#16a34a",
    metalness: 0.3,
    roughness: 0.4,
  },

  TOP: {
    color: "#bbf7d0",
    emissive: "#4ade80",
  },

  TEXT: {
    color: "#e5f9ff",
    outlineColor: "#022c22",
    outlineWidth: 0.02,
  },
};

export const GOAL_SIZES = {
  GROUND_RING: [0.4, 0.85, 48] as [number, number, number],

  MAIN_RING: [0.6, 1.0, 48] as [number, number, number],

  PILLAR: [0.2, 0.08, 0.8, 24] as [number, number, number, number],
  PILLAR_POSITION: [0, 0.3, 0] as [number, number, number],

  TOP: [0.25, 0] as [number, number],
  TOP_POSITION: [0, 0.8, 0] as [number, number, number],

  TEXT_SIZE_MULTIPLIER: 0.4,
  TEXT_POSITION: [0, 1.4, 0] as [number, number, number],
};

export const OBSTACLE_COLORS = {
  GROUND_RING: {
    color: "#f87171",
    transparent: true,
    opacity: 0.25,
  },

  PILLAR: {
    color: "#f87171",
    emissive: "#ef4444",
    metalness: 0.2,
    roughness: 0.5,
  },

  TOP_RING: {
    color: "#f43f5e",
    transparent: true,
    opacity: 0.35,
  },

  TEXT: {
    color: "#fee2e2",
    outlineColor: "#450a0a",
    outlineWidth: 0.02,
  },
};

export const OBSTACLE_SIZES = {
  GROUND_RING: [0.4, 0.9, 48] as [number, number, number],

  PILLAR: [0.5, 0.5, 0.9, 32] as [number, number, number, number],

  TOP_RING: [0.4, 0.9, 48] as [number, number, number],

  TEXT_SIZE_MULTIPLIER: 0.35,
  TEXT_HEIGHT_MULTIPLIER: 1.3,
};

export const MARKER_MODEL_CONFIG = {
  goal: {
    useCustomModel: false,
    modelPath: "",
    scale: 1,
    position: [0, 0, 0] as [number, number, number],
  },

  obstacle: {
    useCustomModel: false,
    modelPath: "",
    scale: 1,
    position: [0, 0, 0] as [number, number, number],
  },
};

