import { SIMULATOR_CONFIG } from "../simulator/config";

export const AMBIENT_COLOR = SIMULATOR_CONFIG.mapVisuals.ambientColor;

export const MAP_COLORS = {
  GROUND: SIMULATOR_CONFIG.mapVisuals.colors.ground,
  GRID: SIMULATOR_CONFIG.mapVisuals.colors.grid,
  BORDER: SIMULATOR_CONFIG.mapVisuals.colors.border,
};

export const GRID_CONFIG = {
  cellSize: SIMULATOR_CONFIG.mapVisuals.grid.cellSize,
  cellThickness: SIMULATOR_CONFIG.mapVisuals.grid.cellThickness,
  sectionThickness: SIMULATOR_CONFIG.mapVisuals.grid.sectionThickness,
  sectionSize: SIMULATOR_CONFIG.mapVisuals.grid.sectionSize,
  infiniteGrid: SIMULATOR_CONFIG.mapVisuals.grid.infinite,
  fadeStrength: SIMULATOR_CONFIG.mapVisuals.grid.fadeStrength,
  position: SIMULATOR_CONFIG.mapVisuals.grid.pos,
};

export const BORDER_CONFIG = {
  height: SIMULATOR_CONFIG.mapVisuals.border.height,
};

export const TERRAIN_MODEL_CONFIG = {
  useCustomTerrain: SIMULATOR_CONFIG.mapVisuals.terrain.useCustom,
  terrainPath: SIMULATOR_CONFIG.mapVisuals.terrain.path,
  scale: SIMULATOR_CONFIG.mapVisuals.terrain.scale,
  position: SIMULATOR_CONFIG.mapVisuals.terrain.pos,
};
