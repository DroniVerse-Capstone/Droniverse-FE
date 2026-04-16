import { SIMULATOR_CONFIG } from "../simulator/config";

export const HEMISPHERE_LIGHT_CONFIG = {
  skyColor: SIMULATOR_CONFIG.lighting.hemisphere.sky,
  groundColor: SIMULATOR_CONFIG.lighting.hemisphere.ground,
  intensity: SIMULATOR_CONFIG.lighting.hemisphere.intensity,
  position: SIMULATOR_CONFIG.lighting.hemisphere.pos,
};

export const AMBIENT_LIGHT_CONFIG = {
  color: SIMULATOR_CONFIG.lighting.ambient.color,
  intensity: SIMULATOR_CONFIG.lighting.ambient.intensity,
};

export const SHOW_AMBIENT_LIGHT = SIMULATOR_CONFIG.lighting.ambient.show;

export const DIRECTIONAL_LIGHT_CONFIG = {
  position: SIMULATOR_CONFIG.lighting.directional.pos,
  intensity: SIMULATOR_CONFIG.lighting.directional.intensity,
  color: SIMULATOR_CONFIG.lighting.directional.color,
  castShadow: SIMULATOR_CONFIG.lighting.directional.castShadow,
  shadowMapSize: {
    width: SIMULATOR_CONFIG.performance.shadowRes,
    height: SIMULATOR_CONFIG.performance.shadowRes,
  },
  shadowBias: SIMULATOR_CONFIG.lighting.directional.shadowBias,
};

export const POINT_LIGHT_CONFIG = {
  position: [0, 100, 0] as [number, number, number], // Placeholder for dynamic height
  intensity: SIMULATOR_CONFIG.lighting.point.intensity,
  color: SIMULATOR_CONFIG.lighting.point.color,
};

export const CONTACT_SHADOWS_CONFIG = {
  position: SIMULATOR_CONFIG.lighting.contactShadow.pos,
  opacity: SIMULATOR_CONFIG.lighting.contactShadow.opacity,
  scale: 40,
  blur: SIMULATOR_CONFIG.lighting.contactShadow.blur,
  far: SIMULATOR_CONFIG.lighting.contactShadow.far,
};

export const SHOW_POINT_LIGHT = SIMULATOR_CONFIG.lighting.point.show;
export const SHOW_CONTACT_SHADOWS = SIMULATOR_CONFIG.lighting.contactShadow.show;
