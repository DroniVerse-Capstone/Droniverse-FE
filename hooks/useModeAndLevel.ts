
import { useState, useEffect, useMemo } from "react";
import type { ExperienceMode } from "@/components/Toolbar";
import { LAB_LEVELS, getLevelById, getInitialHeading, type Level } from "@/lib/levels";
import { DEFAULT_DRONE_STATE } from "@/lib/constants";
import type { DroneState } from "@/lib/droneSimulator";

type UseModeAndLevelProps = {
  allowedModes: ExperienceMode[];
  initialMode?: ExperienceMode;
  lockedLevelId?: string;
  initialLevelId?: string;
  autoStartLab?: boolean;
};

export function useModeAndLevel({
  allowedModes,
  initialMode,
  lockedLevelId,
  initialLevelId,
  autoStartLab = false,
}: UseModeAndLevelProps) {
  const modes = allowedModes.length > 0 ? allowedModes : (["sandbox", "lab"] as ExperienceMode[]);
  const canSwitchMode = modes.length > 1;
  const defaultMode: ExperienceMode = initialMode && modes.includes(initialMode) ? initialMode : modes[0];
  const labEnabled = modes.includes("lab");

  const [currentMode, setCurrentMode] = useState<ExperienceMode>(defaultMode);
  const [levelId, setLevelId] = useState<string>(
    lockedLevelId ?? initialLevelId ?? LAB_LEVELS[0].id
  );
  const [labActive, setLabActive] = useState<boolean>(
    labEnabled && autoStartLab && (lockedLevelId ? true : currentMode === "lab")
  );

  useEffect(() => {
    if (lockedLevelId) {
      setLevelId(lockedLevelId);
    }
  }, [lockedLevelId]);

  const currentLevel = useMemo<Level>(() => getLevelById(levelId), [levelId]);
  const levelHeading = useMemo(() => getInitialHeading(currentLevel), [currentLevel]);

  const getSandboxStartState = (): DroneState => ({
    x: DEFAULT_DRONE_STATE.X,
    y: DEFAULT_DRONE_STATE.Y,
    headingDeg: DEFAULT_DRONE_STATE.HEADING_DEG,
    altitude: DEFAULT_DRONE_STATE.ALTITUDE,
  });

  const getLabStartState = (): DroneState => ({
    x: currentLevel.environment.start.position[0],
    y: currentLevel.environment.start.position[2],
    headingDeg: levelHeading,
    altitude: currentLevel.environment.start.position[1],
  });

  const getInitialStartState = (): DroneState => {
    if (labEnabled && (defaultMode === "lab" || lockedLevelId)) {
      const initialLevel = getLevelById(lockedLevelId ?? initialLevelId ?? LAB_LEVELS[0].id);
      return {
        x: initialLevel.environment.start.position[0],
        y: initialLevel.environment.start.position[2],
        headingDeg: getInitialHeading(initialLevel),
        altitude: initialLevel.environment.start.position[1],
      };
    }
    return getSandboxStartState();
  };

  const getStartState = (): DroneState => {
    if (currentMode === "lab" && labActive) {
      return getLabStartState();
    }
    return getSandboxStartState();
  };

  const handleModeChange = (newMode: ExperienceMode) => {
    if (!canSwitchMode || newMode === currentMode) return;
    setCurrentMode(newMode);
    if (newMode === "sandbox") {
      setLabActive(false);
    } else {
      setLabActive(autoStartLab);
    }
  };

  const handleLevelChange = (newLevelId: string) => {
    if (lockedLevelId) return;
    setLevelId(newLevelId);
    setLabActive(autoStartLab && currentMode === "lab");
  };

  const handleStartLab = () => {
    if (currentMode !== "lab") return;
    setLabActive(true);
  };

  return {
    currentMode,
    levelId,
    labActive,
    currentLevel,
    levelHeading,
    labEnabled,
    canSwitchMode,
    getInitialStartState,
    getStartState,
    getSandboxStartState,
    getLabStartState,
    handleModeChange,
    handleLevelChange,
    handleStartLab,
  };
}
