export const DRONE_COLORS = {
  // Màu thân chính 
  FUSELAGE: {
    color: "#38bdf8",
    emissive: "#0ea5e9",
    metalness: 0.4,
    roughness: 0.25,
  },

  // Màu mũi 
  NOSE: {
    color: "#67e8f9",
    emissive: "#06b6d4",
    roughness: 0.2,
    metalness: 0.6,
  },

  // Màu kính
  CANOPY: {
    color: "#e0f2fe",
    transparent: true,
    opacity: 0.8,
    roughness: 0.1,
    metalness: 0.8,
  },

  // Màu cánh 
  WINGS: {
    color: "#0f172a",
    metalness: 0.5,
    roughness: 0.4,
  },

  // Màu cánh quạt
  ROTOR: {
    color: "#bae6fd",
    emissive: "#67e8f9",
    roughness: 0.3,
  },

  // // Màu ánh sáng phát ra
  // GLOW: {
  //   color: "#22d3ee",
  //   transparent: true,
  //   opacity: 0.35,
  // },
};

export const DRONE_SIZES = {
  FUSELAGE: [1, 0.8, 2.5] as [number, number, number],

  NOSE: [0.5, 1.1, 30] as [number, number, number],
  NOSE_POSITION: [0, 0, 1.65] as [number, number, number],

  CANOPY: [0.55, 16, 16] as [number, number, number],
  CANOPY_POSITION: [0, 0.35, 0] as [number, number, number],

  WINGS: [3, 0.3, 1] as [number, number, number],
  WINGS_POSITION: [0, 0.05, 0] as [number, number, number],

  STABILIZER: [1.2, 0.05, 0.4] as [number, number, number],
  STABILIZER_POSITION: [0, 0.3, -1.03] as [number, number, number],
  STABILIZER_ROTATION: [0, 0, Math.PI / 2] as [number, number, number],

  ROTOR: [0.35, 0.35, 0.15, 16] as [number, number, number, number],
  ROTOR_POSITIONS: [
    [-1.4, 0.45, -0.9],
    [-1.4, 0.45, 0.9],
    [1.4, 0.45, -0.9],
    [1.4, 0.45, 0.9],
  ] as [number, number, number][],

};

export const DRONE_FLOAT_CONFIG = {
  speed: 3,
  floatingRange: [-0.4, 0.6] as [number, number],
  rotationIntensity: 0.3,
  floatIntensity: 0.4,
};

export const DRONE_ROTOR_CONFIG = {
  SPIN_SPEED_FLYING: 10,
  SPIN_SPEED_IDLE: 0,
};

export const DRONE_MODEL_CONFIG = {
  useCustomModel: false,
  modelPath: "/models/drone2.glb",
  scale: 3,
  position: [0, 0, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
};

