"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Toolbar from "@/components/sandbox/Toolbar";
import BlocklyWorkspace from "@/components/sandbox/BlocklyWorkspace";
import Simulator3D from "@/components/simulator/Simulator3D";
import {
  buildToolboxXml,
  SANDBOX_TOOLBOX_CATEGORIES,
  generateProgram,
} from "@/lib/blockly";
import type { DroneState } from "@/lib/simulator/droneSimulator";
import type * as BlocklyType from "blockly/core";
import { SIM_CANVAS } from "@/lib/config3D/simConfig";
import { useDroneController } from "@/hooks/useDroneController";
import { useSandboxColors } from "@/hooks/useSandboxColors";
import { useTranslations } from "@/providers/i18n-provider";
import SettingsModal from "@/components/sandbox/SettingsModal";
import { DEFAULT_DISPLAY_CONFIG } from "@/lib/config3D/displayDefaults";

const SANDBOX_ORIGIN = {
  x: SIM_CANVAS.width / 2,
  y: SIM_CANVAS.height / 2,
  z: 0,
};

// Initial state for Sandbox
const INITIAL_STATE: DroneState = {
  x: SANDBOX_ORIGIN.x,
  y: SANDBOX_ORIGIN.y,
  altitude: 0,
  headingDeg: 0,
};

export default function SandboxPage() {
  const t = useTranslations("Sandbox");
  const [status, setStatus] = useState<string>("ready");
  const [droneState, setDroneState] = useState<DroneState>(INITIAL_STATE);
  const [hasBlocks, setHasBlocks] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Refs
  const simRef = useRef<any>(null);
  const blocklyContextRef = useRef<{
    Blockly: typeof BlocklyType;
    workspace: BlocklyType.WorkspaceSvg;
  } | null>(null);
  const lastProgramRef = useRef<any[] | null>(null);
  const debugIntervalRef = useRef<number | null>(null);

  // Settings & Config
  const { config: colorConfig, saveConfig, resetConfig } = useSandboxColors();
  const [displayConfig, setDisplayConfig] = useState(() => ({
    ...DEFAULT_DISPLAY_CONFIG,
  }));

  // Run Mode & Debug State
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isDebugPlaying, setIsDebugPlaying] = useState(false);
  const [isDebugFinished, setIsDebugFinished] = useState(false);

  // Controller
  const controller = useDroneController({
    initialState: INITIAL_STATE,
    onDroneStateChange: setDroneState,
    onStatusChange: setStatus,
  });

  const [queueLen, setQueueLen] = useState<number>(0);

  // Sync queue length
  useEffect(() => {
    if (controller) {
      setQueueLen(controller.getQueueLength());
    }
  }, [controller, droneState, status]);

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

  const toolboxXml = useMemo(
    () =>
      buildToolboxXml(SANDBOX_TOOLBOX_CATEGORIES, {
        categories: {
          motion: t("blockly.categories.motion"),
          loops: t("blockly.categories.loops"),
          logic: t("blockly.categories.logic"),
          sensors: t("blockly.categories.sensors"),
          math: t("blockly.categories.math"),
          effects: t("blockly.categories.effects"),
          input: t("blockly.categories.input"),
          variables: t("blockly.categories.variables"),
        },
      }),
    [t]
  );

  // --- Actions ---

  const handleReset = useCallback(() => {
    controller.reset(INITIAL_STATE);
    setDroneState(INITIAL_STATE);
    setStatus("ready");
    simRef.current?.clearTrail?.();
    lastProgramRef.current = null;
    setIsDebugMode(false);
    setIsDebugPlaying(false);
    setIsDebugFinished(false);
    if (debugIntervalRef.current !== null) {
      cancelAnimationFrame(debugIntervalRef.current);
      debugIntervalRef.current = null;
    }
  }, [controller]);

  const handleRun = useCallback(() => {
    // Stop debug if running
    if (isDebugMode) {
      if (debugIntervalRef.current !== null) {
        cancelAnimationFrame(debugIntervalRef.current);
        debugIntervalRef.current = null;
      }
      setIsDebugPlaying(false);
      setIsDebugMode(false);
    }

    if (!hasBlocks || status === "running") return;
    if (!blocklyContextRef.current) return;

    const { Blockly, workspace } = blocklyContextRef.current;
    const program = generateProgram(Blockly, workspace);

    if (program.length === 0) return;

    if (program.length === 0) return;

    // Always restart mode
    setStatus("running");
    setDroneState(INITIAL_STATE);
    controller.stop();
    controller.reset(INITIAL_STATE);
    simRef.current?.clearTrail?.();
    controller.enqueueMany(program);
    lastProgramRef.current = program;
    controller.run();
  }, [droneState, isDebugMode, hasBlocks, status, controller, t]);

  // --- Debug Logic ---

  const startDebugMode = useCallback(() => {
    if (!blocklyContextRef.current) return;
    const { Blockly, workspace } = blocklyContextRef.current;
    const program = generateProgram(Blockly, workspace);
    if (program.length === 0) return;

    setDroneState(INITIAL_STATE);
    controller.stop();
    controller.reset(INITIAL_STATE);
    simRef.current?.clearTrail?.();
    controller.enqueueMany(program);
    lastProgramRef.current = program;

    setIsDebugMode(true);
    setIsDebugPlaying(false);
    setIsDebugFinished(false);
  }, [controller]);

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
    const program = lastProgramRef.current;
    // If lost program, try regenerate
    if (!program) {
      if (!blocklyContextRef.current) return;
      const { Blockly, workspace } = blocklyContextRef.current;
      const p = generateProgram(Blockly, workspace);
      if (p.length > 0) {
        lastProgramRef.current = p;
      } else {
        return;
      }
    }

    setDroneState(INITIAL_STATE);
    controller.stop();
    controller.reset(INITIAL_STATE);
    simRef.current?.clearTrail?.();
    if (lastProgramRef.current) {
      controller.enqueueMany(lastProgramRef.current);
    }

    setIsDebugMode(true);
    setIsDebugPlaying(false);
    setIsDebugFinished(false);
  }, [controller]);

  // UseEffect to watch for debug finish
  useEffect(() => {
    if (status === "finished" && isDebugMode) {
      setIsDebugPlaying(false);
      setIsDebugFinished(true);
      if (debugIntervalRef.current !== null) {
        cancelAnimationFrame(debugIntervalRef.current);
        debugIntervalRef.current = null;
      }
    }
  }, [status, isDebugMode, t]);

  // --- Render Helpers ---
  const hudAxisHints = [
    { label: "X", detail: "dương → phải" },
    { label: "Y", detail: "dương → lên (cao)" },
    { label: "Z", detail: "dương → lên (cao)" },
    { label: "Heading", detail: "0° = hướng lên" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/4 right-1/4 w-[40%] h-[40%] bg-sky-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)]" />
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/0 via-slate-950/20 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,6,23,0.6)_100%)]" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <Toolbar
          onRun={handleRun}
          onReset={handleReset}
          status={status}
          backLink={{ href: "/" }}
          hasBlocks={hasBlocks}
          // Debug
          onDebug={startDebugMode}
          onStartDebug={startDebugMode}
          onStopDebug={stopDebugMode}
          onStepDebug={stepDebug}
          onTogglePlayDebug={togglePlayDebug}
          onRepeatDebug={repeatDebug}
          debugActive={isDebugMode}
          isPlayingDebug={isDebugPlaying}
          isDebugFinished={isDebugFinished}
          remainingSteps={queueLen}
          // Settings
          showSettings={true}
          onSettingsClick={() => setIsSettingsOpen(true)}
        />

        <div className="flex-1 p-4 lg:p-6 pt-0 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Blockly (Equal share) */}
          <div className="flex flex-col bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden group hover:border-slate-600 transition-colors">
            <div className="px-5 py-3 border-b border-slate-700 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_purple]" />
                <span className="font-bold text-slate-300 tracking-wide text-sm uppercase">
                  {t("blockly.title")}
                </span>
              </div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              </div>
            </div>
            <div className="flex-1 relative bg-slate-900">
              <div className="absolute inset-0">
                <BlocklyWorkspace
                  toolboxXml={toolboxXml}
                  onWorkspaceReady={handleWorkspaceReady}
                  onBlocksChange={handleBlocksChange}
                />
              </div>
            </div>
          </div>

          {/* Right: Simulator (Equal share) */}
          <div className="flex flex-col bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden relative">
            <div className="px-5 py-3 border-b border-slate-700 bg-slate-950 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_cyan]" />
                <span className="font-bold text-slate-300 tracking-wide text-sm uppercase">
                  {t("simulator.title")}
                </span>
              </div>
            </div>

            <div className="flex-1 relative min-h-[400px] lg:min-h-0 bg-slate-900">
              <Simulator3D
                state={droneState}
                hudTitle=""
                hudDescription=""
                hudOrigin={SANDBOX_ORIGIN}
                hudAxisHints={hudAxisHints}
                // Color & Display
                colorConfig={{
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
                }}
                displayConfig={displayConfig}
                ref={simRef}
              />
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}
