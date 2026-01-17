export const AMBIENT_COLOR = "#030712";


export const MAP_COLORS = {
  // Màu mặt phẳng chính
  GROUND: {
    color: "#030712",
    roughness: 0.9,
    metalness: 1,
  },

  // Màu grid 
  GRID: {
    sectionColor: "#0ea5e9",
    cellColor: "black",
  },

  // Màu border 
  BORDER: {
    color: "#38bdf8",
    lineWidth: 4,
    opacity: 0.9,
    transparent: true,
  },
};

export const GRID_CONFIG = {
  cellSize: 10,
  cellThickness: 0.6,
  sectionThickness: 1.2,
  sectionSize: 20,
  infiniteGrid: false,
  fadeStrength: 0,
  position: [0, 0.15, 0] as [number, number, number],
};

export const BORDER_CONFIG = {
  height: 0.02,
};

export const TERRAIN_MODEL_CONFIG = {
  useCustomTerrain: false,
  terrainPath: "",
  scale: 1,
  position: [0, 0, 0] as [number, number, number],
};

