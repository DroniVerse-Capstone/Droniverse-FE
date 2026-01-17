

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Toolbar, { type ExperienceMode } from "@/components/Toolbar";
import BlocklyWorkspace from "@/components/BlocklyWorkspace";
import Simulator3D from "@/components/Simulator3D";
import { LAB_LEVELS } from "@/lib/levels";
import {
  buildToolboxXml,
  DEFAULT_LAB_TOOLBOX,
  SANDBOX_TOOLBOX_CATEGORIES,
  generateProgram,
} from "@/lib/blockly";
import type { DroneState } from "@/lib/droneSimulator";
import type * as BlocklyType from "blockly/core";
import { SIM_CANVAS } from "@/lib/simConfig";
import { useModeAndLevel } from "@/hooks/useModeAndLevel";
import { useDroneController } from "@/hooks/useDroneController";
import { useSandboxColors } from "@/hooks/useSandboxColors";
import SettingsModal from "@/components/SettingsModal";
import { DEFAULT_DISPLAY_CONFIG } from "@/lib/displayDefaults";

type DronePlaygroundProps = {
  allowedModes?: ExperienceMode[];
  initialMode?: ExperienceMode;
  lockedLevelId?: string;
  initialLevelId?: string;
  showLevelSelector?: boolean;
  autoStartLab?: boolean;
  title?: string;
  backLink?: { href: string; label: string };
};

const DEFAULT_MODES: ExperienceMode[] = ["sandbox", "lab"];

const SANDBOX_ORIGIN = {
  x: SIM_CANVAS.width / 2,
  y: SIM_CANVAS.height / 2,
  z: 0,
};

export default function DronePlayground({
  allowedModes = DEFAULT_MODES,
  initialMode,
  lockedLevelId,
  initialLevelId,
  showLevelSelector = true,
  autoStartLab = false,
  title = "Drone Workspace",
  backLink,
}: DronePlaygroundProps) {
  const {
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
  } = useModeAndLevel({
    allowedModes,
    initialMode,
    lockedLevelId,
    initialLevelId,
    autoStartLab,
  });

  const [status, setStatus] = useState<string>("Sẵn sàng");
  const [droneState, setDroneState] = useState<DroneState>(() =>
    getInitialStartState()
  );
  const [hasBlocks, setHasBlocks] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const simRef = useRef<any>(null);

  const { config: colorConfig, saveConfig, resetConfig } = useSandboxColors();
  const [displayConfig, setDisplayConfig] = useState(() => ({
    ...DEFAULT_DISPLAY_CONFIG,
  }));
  const [runMode, setRunMode] = useState<"restart" | "continue">("restart");
  const lastProgramRef = useRef<any[] | null>(null);
  const toggleRunMode = useCallback(() => {
    if (isDebugMode) return;
    setRunMode((m) => {
      const next = m === "restart" ? "continue" : "restart";
      if (next === "continue") lastProgramRef.current = null;
      const startState =
        currentMode === "lab" ? getLabStartState() : getSandboxStartState();
      if (currentMode === "lab" && !labActive) {
        handleStartLab();
      }
      controller.stop();
      controller.reset(startState);
      setDroneState(startState);
      simRef.current?.clearTrail?.();
      setStatus("Sẵn sàng");
      lastProgramRef.current = null;
      setQueueLen(controller.getQueueLength());
      return next;
    });
  }, []);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isDebugPlaying, setIsDebugPlaying] = useState(false);
  const [isDebugFinished, setIsDebugFinished] = useState(false);
  const debugIntervalRef = useRef<number | null>(null);

  const initialStartStateRef = useRef<DroneState>(getInitialStartState());


  const controller = useDroneController({
    initialState: initialStartStateRef.current,
    onDroneStateChange: setDroneState, 
    onStatusChange: setStatus, 
  });
  useEffect(() => {
    if (!controller) return;
    const g = currentLevel.environment.goal;
    if (!g) {
      controller.setGoalArea(null);
      return;
    }
    const area: any = {
      shape: g.shape ?? (typeof g.radius === "number" ? "circle" : "square"),
      x: g.position[0],
      y: g.position[2],
      altitude: g.position[1] ?? 0,
    };
    if (area.shape === "circle") area.radius = g.radius ?? 0;
    else if (area.shape === "square") area.size = g.size ?? [0, 0];
    controller.setGoalArea(area);
  }, [controller, currentLevel]);
  const [queueLen, setQueueLen] = useState<number>(() =>
    controller.getQueueLength()
  );


  const blocklyContextRef = useRef<{
    Blockly: typeof BlocklyType;
    workspace: BlocklyType.WorkspaceSvg;
  } | null>(null);

  const handleWorkspaceReady = useCallback(
    (context: {
      Blockly: typeof BlocklyType;
      workspace: BlocklyType.WorkspaceSvg;
    }) => {
      blocklyContextRef.current = context;
    },
    []
  );

  const handleBlocksChange = useCallback((hasBlocks: boolean) => {
    setHasBlocks(hasBlocks);
  }, []);

  const sandboxToolboxXml = useMemo(
    () => buildToolboxXml(SANDBOX_TOOLBOX_CATEGORIES),
    []
  );
  const labToolboxXml = useMemo(
    () => buildToolboxXml(DEFAULT_LAB_TOOLBOX),
    [currentLevel]
  );
  const toolboxXml =
    currentMode === "sandbox" ? sandboxToolboxXml : labToolboxXml;

  // Reset drone to initial state
  const handleReset = useCallback(() => {
    const startState =
      currentMode === "lab" && labActive
        ? getLabStartState()
        : getSandboxStartState();
    controller.reset(startState);
    setDroneState(startState);
    setStatus("Sẵn sàng");
    simRef.current?.clearTrail?.();
  }, [
    currentMode,
    labActive,
    getLabStartState,
    getSandboxStartState,
    controller,
  ]);


  const handleRun = useCallback(() => {
    if (isDebugMode) {
      if (debugIntervalRef.current !== null) {
        cancelAnimationFrame(debugIntervalRef.current);
        debugIntervalRef.current = null;
      }
      setIsDebugPlaying(false);
      setIsDebugMode(false);
    }
    if (!hasBlocks || status === "Đang chạy…") return;
    if (!blocklyContextRef.current) {
      return;
    }

    const { Blockly, workspace } = blocklyContextRef.current;

    const program = generateProgram(Blockly, workspace);

    if (program.length === 0) {
      return;
    }

    if (runMode === "restart") {
      setStatus("Đang chạy…");
      const startState =
        currentMode === "lab" ? getLabStartState() : getSandboxStartState();
      if (currentMode === "lab" && !labActive) {
        handleStartLab();
      }
      setDroneState(startState);
      controller.stop();
      controller.reset(startState);
      simRef.current?.clearTrail?.();
      controller.enqueueMany(program);
      lastProgramRef.current = program;
      controller.run();
      return;
    } else {
      if (!lastProgramRef.current) {
        lastProgramRef.current = program;
        if (program.length > 0) {
          controller.enqueueMany(program);
          setStatus("Đang chạy…");
          controller.run();
        }
        return;
      }
      if (lastProgramRef.current && Array.isArray(lastProgramRef.current)) {
        const prev = lastProgramRef.current;
        const isPrefix =
          prev.length <= program.length &&
          prev.every(
            (p, i) => JSON.stringify(p) === JSON.stringify(program[i])
          );
        if (isPrefix) {
          const toAdd = program.slice(prev.length);
          if (toAdd.length > 0) {
            controller.enqueueMany(toAdd);
            lastProgramRef.current = program;
            if (controller.getStatus() !== "running") {
              setStatus("Đang chạy…");
              controller.run();
            }
            return;
          } else {
            return;
          }
        }
      }
      setStatus("Đang chạy…");
      let stateToUse2 = droneState;
      if (currentMode === "lab" && !labActive) {
        handleStartLab();
        const labStartState = getLabStartState();
        setDroneState(labStartState);
        stateToUse2 = labStartState;
      }
      controller.stop();
      controller.reset(stateToUse2);
      controller.enqueueMany(program);
      lastProgramRef.current = program;
      controller.run();
      return;
    }
  }, [
    droneState,
    currentMode,
    labActive,
    handleStartLab,
    controller,
    runMode,
    isDebugMode,
    hasBlocks,
    status,
  ]);

  const startDebugMode = useCallback(() => {
    if (!blocklyContextRef.current) return;
    const { Blockly, workspace } = blocklyContextRef.current;
    const program = generateProgram(Blockly, workspace);
    if (program.length === 0) return;

    const startState =
      currentMode === "lab" ? getLabStartState() : getSandboxStartState();
    if (currentMode === "lab" && !labActive) {
      handleStartLab();
    }
    setDroneState(startState);
    controller.stop();
    controller.reset(startState);
    simRef.current?.clearTrail?.();
    controller.enqueueMany(program);
    lastProgramRef.current = program;
    setIsDebugMode(true);
    setIsDebugPlaying(false);
    setIsDebugFinished(false);
  }, [controller, droneState, currentMode, labActive, handleStartLab]);

  const stopDebugMode = useCallback(() => {
    if (debugIntervalRef.current !== null) {
      cancelAnimationFrame(debugIntervalRef.current);
      debugIntervalRef.current = null;
    }
    setIsDebugPlaying(false);
    setIsDebugMode(false);
    setIsDebugFinished(false);
  }, []);

  const stepDebug = useCallback(() => {
    if (controller.getStatus() === "running") return;
    if (controller.getQueueLength() === 0) return;
    controller.stepOnce();
  }, [controller]);

  const togglePlayDebug = useCallback(() => {
    if (isDebugPlaying) {
      if (debugIntervalRef.current !== null) {
        cancelAnimationFrame(debugIntervalRef.current);
        debugIntervalRef.current = null;
      }
      setIsDebugPlaying(false);
      return;
    }

    setIsDebugPlaying(true);
    const tick = () => {
      if (
        controller.getStatus() !== "running" &&
        controller.getQueueLength() > 0
      ) {
        controller.stepOnce();
      }
      if (controller.getQueueLength() === 0) {
        setIsDebugPlaying(false);
        debugIntervalRef.current = null;
        setIsDebugFinished(true);
        return;
      }
      debugIntervalRef.current = requestAnimationFrame(tick);
    };
    debugIntervalRef.current = requestAnimationFrame(tick);
  }, [controller, isDebugPlaying]);

  const repeatDebug = useCallback(() => {
    const program =
      lastProgramRef.current ??
      (() => {
        if (!blocklyContextRef.current) return null;
        const { Blockly, workspace } = blocklyContextRef.current;
        const p = generateProgram(Blockly, workspace);
        return p.length > 0 ? p : null;
      })();
    if (!program) return;

    const startState =
      currentMode === "lab" ? getLabStartState() : getSandboxStartState();
    if (currentMode === "lab" && !labActive) {
      handleStartLab();
    }
    setDroneState(startState);
    controller.stop();
    controller.reset(startState);
    simRef.current?.clearTrail?.();
    controller.enqueueMany(program);
    lastProgramRef.current = program;
    setIsDebugMode(true);
    setIsDebugPlaying(false);
    setIsDebugFinished(false);
    setQueueLen(controller.getQueueLength());
  }, [controller, currentMode, labActive, handleStartLab]);

  useEffect(() => {
    if (status === "Hoàn thành" && isDebugMode) {
      setIsDebugPlaying(false);
      setIsDebugFinished(true);
      if (debugIntervalRef.current !== null) {
        cancelAnimationFrame(debugIntervalRef.current);
        debugIntervalRef.current = null;
      }
    }
    setQueueLen(controller.getQueueLength());
  }, [status, isDebugMode, controller, droneState]);

  const handleChangeLevel = useCallback(
    (newLevelId: string) => {
      handleLevelChange(newLevelId);
      if (currentMode === "lab") {
        const newStartState = getLabStartState();
        controller.reset(newStartState);
        setDroneState(newStartState);
      }
    },
    [currentMode, handleLevelChange]
  );

  const handleModeChangeWithReset = useCallback(
    (newMode: ExperienceMode) => {
      handleModeChange(newMode);
      const newStartState =
        newMode === "sandbox" ? getSandboxStartState() : getLabStartState();
      controller.reset(newStartState);
      setDroneState(newStartState);
    },
    [handleModeChange]
  );

  const handleStartLabWithReset = useCallback(() => {
    handleStartLab();
    const newStartState = getLabStartState();
    controller.reset(newStartState);
    setDroneState(newStartState);
  }, [handleStartLab]);

  useEffect(() => {
    if (!labEnabled || !autoStartLab || currentMode !== "lab") return;
    const newStartState = getLabStartState();
    controller.reset(newStartState);
    setDroneState(newStartState);
  }, [labEnabled, autoStartLab, currentMode, levelId]);

  const levelsList = (
    lockedLevelId
      ? LAB_LEVELS.filter((level) => level.id === lockedLevelId)
      : LAB_LEVELS
  ).map((level) => ({ id: level.id, name: level.name }));

  const showLevelPicker = showLevelSelector && !lockedLevelId && labEnabled;
  const showStartLabButton =
    labEnabled && currentMode === "lab" && !autoStartLab;
  const showModeToggle = canSwitchMode;
  const showLabBadge = labEnabled && currentMode === "lab";
  const showLabElements = labEnabled && currentMode === "lab" && labActive;

  const hudTitle = showLabElements ? currentLevel.name : "Sandbox tự do";
  const goalAltitude = showLabElements
    ? currentLevel.environment.goal.position[1] ?? 0
    : 0;
  const hudDescription = showLabElements
    ? goalAltitude > 0
      ? `${currentLevel.description} (Mục tiêu ở cao độ ${goalAltitude}m.)`
      : currentLevel.description
    : "Chế độ tự do: kéo thả mọi khối để khám phá mô phỏng.";
  const hudOrigin = SANDBOX_ORIGIN;
  const hudAxisHints = showLabElements
    ? [
        { label: "ΔX", detail: "dương → phải so với điểm start" },
        { label: "ΔY", detail: "dương → lên so với điểm start" },
        { label: "ΔZ", detail: "dương → lên so với điểm start" },
        { label: "Heading", detail: "0° = hướng lên mốc" },
      ]
    : [
        { label: "X", detail: "dương → phải" },
        { label: "Y", detail: "dương → lên (cao)" },
        { label: "Z", detail: "dương → lên (cao)" },
        { label: "Heading", detail: "0° = hướng lên" },
      ];
  const headingBaseValue = showLabElements ? levelHeading : undefined;
  const goal = showLabElements ? currentLevel.environment.goal : undefined;
  const obstacles = showLabElements
    ? (currentLevel.environment.obstacles.filter((o: any) =>
        ["box", "cylinder"].includes(String((o as any).type).toLowerCase())
      ) as {
        id: string;
        type: string;
        position: [number, number, number];
        size: [number, number, number];
        rotation?: [number, number, number];
      }[])
    : undefined;

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Toolbar
        title={title}
        mode={currentMode}
        onModeChange={handleModeChangeWithReset}
        showModeToggle={showModeToggle}
        onRun={handleRun}
        runMode={runMode}
        onToggleRunMode={toggleRunMode}
        onStartDebug={startDebugMode}
        onStopDebug={stopDebugMode}
        onStepDebug={stepDebug}
        onTogglePlayDebug={togglePlayDebug}
        onRepeatDebug={repeatDebug}
        debugActive={isDebugMode}
        isPlayingDebug={isDebugPlaying}
        onReset={handleReset}
        remainingSteps={queueLen}
        isDebugFinished={isDebugFinished}
        onStartLab={handleStartLabWithReset}
        showStartLabButton={showStartLabButton}
        labActive={labActive && showLabBadge}
        status={status}
        levelId={levelId}
        levels={levelsList}
        onChangeLevel={handleChangeLevel}
        showLevelSelector={showLevelPicker}
        backLink={backLink}
        runDisabled={!hasBlocks || status === "Đang chạy…"}
        showSettings={currentMode === "sandbox"}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 p-2 sm:p-4 overflow-y-auto min-h-0 relative bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950">
        {/* Blockly Workspace */}
        <div className="border-2 border-cyan-400/30 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 overflow-hidden flex flex-col shadow-lg hover:shadow-xl transition-shadow min-h-[600px] sm:min-h-[500px] lg:min-h-0">
          <div className="px-3 sm:px-5 py-2 sm:py-3 bg-linear-to-r from-blue-500 via-blue-400 to-cyan-400 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base">
                Khu vực Blockly
              </span>
            </div>
            <span className="text-sm sm:text-lg text-purple-100">
              Kéo thả code
            </span>
          </div>
          <div className="flex-1 min-h-0 bg-slate-50 relative">
            <BlocklyWorkspace
              toolboxXml={toolboxXml}
              onWorkspaceReady={handleWorkspaceReady}
              onBlocksChange={handleBlocksChange}
            />
          </div>
        </div>

        {/* 3D Simulator */}
        <div className="border-2 border-cyan-400/30 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 overflow-hidden flex flex-col shadow-2xl min-h-[600px] sm:min-h-[500px] lg:min-h-0">
          <div className="px-3 sm:px-5 py-2 sm:py-3 border-b-2 border-cyan-400 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-400 tracking-wide text-xs sm:text-base">
                MÔ PHỎNG DRONE
              </span>
            </div>
            {showLabElements && (
              <span className="text-xs text-emerald-300 font-semibold border border-emerald-400/50 rounded-full px-3 py-1">
                Lab đang hoạt động
              </span>
            )}
          </div>

          <div className="p-4 flex flex-col flex-1 min-h-0 bg-slate-900">
            <div className="relative w-full flex-1 rounded-2xl border border-cyan-400/20 bg-linear-to-br from-slate-900/80 via-slate-950 to-slate-900 overflow-hidden min-h-0">
              <Simulator3D
                state={droneState}
                hudTitle={hudTitle}
                hudDescription={hudDescription}
                hudOrigin={hudOrigin}
                hudAxisHints={hudAxisHints}
                goal={goal}
                obstacles={obstacles}
                headingBase={headingBaseValue}
                colorConfig={
                  currentMode === "sandbox"
                    ? {
                        drone: {
                          fuselage: colorConfig.drone.fuselage,
                          fuselageEmissive: colorConfig.drone.fuselageEmissive,
                          nose: colorConfig.drone.nose,
                          noseEmissive: colorConfig.drone.noseEmissive,
                          canopy: colorConfig.drone.canopy,
                          wings: colorConfig.drone.wings,
                          rotor: colorConfig.drone.rotor,
                          rotorEmissive: colorConfig.drone.rotorEmissive,
                        },
                        map: colorConfig.map,
                        ambient: colorConfig.ambient,
                      }
                    : undefined
                }
                displayConfig={displayConfig}
                ref={simRef}
              />
            </div>
            
          </div>
        </div>
      </div>

      {/* Settings Modal - chỉ hiển thị khi sandbox */}
      {currentMode === "sandbox" && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          config={colorConfig}
          onSave={saveConfig}
          onReset={resetConfig}
          displayConfig={displayConfig}
          onSaveDisplay={(cfg: any) => setDisplayConfig(cfg)}
          onResetDisplay={() => setDisplayConfig({ ...DEFAULT_DISPLAY_CONFIG })}
        />
      )}
    </div>
  );
}
