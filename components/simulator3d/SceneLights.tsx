"use client";
import {
  HEMISPHERE_LIGHT_CONFIG,
  DIRECTIONAL_LIGHT_CONFIG,
  POINT_LIGHT_CONFIG,
  SHOW_POINT_LIGHT,
  AMBIENT_LIGHT_CONFIG,
  SHOW_AMBIENT_LIGHT,
} from "@/lib/models3d/lightsConfig";

export default function SceneLights() {
  return (
    <>
      {SHOW_AMBIENT_LIGHT && (
        <ambientLight
          color={AMBIENT_LIGHT_CONFIG.color}
          intensity={AMBIENT_LIGHT_CONFIG.intensity}
        />
      )}
      <hemisphereLight
        args={[
          HEMISPHERE_LIGHT_CONFIG.skyColor,
          HEMISPHERE_LIGHT_CONFIG.groundColor,
          HEMISPHERE_LIGHT_CONFIG.intensity,
        ]}
        position={HEMISPHERE_LIGHT_CONFIG.position}
      />
      <directionalLight
        position={DIRECTIONAL_LIGHT_CONFIG.position}
        intensity={DIRECTIONAL_LIGHT_CONFIG.intensity}
        color={DIRECTIONAL_LIGHT_CONFIG.color}
        castShadow={DIRECTIONAL_LIGHT_CONFIG.castShadow}
        shadow-mapSize-width={DIRECTIONAL_LIGHT_CONFIG.shadowMapSize.width}
        shadow-mapSize-height={DIRECTIONAL_LIGHT_CONFIG.shadowMapSize.height}
        shadow-bias={DIRECTIONAL_LIGHT_CONFIG.shadowBias}
      />
      {SHOW_POINT_LIGHT && (
        <pointLight
          position={POINT_LIGHT_CONFIG.position}
          intensity={POINT_LIGHT_CONFIG.intensity}
          color={POINT_LIGHT_CONFIG.color}
        />
      )}
    </>
  );
}
