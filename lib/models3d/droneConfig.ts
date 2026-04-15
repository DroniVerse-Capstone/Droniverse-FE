import { SIMULATOR_CONFIG } from "../simulator/config";

export const DRONE_COLORS = {
  FUSELAGE: SIMULATOR_CONFIG.droneVisuals.colors.fuselage,
  NOSE: SIMULATOR_CONFIG.droneVisuals.colors.nose,
  CANOPY: SIMULATOR_CONFIG.droneVisuals.colors.canopy,
  WINGS: SIMULATOR_CONFIG.droneVisuals.colors.wings,
  ROTOR: SIMULATOR_CONFIG.droneVisuals.colors.rotor,
};

export const DRONE_SIZES = {
  FUSELAGE: SIMULATOR_CONFIG.droneVisuals.sizes.fuselage,
  NOSE: SIMULATOR_CONFIG.droneVisuals.sizes.nose,
  NOSE_POSITION: SIMULATOR_CONFIG.droneVisuals.sizes.nosePos,
  CANOPY: SIMULATOR_CONFIG.droneVisuals.sizes.canopy,
  CANOPY_POSITION: SIMULATOR_CONFIG.droneVisuals.sizes.canopyPos,
  WINGS: SIMULATOR_CONFIG.droneVisuals.sizes.wings,
  WINGS_POSITION: SIMULATOR_CONFIG.droneVisuals.sizes.wingsPos,
  STABILIZER: SIMULATOR_CONFIG.droneVisuals.sizes.stabilizer,
  STABILIZER_POSITION: SIMULATOR_CONFIG.droneVisuals.sizes.stabilizerPos,
  STABILIZER_ROTATION: SIMULATOR_CONFIG.droneVisuals.sizes.stabilizerRot,
  ROTOR: SIMULATOR_CONFIG.droneVisuals.sizes.rotor,
  ROTOR_POSITIONS: SIMULATOR_CONFIG.droneVisuals.sizes.rotorPos,
};

export const DRONE_FLOAT_CONFIG = {
  speed: SIMULATOR_CONFIG.droneVisuals.float.speed,
  floatingRange: SIMULATOR_CONFIG.droneVisuals.float.range,
  rotationIntensity: SIMULATOR_CONFIG.droneVisuals.float.rotationIntensity,
  floatIntensity: SIMULATOR_CONFIG.droneVisuals.float.floatIntensity,
};

export const DRONE_ROTOR_CONFIG = {
  SPIN_SPEED_FLYING: SIMULATOR_CONFIG.droneVisuals.rotorSpin.flying,
  SPIN_SPEED_IDLE: SIMULATOR_CONFIG.droneVisuals.rotorSpin.idle,
};

export const DRONE_MODEL_CONFIG = {
  useCustomModel: SIMULATOR_CONFIG.droneVisuals.model.useCustom,
  modelPath: SIMULATOR_CONFIG.droneVisuals.model.path,
  scale: SIMULATOR_CONFIG.droneVisuals.model.scale,
  position: SIMULATOR_CONFIG.droneVisuals.model.pos,
  rotation: SIMULATOR_CONFIG.droneVisuals.model.rot,
};
