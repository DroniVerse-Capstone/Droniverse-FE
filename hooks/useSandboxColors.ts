
import { useState, useEffect, useCallback } from "react";
import { DRONE_COLORS } from "@/lib/models3d/droneConfig";
import { MAP_COLORS, AMBIENT_COLOR } from "@/lib/models3d/mapConfig";

export type SandboxColorConfig = {
  drone: {
    fuselage: string;
    fuselageEmissive?: string;
    nose: string;
    noseEmissive?: string;
    canopy: string;
    wings: string;
    rotor: string;
    rotorEmissive?: string;
  };
  map: {
    ground: string;
    grid: string;
    border: string;
  };
  ambient: string;
};

const STORAGE_KEY = "sandbox_color_config";

function darkenColor(hex: string, factor: number = 0.7): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.floor(((num >> 16) & 0xff) * factor);
  const g = Math.floor(((num >> 8) & 0xff) * factor);
  const b = Math.floor((num & 0xff) * factor);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const DEFAULT_CONFIG: SandboxColorConfig = {
  drone: {
    fuselage: DRONE_COLORS.FUSELAGE.color,
    fuselageEmissive: DRONE_COLORS.FUSELAGE.emissive,
    nose: DRONE_COLORS.NOSE.color,
    noseEmissive: DRONE_COLORS.NOSE.emissive,
    canopy: DRONE_COLORS.CANOPY.color,
    wings: DRONE_COLORS.WINGS.color,
    rotor: DRONE_COLORS.ROTOR.color,
    rotorEmissive: DRONE_COLORS.ROTOR.emissive,
  },
  map: {
    ground: MAP_COLORS.GROUND.color,
    grid: MAP_COLORS.GRID.sectionColor,
    border: MAP_COLORS.BORDER.color,
  },
  ambient: AMBIENT_COLOR,
};

export function useSandboxColors() {
  const [config, setConfig] = useState<SandboxColorConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      }
    } catch (error) {
      console.error("Failed to load sandbox color config:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveConfig = useCallback((newConfig: SandboxColorConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error("Failed to save sandbox color config:", error);
    }
  }, []);

  const resetConfig = useCallback(() => {
    saveConfig(DEFAULT_CONFIG);
  }, [saveConfig]);

  return {
    config,
    saveConfig,
    resetConfig,
    isLoaded,
  };
}

