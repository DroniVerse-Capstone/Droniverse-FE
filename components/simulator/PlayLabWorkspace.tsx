"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BlocklyWorkspace from "@/components/sandbox/BlocklyWorkspace";
import Simulator3D from "@/components/simulator/Simulator3D";
import { buildToolboxXml, SANDBOX_TOOLBOX_CATEGORIES, generateProgram } from "@/lib/blockly";
import type { DroneState } from "@/lib/simulator/droneSimulator";
import { SIMULATOR_CONFIG } from "@/lib/simulator/config";
import type * as BlocklyType from "blockly/core";
import { SIM_CANVAS } from "@/lib/config3D/simConfig";
import { useDroneController } from "@/hooks/useDroneController";
import { useTranslations } from "@/providers/i18n-provider";
import { LabContentData, LabSolution } from "@/types/lab";
import { FaPlay, FaRedo, FaBatteryFull, FaRegClock, FaGlobe, FaInfoCircle, FaTimesCircle, FaCheckCircle, FaBug, FaTerminal, FaTrophy, FaClock, FaCube, FaClipboardList } from "react-icons/fa";
import { projectToWorld, worldToCanvas } from "@/lib/config3D/simConfig";
import { Command } from "@/lib/simulator/droneSimulator";
import { validatePattern, validateFlightPattern, Point3D } from "@/lib/simulator/patternValidation";
import { MissionVictoryHUD } from "./MissionVictoryHUD";
import { calculateLabScore } from "@/lib/simulator/labScoring";




const playGameSound = (type: "coin" | "checkpoint" | "win" | "fail") => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === "coin") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "checkpoint") {
      osc.type = "square";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "win") {
      // Small fanfare
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === "fail") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) { }
};



type PlayLabProps = {
  labData: LabContentData;
  labMeta?: any;
  mode: "admin" | "student";
  initialBlocks?: string;
  onMissionComplete: (result: any) => void;
  onNext?: () => void;
  onExit: () => void;
};

export default function PlayLabWorkspace({
  labData,
  labMeta,
  mode,
  initialBlocks,
  onMissionComplete,
  onNext,
  onExit
}: PlayLabProps) {
  const t = useTranslations("Sandbox");
  const [status, setStatus] = useState<string>("ready");
  const [showMissionBrief, setShowMissionBrief] = useState(true);

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [fuelRemaining, setFuelRemaining] = useState<number>(labData.rule.fuelLimit || 100);
  const [timeLeft, setTimeLeft] = useState<number>(labData.rule.timeLimit || 0);

  const [collectedCheckpoints, setCollectedCheckpoints] = useState<Set<string>>(new Set());
  const [collectedBonuses, setCollectedBonuses] = useState<Set<string>>(new Set());

  const [missionEndState, setMissionEndState] = useState<"success" | "failed" | null>(null);
  const [studentFinalMetrics, setStudentFinalMetrics] = useState<LabSolution['metrics'] | null>(null);
  const [showScoring, setShowScoring] = useState(false);
  const [failReason, setFailReason] = useState<string>("");
  const [sessionKey, setSessionKey] = useState<number>(0);
  const [isWorkspaceDirty, setIsWorkspaceDirty] = useState(false);
  const [dronePathHistory, setDronePathHistory] = useState<Point3D[]>([]);
  const [completedPatterns, setCompletedPatterns] = useState<Set<string>>(new Set());

  const canvasConfig = useMemo(() => {
    const cells = labData.map?.cells || 20;
    const size = cells * 200;
    return {
      width: size,
      height: size,
      padding: SIMULATOR_CONFIG.world.canvas.padding,
    };
  }, [labData.map?.cells]);

  const canvasCenter = useMemo(() => ({
    x: canvasConfig.width / 2,
    y: canvasConfig.height / 2,
  }), [canvasConfig]);

  const sandboxOrigin = useMemo(() => ({
    x: canvasCenter.x,
    y: canvasCenter.y,
    z: 0
  }), [canvasCenter]);

  const checkpoints = useMemo(() => labData.objects.filter((o: any) => o.objectType === 'checkpoint'), [labData]);
  const totalCheckpoints = checkpoints.length;

  const bonuses = useMemo(() => labData.objects.filter((o: any) => o.objectType === 'bonus'), [labData]);
  const currentScore = useMemo(() => {
    return bonuses.reduce((acc, obj: any) => {
      if (collectedBonuses.has(obj.id)) return acc + (obj.scoreValue || 0);
      return acc;
    }, 0);
  }, [bonuses, collectedBonuses]);

  const initialState = useMemo<DroneState>(() => {
    const droneObj = labData.objects?.find((o: any) => o.modelUrl === "primitive:drone");
    if (droneObj) {
      const { x, y } = worldToCanvas(droneObj.position[0], droneObj.position[2], canvasCenter);
      return {
        x,
        y,
        altitude: droneObj.position[1] * 10 || 0,
        headingDeg: droneObj.rotation ? 180 - (droneObj.rotation[1] * 180) / Math.PI : 0,
      };
    }
    return {
      x: sandboxOrigin.x,
      y: sandboxOrigin.y,
      altitude: 0,
      headingDeg: 0,
    };
  }, [labData.objects, canvasCenter, sandboxOrigin]);

  const [droneState, setDroneState] = useState<DroneState>(initialState);
  const [hasBlocks, setHasBlocks] = useState<boolean>(false);

  const simRef = useRef<any>(null);
  const [blocklyContext, setBlocklyContext] = useState<{
    Blockly: typeof BlocklyType;
    workspace: BlocklyType.WorkspaceSvg;
  } | null>(null);

  const controller = useDroneController({
    initialState,
    onDroneStateChange: setDroneState,
    onStatusChange: setStatus,
    worldConfig: canvasConfig,
  });

  const handleWorkspaceReady = useCallback(
    (context: { Blockly: typeof BlocklyType; workspace: BlocklyType.WorkspaceSvg }) => {
      console.log("✅ Blockly Workspace is READY and SET to state");
      setBlocklyContext(context);

      const { Blockly, workspace } = context;
      workspace.addChangeListener((e: any) => {
        if (!e.isUiEvent) {
          setIsWorkspaceDirty(true);
        }

        if (e.type === Blockly.Events.BLOCK_CHANGE ||
          e.type === Blockly.Events.BLOCK_CREATE ||
          e.type === Blockly.Events.BLOCK_DELETE) {
          const toolbox = workspace.getToolbox() as any;
          if (toolbox && typeof toolbox.refreshSelection === 'function') {
            toolbox.refreshSelection();
          }
        }
      });
    },
    []
  );

  useEffect(() => {
    const xmlToLoad = mode === "student" ? initialBlocks : labData.solution?.xml;

    if (blocklyContext && xmlToLoad) {
      console.log(`🚀 STARTING LOAD PROCESS (${mode} mode)...`);
      try {
        const { Blockly, workspace } = blocklyContext;

        workspace.clear();
        const xml = Blockly.utils.xml.textToDom(xmlToLoad);

        Blockly.Events.disable();
        try {
          Blockly.Xml.domToWorkspace(xml, workspace);
          setHasBlocks(true);
        } finally {
          Blockly.Events.enable();
        }

        setTimeout(() => {
          setIsWorkspaceDirty(false);
          console.log("✨ Initial blocks/solution loaded and dirty flag reset");
        }, 50);

        setTimeout(() => {
          workspace.scrollCenter();
          console.log("🎯 Centered and Fitted");
        }, 200);
      } catch (e) {
        console.error("❌ XML Parsing/Loading Error:", e);
      }
    }
  }, [blocklyContext, initialBlocks, labData.solution?.xml, mode]);


  const toolboxXml = useMemo(
    () =>
      buildToolboxXml(SANDBOX_TOOLBOX_CATEGORIES, {
        categories: {
          motion: t("blockly.categories.motion"),
          loops: t("blockly.categories.loops"),
          logic: t("blockly.categories.logic"),
          sensors: t("blockly.categories.sensors"),
          math: t("blockly.categories.math"),
          variables: t("blockly.categories.variables"),
          functions: t("blockly.categories.functions"),
        },
      }, labData.rule?.allowedBlocks),
    [t, labData.rule?.allowedBlocks]
  );

  const handleRun = useCallback(() => {
    if (!hasBlocks || status === "running") return;
    if (!blocklyContext) return;

    const { Blockly, workspace } = blocklyContext;
    const program = generateProgram(Blockly, workspace);

    if (program.length === 0) return;

    setCollectedCheckpoints(new Set());
    setMissionEndState(null);
    setFuelRemaining(labData.rule.fuelLimit || 100);
    setTimeLeft(labData.rule.timeLimit || 0);
    setSessionKey(prev => prev + 1);

    setStatus("running");
    setDroneState(initialState);
    controller.stop();
    controller.reset(initialState);
    simRef.current?.clearTrail?.();
    controller.enqueueMany(program);
    controller.run();
  }, [hasBlocks, status, controller, labData, initialState]);

  useEffect(() => {
    if (controller && labData.objects) {
      const obstacles = labData.objects
        .filter((obj: any) => obj.objectType === "obstacle" || obj.objectType === "decor")
        .map((obj: any) => ({
          id: obj.id,
          type: obj.objectType || "static_mesh",
          position: obj.position,
          size: obj.size || obj.scale || [1, 1, 1],
          rotation: obj.rotation,
          raw: obj
        }));
      console.log(`📡 Controller: Loaded ${obstacles.length} physical volumes for collision.`);
      controller.setObstacles(obstacles);
    }
  }, [controller, labData.objects]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "running" && labData.rule.timeLimit && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status, labData.rule.timeLimit, timeLeft]);

  useEffect(() => {
    if (status === "crashed") {
      const timer = setTimeout(() => {
        setMissionEndState("failed");
        setFailReason("Phát hiện va chạm. Sứ mệnh thất bại do drone hỏng hóc.");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, t]);

  const handleReset = useCallback(() => {
    setCollectedCheckpoints(new Set());
    setCollectedBonuses(new Set());

    setMissionEndState(null);
    setFuelRemaining(labData.rule.fuelLimit || 100);
    setTimeLeft(labData.rule.timeLimit || 0);
    setSessionKey(prev => prev + 1);

    controller.reset(initialState);
    setDroneState(initialState);
    setStatus("ready");
    setDronePathHistory([]);
    setCompletedPatterns(new Set());
    simRef.current?.clearTrail?.();
  }, [controller, labData, initialState]);

  useEffect(() => {
    if (status !== "running" && status !== "finished") return;

    if (labData.rule.fuelLimit && (droneState.batteryConsumed || 0) > labData.rule.fuelLimit) {
      setStatus("finished");
      controller.stop();
      setMissionEndState("failed");
      setFailReason("Cạn kiệt năng lượng (Hết Pin) giữa chừng.");
      return;
    }

    if (labData.rule.timeLimit && timeLeft === 0) {
      setStatus("finished");
      controller.stop();
      setMissionEndState("failed");
      setFailReason("Hết thời gian quy định cho sứ mệnh.");
      return;
    }

    const droneWorld = projectToWorld(
      droneState.x ?? sandboxOrigin.x,
      droneState.y ?? sandboxOrigin.y,
      droneState.altitude,
      canvasCenter
    );

    labData.objects.forEach((obj: any) => {
      if (obj.objectType === "checkpoint" && !collectedCheckpoints.has(obj.id)) {
        if (labData.rule.sequentialCheckpoints) {
          const nextCp = checkpoints[collectedCheckpoints.size];
          if (nextCp && nextCp.id !== obj.id) return;
        }

        const distXZ = Math.hypot(obj.position[0] - droneWorld.x, obj.position[2] - droneWorld.z);
        const distY = Math.abs(obj.position[1] - droneWorld.y);

        // Tính toán bán kính linh hoạt theo Scale của vật thể (nếu user phóng to)
        const baseRadius = obj.radius ?? (obj.scale ? Math.max(obj.scale[0], obj.scale[2]) * 2.0 : 4.0);

        // Nới rộng vùng Hitbox của Checkpoint để dễ ăn hơn (Đặc biệt là chiều cao Y)
        if (distXZ <= baseRadius + 1.5 && distY <= (obj.scale ? obj.scale[1] * 2.0 : 4.0) + 1.0) {
          setCollectedCheckpoints((prev) => {
            if (prev.has(obj.id)) return prev;
            playGameSound("checkpoint");
            const next = new Set(prev);
            next.add(obj.id);
            return next;
          });
        }
      }
      // 2. Bonus Point Collision
      else if (obj.objectType === "bonus" && !collectedBonuses.has(obj.id)) {
        const distXZ = Math.hypot(obj.position[0] - droneWorld.x, obj.position[2] - droneWorld.z);
        const distY = Math.abs(obj.position[1] - droneWorld.y);

        // Tính toán bán kính dựa trên Scale (Diamond, Heart, Star)
        // Nếu user phóng to cực lớn trong Editor, radius Hitbox cũng lớn theo
        const baseRadius = obj.radius ?? (obj.scale ? Math.max(obj.scale[0], obj.scale[2]) * 1.5 : 2.0);

        // Nới rộng vùng Hitbox của Bonus để hút vào dễ hơn khi drone bay ngang qua
        if (distXZ <= baseRadius + 1.5 && distY <= (obj.scale ? obj.scale[1] * 1.5 : 2.0) + 2.0) {
          setCollectedBonuses((prev) => {
            if (prev.has(obj.id)) return prev;
            playGameSound("coin");
            const next = new Set(prev);
            next.add(obj.id);
            return next;
          });
        }
      }
    });

    // 3. Record Path History (Full 3D: X, Altitude as Y, Z)
    if (status === "running") {
      setDronePathHistory(prev => {
        const last = prev[prev.length - 1];
        if (last && last.x === droneState.x && last.y === droneState.altitude && last.z === droneState.y) return prev;
        return [...prev, { x: droneState.x ?? 0, y: droneState.altitude ?? 0, z: droneState.y ?? 0 }];
      });
    }

  }, [droneState.x, droneState.y, droneState.altitude, droneState.batteryConsumed, status, labData.rule.fuelLimit, labData.rule.sequentialCheckpoints, labData.objects, collectedCheckpoints, collectedBonuses, checkpoints, controller]);

  const allCheckpointsCollected = totalCheckpoints === 0 || collectedCheckpoints.size === totalCheckpoints;
  const hasEnoughScore = !labData.rule.requiredScore || currentScore >= labData.rule.requiredScore;

  // Patterns Check - Using new rich validation engine
  const patternObjects = useMemo(() => labData.objects.filter((obj: any) => obj.objectType === "pattern"), [labData.objects]);

  const patternResults = useMemo(() => {
    return patternObjects.map(obj => {
      return {
        id: obj.id,
        shape: obj.shape,
        report: validateFlightPattern(dronePathHistory, obj, canvasCenter)
      };
    });
  }, [dronePathHistory, patternObjects]);

  const allPatternsCompleted = useMemo(() => {
    if (patternObjects.length === 0) return true;
    return patternResults.every(res => res.report.success);
  }, [patternResults, patternObjects]);

  // End State: Check Mission Success
  useEffect(() => {
    if (status === "finished" && missionEndState === null) {
      // --- CAPTURE METRICS FOR HUD ---
      const { Blockly, workspace } = blocklyContext || {};

      const getAccurateBlockCount = (w: any) => {
        if (!w || !Blockly) return 0;
        try {
          const dom = Blockly.Xml.workspaceToDom(w);
          return dom.getElementsByTagName('block').length;
        } catch (e) {
          return w.getAllBlocks(false).filter((b: any) => !b.isShadow()).length;
        }
      };

      const blockCount = getAccurateBlockCount(workspace);
      const isBlockCountValid = !labData.rule.maxBlocks || blockCount <= labData.rule.maxBlocks;

      if (allCheckpointsCollected && hasEnoughScore && allPatternsCompleted && isBlockCountValid) {
        const program = (Blockly && workspace) ? generateProgram(Blockly, workspace) : [];

        setStudentFinalMetrics({
          timeSpent: labData.rule.timeLimit ? (labData.rule.timeLimit - timeLeft) : 0,
          fuelConsumed: droneState.batteryConsumed || 0,
          logicalDistance: calculateLogicalDistance(program) / 200,
          blockCount: blockCount
        });
        // -------------------------------

        // Delay a bit so the user can see the drone stop
        const timer = setTimeout(() => {
          playGameSound("win");
          setMissionEndState("success");
        }, 800);
        return () => clearTimeout(timer);
      } else {
        // Determine failure reason
        let reason = "Bạn đã hoàn thành đường bay ";
        const { workspace } = blocklyContext || {};
        const getAccurateBlockCount = (w: any) => {
          if (!w || !Blockly) return 0;
          try {
            const dom = Blockly.Xml.workspaceToDom(w);
            return dom.getElementsByTagName('block').length;
          } catch (e) {
            return w.getAllBlocks(false).filter((b: any) => !b.isShadow()).length;
          }
        };

        const blockCount = getAccurateBlockCount(workspace);
        const isBlockCountValid = !labData.rule.maxBlocks || blockCount <= labData.rule.maxBlocks;

        if (!allCheckpointsCollected) reason += "nhưng KHÔNG vượt qua tất cả Checkpoint.";
        else if (!allPatternsCompleted) reason += "nhưng bay KHÔNG đúng quỹ đạo yêu cầu.";
        else if (!hasEnoughScore) reason += `nhưng KHÔNG đạt đủ điểm số yêu cầu (${currentScore}/${labData.rule.requiredScore} điểm).`;
        else if (!isBlockCountValid) reason += `nhưng sử dụng QUÁ số lượng khối cho phép (${blockCount}/${labData.rule.maxBlocks} khối).`;
        else reason += "nhưng có lỗi phát sinh.";

        playGameSound("fail");
        setMissionEndState("failed");
        setFailReason(reason);
      }
    }
  }, [allCheckpointsCollected, hasEnoughScore, allPatternsCompleted, currentScore, status, missionEndState, labData.rule.requiredScore, blocklyContext, labData.rule.timeLimit, timeLeft, droneState.batteryConsumed, labData.rule.maxBlocks]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col h-full w-full bg-slate-950 font-sans text-white overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/0 via-slate-950/20 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
      </div>

      {/* MISSION BRIEFING OVERLAY MODAL */}
      {showMissionBrief && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 sm:p-6">
          <div className="bg-[#0c0d12] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-xl max-w-4xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative">

            {/* Header - Refined & Minimal */}
            <div className="relative border-b border-white/5 px-8 py-5 flex items-center gap-4 bg-white/[0.02] shrink-0">
              <div className="w-10 h-10 rounded-md bg-rose-500/10 border border-rose-500/20 flex items-center justify-center ring-4 ring-rose-500/5">
                <FaInfoCircle className="text-rose-500 text-lg" />
              </div>
              <div>
                <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-0.5">Thông tin tài liệu hướng dẫn</h2>
                <h1 className="text-xl font-bold text-white tracking-wide">{labMeta?.nameVN || "Bài tập chưa đặt tên"}</h1>
              </div>
            </div>

            {/* Body - Restricted Height with Red Accents */}
            <div className="relative px-8 py-6 flex flex-col gap-6 overflow-hidden">

              {/* Mission Intel Section */}
              <div className="flex flex-col gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 rounded-md bg-rose-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Nội dung nhiệm vụ cần thực hiện
                  </span>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-md px-5 py-4 relative">
                  <div className="max-h-[140px] md:max-h-[180px] overflow-y-auto custom-scrollbar pr-3">
                    <p className="text-sm text-slate-300 leading-relaxed font-medium selection:bg-rose-500/30">
                      {(labMeta?.descriptionVN || "Không có nội dung bài tập cụ thể. Hoàn thành mục tiêu để vượt qua bài học.").replace(/\\n/g, '\n')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rules Grid - High tech Red HUD Style */}
              {(labData.rule.timeLimit || labData.rule.fuelLimit || labData.rule.requiredScore || labData.rule.sequentialCheckpoints || totalCheckpoints > 0) ? (
                <div className="flex flex-col gap-5 shrink-0 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Checkpoints Status */}
                    {totalCheckpoints > 0 && (
                      <div className="relative rounded-md border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-3 transition-all hover:bg-white/[0.04]">
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                            <FaCheckCircle className="text-rose-400 text-sm" />
                          </div>
                          {labData.rule.sequentialCheckpoints && (
                            <span className="text-[8px] font-black text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 uppercase">Tuần tự</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Mục tiêu trạm</span>
                          <span className="text-lg font-bold text-white leading-none mt-1">{totalCheckpoints} <span className="text-[9px] font-normal opacity-50 uppercase tracking-tighter">Vị trí</span></span>
                        </div>
                      </div>
                    )}

                    {/* Minimum Score */}
                    {labData.rule.requiredScore > 0 && (
                      <div className="relative rounded-md border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-3 transition-all hover:bg-white/[0.04]">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                          <FaTrophy className="text-rose-400 text-sm" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Điểm số yêu cầu</span>
                          <span className="text-lg font-bold text-white leading-none mt-1">{labData.rule.requiredScore} <span className="text-[9px] font-normal opacity-50 uppercase tracking-tighter">Điểm</span></span>
                        </div>
                      </div>
                    )}

                    {/* Execution Window */}
                    {(labData.rule.timeLimit ?? 0) > 0 && (
                      <div className="relative rounded-md border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-3 transition-all hover:bg-white/[0.04]">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                          <FaClock className="text-rose-400 text-sm" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Giới hạn thời gian</span>
                          <span className="text-lg font-bold text-white leading-none mt-1">{labData.rule.timeLimit} <span className="text-[9px] font-normal opacity-50 uppercase tracking-tighter">Giây</span></span>
                        </div>
                      </div>
                    )}

                    {/* Operational Energy */}
                    {(labData.rule.fuelLimit ?? 0) > 0 && (
                      <div className="relative rounded-md border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-3 transition-all hover:bg-white/[0.04]">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                          <FaBatteryFull className="text-rose-400 text-sm" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Năng lượng tối đa</span>
                          <span className="text-lg font-bold text-white leading-none mt-1">{labData.rule.fuelLimit} <span className="text-[9px] font-normal opacity-50 uppercase tracking-tighter">Đơn vị</span></span>
                        </div>
                      </div>
                    )}

                    {/* Block Limit Rule */}
                    {(labData.rule.maxBlocks ?? 0) > 0 && (
                      <div className="relative rounded-md border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-3 transition-all hover:bg-white/[0.04]">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                          <FaCube className="text-rose-400 text-sm" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Số lượng khối lệnh</span>
                          <span className="text-lg font-bold text-white leading-none mt-1">{labData.rule.maxBlocks} <span className="text-[9px] font-normal opacity-50 uppercase tracking-tighter">Khối tối đa</span></span>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer - Solid Command */}
            <div className="relative px-8 py-6 border-t border-white/5 bg-white/[0.01] flex justify-end shrink-0">
              <button
                onClick={() => setShowMissionBrief(false)}
                className="group relative px-10 py-3 font-bold text-xs uppercase tracking-widest rounded transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-rose-600 group-hover:bg-rose-500 transition-colors" />
                <div className="absolute inset-0 shadow-[0_0_20px_rgba(225,29,72,0.3)] group-hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] transition-all" />
                <span className="relative z-10 text-white flex items-center gap-3">
                  Bắt đầu làm bài <FaPlay className="text-[9px]" />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CENTERED MODALS REMOVED — USING INTEGRATED PANEL BELOW SIMULATOR */}

      {/* TOP NAVIGATION BAR — EDITOR STYLE */}
      <div className="relative z-20 flex items-center justify-between px-6 py-3.5 bg-[#0f1117] border-b border-[#2a2d3a]">
        {/* LEFT: Exit + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-semibold text-slate-400 hover:text-slate-100 bg-[#1e2030] hover:bg-[#252840] border border-[#2e3249] transition-all active:scale-95"
          >
            ← Thoát
          </button>

          <div className="w-px h-6 bg-[#2a2d3a]" />

          <div className="flex flex-col gap-1">
            <h1 className="text-[12px] font-semibold text-slate-100 leading-none tracking-wide">
              {mode === "admin" ? "[Kiểm thử] Bài tập lập trình" : "Bài tập lập trình"}
            </h1>
            <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Sẵn sàng thực hiện
            </span>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2">
          {/* Info */}
          <button
            onClick={() => setShowMissionBrief(true)}
            className="flex items-center gap-2 px-3 h-9 rounded text-slate-300 hover:text-white hover:bg-[#1e2030] border border-[#2a2d3a] hover:border-[#3a3f5a] transition-all"
          >
            <FaClipboardList className="text-sm" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Đề bài</span>
          </button>


          {/* Reset */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded text-[11px] font-semibold text-slate-400 hover:text-slate-100 bg-[#1e2030] hover:bg-[#252840] border border-[#2e3249] transition-all active:scale-95"
          >
            <FaRedo className="text-[9px]" />
            Đặt lại
          </button>

          {/* Run — Red CTA */}
          <button
            onClick={handleRun}
            disabled={!hasBlocks || status === "running"}
            className="flex items-center gap-2.5 px-5 py-2 rounded text-[11px] font-semibold text-white bg-red-600 hover:bg-red-500 border border-red-700 shadow-lg disabled:opacity-40 disabled:grayscale transition-all active:scale-95 min-w-[130px] justify-center"
          >
            <FaPlay className="text-[9px]" />
            {status === "running" ? "Đang chạy..." : "▶ Bắt đầu chạy"}
          </button>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="relative z-10 flex-1 flex p-4 gap-4 overflow-hidden">

        {/* LEFT: BLOCKLY */}
        <div className="w-1/2 flex flex-col rounded overflow-hidden shadow-2xl border border-white/10 bg-slate-900/50">
          <div className="px-5 py-2.5 bg-slate-950/60 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              Bảng Lệnh
            </span>
          </div>
          <div className="flex-1 relative">
            <BlocklyWorkspace
              toolboxXml={toolboxXml}
              onWorkspaceReady={handleWorkspaceReady}
              onBlocksChange={setHasBlocks}
            />
          </div>
        </div>

        {/* RIGHT: SIMULATOR & TELEMETRY HUD */}
        <div className="w-1/2 flex flex-col rounded overflow-hidden shadow-2xl border border-white/10 bg-slate-900/50 relative">



          <div className="px-5 py-2.5 bg-slate-950/60 border-b border-white/10 flex items-center justify-between z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              Góc Nhìn Thực Tế
            </span>
          </div>

          <div className="flex-1 relative bg-black overflow-hidden">
            {/* IN-GAME HOLOGRAPHIC HUD */}
            <div className="absolute top-3 inset-x-4 z-20 pointer-events-none flex justify-between items-start">
              {/* Top-Left: Drone Vitals (Energy) */}
              <div className="flex flex-col gap-2 pointer-events-auto">
                {labData.rule.fuelLimit && labData.rule.fuelLimit > 0 ? (
                  <div className="bg-black/40 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-md min-w-[130px] shadow-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/90 flex items-center gap-1.5">
                        <FaBatteryFull /> Năng Lượng
                      </span>
                      <span className="text-[9px] font-mono text-white/90">
                        {Math.max(0, Math.round((labData.rule.fuelLimit || 100) - (droneState.batteryConsumed || 0)))}U
                      </span>
                    </div>
                    <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-300"
                        style={{ width: `${Math.max(0, ((labData.rule.fuelLimit - (droneState.batteryConsumed || 0)) / labData.rule.fuelLimit) * 100)}%` }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Top-Right: Mission Status */}
              <div className="flex flex-col gap-2 items-end pointer-events-auto">
                {totalCheckpoints > 0 && (
                  <div
                    key={collectedCheckpoints.size}
                    className="bg-black/40 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded shadow-lg flex flex-col gap-1 items-end animate-in zoom-in-105 duration-300"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/90 flex items-center gap-1.5">
                      <FaGlobe /> Mục Tiêu ({collectedCheckpoints.size}/{totalCheckpoints})
                    </span>
                    <div className="flex gap-1 mt-0.5">
                      {Array.from({ length: totalCheckpoints }).map((_, idx) => (
                        <div key={idx} className={`w-3.5 h-1 rounded-full transition-all duration-500 ${idx < collectedCheckpoints.size ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-white/20'}`} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Score Indicator */}
                {(labData.rule.requiredScore > 0 || bonuses.length > 0) && (
                  <div key={`score-${currentScore}`} className="relative bg-black/60 backdrop-blur-md border border-fuchsia-500/40 px-4 py-2 rounded shadow-[0_0_20px_rgba(217,70,239,0.3)] flex items-center gap-3 animate-in fade-in zoom-in-105 duration-300 overflow-hidden">
                    {/* Hiệu ứng trượt lấp lánh (Shimmer) */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_2s_infinite]" />
                    <div className="absolute inset-0 bg-gradient-to-tl from-fuchsia-500/10 to-transparent pointer-events-none" />

                    <span className="relative z-10 text-[10px] font-black uppercase tracking-widest text-fuchsia-300/90 flex items-center gap-1.5">
                      <FaTrophy className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,1)] text-sm" /> ĐIỂM
                    </span>
                    <span className="relative z-10 text-base font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-fuchsia-200 drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]">
                      {currentScore}
                      {labData.rule.requiredScore > 0 && (
                        <span className="text-fuchsia-500/70 text-[11px] ml-1">/ {labData.rule.requiredScore}</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Top-Center: EPIC TIMER CAPSULE (Compact) */}
            {labData.rule.timeLimit && labData.rule.timeLimit > 0 ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className={`px-4 py-1 rounded border backdrop-blur-sm flex items-center gap-2 shadow-lg transition-colors duration-300 ${timeLeft <= 10 ? 'bg-red-950/60 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-black/40 border-white/10'}`}>
                  <FaRegClock className={`text-[11px] ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-sky-400/90'}`} />
                  <span className={`text-sm font-mono font-bold tracking-widest ${timeLeft <= 10 ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'text-white/90 drop-shadow-md'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>
            ) : null}

            <Simulator3D
              state={droneState}
              status={status}
              failReason={failReason}
              hudTitle={labMeta?.nameVN || ""}
              hudDescription={labMeta?.descriptionVN || ""}
              hudOrigin={sandboxOrigin}
              hudAxisHints={[]}
              objects={labData.objects}
              completedCheckpoints={collectedCheckpoints}
              completedBonuses={collectedBonuses}
              isSequential={labData.rule.sequentialCheckpoints}
              sessionKey={sessionKey}
              theme={labData.map?.theme || "default"}
              ref={simRef}
              debugBounds={SIMULATOR_CONFIG.debug.showBounds ? controller.getObstacleBounds() : []}
              mapSize={canvasConfig.width}
              patternResults={patternResults}
            />
          </div>
        </div>
      </div>

      {/* MISSION VICTORY HUD (ONLY AFTER CLICKING SUBMIT) */}
      {showScoring && studentFinalMetrics && (
        <MissionVictoryHUD
          studentMetrics={studentFinalMetrics}
          adminMetrics={labData.solution?.metrics}
          onRetry={() => {
            setShowScoring(false);
            handleReset();
          }}
          onNext={onNext}
        />
      )}

      {/* STANDARD MISSION END OVERLAY (SUCCESS OR FAILED) */}
      {missionEndState && !showScoring && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-slate-950/40 backdrop-blur-2xl backdrop-saturate-150 animate-in fade-in duration-700">
          <div className="w-full max-w-3xl bg-[#0d0f14]/80 border border-white/10 rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden relative flex flex-col md:flex-row animate-in zoom-in-95 slide-in-from-bottom-12 duration-700 ease-out">

            {/* Left: Visual Impact Section */}
            <div className={`w-full md:w-1/2 p-12 flex flex-col items-center justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-white/10 ${missionEndState === "success" ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
              {/* Animated Background Mesh */}
              <div className={`absolute -inset-10 opacity-30 blur-[80px] animate-pulse ${missionEndState === "success" ? 'bg-emerald-500' : 'bg-red-500'}`} />

              <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Glowing Status Icon */}
                <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black/40 border-2 ${missionEndState === "success" ? 'border-emerald-500 text-emerald-500 shadow-emerald-500/20' : 'border-red-500 text-red-500 shadow-red-500/20'}`}>
                  {missionEndState === "success" ? (
                    <FaCheckCircle className="text-6xl animate-in zoom-in-50 duration-500" />
                  ) : (
                    <FaTimesCircle className="text-6xl animate-in zoom-in-50 duration-500" />
                  )}
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none italic">
                    {missionEndState === "success" ? t("missionEnd.successTitle") : t("missionEnd.failTitle")}
                  </h2>
                  <div className={`h-1 w-12 mx-auto rounded-full ${missionEndState === "success" ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </div>
              </div>
            </div>

            {/* Right: Data & Actions Section */}
            <div className="w-full md:w-1/2 p-12 bg-black/40 backdrop-blur-xl flex flex-col gap-8">
              {/* Minimalist Premium Header */}
              <div className="space-y-3 mb-2 px-1">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${missionEndState === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'} animate-pulse`} />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    {missionEndState === "success" ? t("missionEnd.successStatus") : t("missionEnd.failStatus")}
                  </h3>
                </div>
                <p className="text-[17px] font-bold text-white/95 leading-snug">
                  {missionEndState === "success"
                    ? (isWorkspaceDirty ? t("missionEnd.successDesc") : t("missionEnd.successDescSolution"))
                    : (failReason || t("missionEnd.failDesc"))
                  }
                </p>
              </div>

              {/* High-Fidelity HUD Diagnostics (Compact) */}
              <div className="flex flex-col gap-2 mt-2 w-full max-h-[250px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                {/* Safety Row */}
                <div className={`relative overflow-hidden flex items-center p-2.5 pl-4 rounded border bg-[#0d0f14]/80 backdrop-blur-md transition-all ${status !== "crashed" ? 'border-emerald-500/20' : 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${status !== "crashed" ? 'bg-emerald-500' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`} />

                  <div className="w-[85px] shrink-0">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("missionEnd.safety")}</span>
                  </div>

                  <div className="flex-1 min-w-0 pr-3">
                    <span className="text-[11px] font-bold text-white block truncate">{status !== "crashed" ? t("missionEnd.systemStable") : t("missionEnd.collisionWarning")}</span>
                  </div>

                  <div className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-black tracking-widest border ${status !== "crashed" ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                    {status !== "crashed" ? t("missionEnd.pass") : t("missionEnd.fail")}
                  </div>
                </div>

                {/* Objectives Row */}
                {totalCheckpoints > 0 && (
                  <div className={`relative overflow-hidden flex items-center p-2.5 pl-4 rounded border bg-[#0d0f14]/80 backdrop-blur-md transition-all ${collectedCheckpoints.size === totalCheckpoints ? 'border-emerald-500/20' : 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${collectedCheckpoints.size === totalCheckpoints ? 'bg-emerald-500' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`} />

                    <div className="w-[85px] shrink-0">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("missionEnd.objectives")}</span>
                    </div>

                    <div className="flex-1 min-w-0 pr-3">
                      <span className="text-[11px] font-mono font-bold text-white block truncate">{collectedCheckpoints.size} / {totalCheckpoints}</span>
                    </div>

                    <div className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-black tracking-widest border ${collectedCheckpoints.size === totalCheckpoints ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {collectedCheckpoints.size === totalCheckpoints ? t("missionEnd.pass") : t("missionEnd.fail")}
                    </div>
                  </div>
                )}

                {/* Score Row (Conditional) */}
                {(labData.rule.requiredScore > 0 || bonuses.length > 0) ? (
                  <div className={`relative overflow-hidden flex items-center p-2.5 pl-4 rounded border bg-[#0d0f14]/80 backdrop-blur-md transition-all ${hasEnoughScore ? 'border-emerald-500/20' : 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${hasEnoughScore ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`} />

                    <div className="w-[85px] shrink-0">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("missionEnd.score")}</span>
                    </div>

                    <div className="flex-1 min-w-0 pr-3">
                      <span className={`text-[11px] font-mono font-bold block truncate ${hasEnoughScore ? 'text-white' : 'text-slate-400'}`}>
                        {currentScore} {labData.rule.requiredScore > 0 && <span className="opacity-50 text-[10px] font-normal ml-1">/ {labData.rule.requiredScore} {t("missionEnd.required")}</span>}
                      </span>
                    </div>

                    <div className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-black tracking-widest border ${hasEnoughScore ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {hasEnoughScore ? t("missionEnd.pass") : t("missionEnd.fail")}
                    </div>
                  </div>
                ) : null}

                {/* Energy Row (Conditional) */}
                {labData.rule.fuelLimit && labData.rule.fuelLimit > 0 ? (
                  <div className={`relative overflow-hidden flex items-center p-2.5 pl-4 rounded border bg-[#0d0f14]/80 backdrop-blur-md transition-all ${(missionEndState === 'success' && fuelRemaining > 0) ? 'border-emerald-500/20' : (fuelRemaining <= 0 ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/10 opacity-70')}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${(missionEndState === 'success' && fuelRemaining > 0) ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : (fuelRemaining <= 0 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-slate-600')}`} />

                    <div className="w-[85px] shrink-0">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("missionEnd.energy")}</span>
                    </div>

                    <div className="flex-1 min-w-0 pr-3">
                      <span className={`text-[11px] font-mono font-bold block truncate ${(missionEndState === 'success' || fuelRemaining <= 0) ? 'text-white' : 'text-slate-400'}`}>
                        {Math.max(0, Math.floor(fuelRemaining))}% <span className="opacity-50 text-[10px] font-normal ml-1">{t("missionEnd.remaining")}</span>
                      </span>
                    </div>

                    <div className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-black tracking-widest border ${(missionEndState === 'success' && fuelRemaining > 0) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : (fuelRemaining <= 0 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white/5 text-slate-400 border-white/10')}`}>
                      {(missionEndState === 'success' && fuelRemaining > 0) ? t("missionEnd.pass") : (fuelRemaining <= 0 ? t("missionEnd.outOfBattery") : t("missionEnd.notFinished"))}
                    </div>
                  </div>
                ) : null}

                {/* Time Row (Conditional) */}
                {labData.rule.timeLimit && labData.rule.timeLimit > 0 ? (
                  <div className={`relative overflow-hidden flex items-center p-2.5 pl-4 rounded border bg-[#0d0f14]/80 backdrop-blur-md transition-all ${(missionEndState === 'success' && timeLeft > 0) ? 'border-emerald-500/20' : (timeLeft <= 0 ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/10 opacity-70')}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${(missionEndState === 'success' && timeLeft > 0) ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : (timeLeft <= 0 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-slate-600')}`} />

                    <div className="w-[85px] shrink-0">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("missionEnd.time")}</span>
                    </div>

                    <div className="flex-1 min-w-0 pr-3">
                      <span className={`text-[11px] font-mono font-bold block truncate ${(missionEndState === 'success' || timeLeft <= 0) ? 'text-white' : 'text-slate-400'}`}>
                        {labData.rule.timeLimit - timeLeft}s <span className="opacity-50 text-[10px] font-normal">/ {labData.rule.timeLimit}s</span>
                      </span>
                    </div>

                    <div className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-black tracking-widest border ${(missionEndState === 'success' && timeLeft > 0) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : (timeLeft <= 0 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white/5 text-slate-400 border-white/10')}`}>
                      {(missionEndState === 'success' && timeLeft > 0) ? t("missionEnd.pass") : (timeLeft <= 0 ? t("missionEnd.timeUp") : t("missionEnd.notFinished"))}
                    </div>
                  </div>
                ) : null}

                {/* Block Count Row (Conditional) */}
                {(labData.rule.maxBlocks ?? 0) > 0 && (
                  <div className={`relative overflow-hidden flex items-center p-2.5 pl-4 rounded border bg-[#0d0f14]/80 backdrop-blur-md transition-all ${(() => {
                    const { Blockly, workspace } = blocklyContext || {};
                    let bc = 0;
                    if (Blockly && workspace) {
                      const dom = Blockly.Xml.workspaceToDom(workspace);
                      bc = dom.getElementsByTagName('block').length;
                    }
                    return bc <= (labData.rule.maxBlocks ?? Infinity);
                  })() ? 'border-emerald-500/20' : 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${(() => {
                      const { Blockly, workspace } = blocklyContext || {};
                      let bc = 0;
                      if (Blockly && workspace) {
                        const dom = Blockly.Xml.workspaceToDom(workspace);
                        bc = dom.getElementsByTagName('block').length;
                      }
                      return bc <= (labData.rule.maxBlocks ?? Infinity);
                    })() ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`} />

                    <div className="w-[85px] shrink-0">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("missionEnd.blockCount")}</span>
                    </div>

                    <div className="flex-1 min-w-0 pr-3">
                      <span className={`text-[11px] font-mono font-bold block truncate ${(() => {
                        const { Blockly, workspace } = blocklyContext || {};
                        let bc = 0;
                        if (Blockly && workspace) {
                          const dom = Blockly.Xml.workspaceToDom(workspace);
                          bc = dom.getElementsByTagName('block').length;
                        }
                        return bc <= (labData.rule.maxBlocks ?? Infinity);
                      })() ? 'text-white' : 'text-slate-400'}`}>
                        {(() => {
                          const { Blockly, workspace } = blocklyContext || {};
                          if (Blockly && workspace) {
                            const dom = Blockly.Xml.workspaceToDom(workspace);
                            return dom.getElementsByTagName('block').length;
                          }
                          return 0;
                        })()} <span className="opacity-50 text-[10px] font-normal">/ {labData.rule.maxBlocks ?? 0} {t("missionEnd.required")}</span>
                      </span>
                    </div>

                    <div className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-black tracking-widest border ${(() => {
                      const { Blockly, workspace } = blocklyContext || {};
                      let bc = 0;
                      if (Blockly && workspace) {
                        const dom = Blockly.Xml.workspaceToDom(workspace);
                        bc = dom.getElementsByTagName('block').length;
                      }
                      return bc <= (labData.rule.maxBlocks ?? Infinity);
                    })() ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {(() => {
                        const { Blockly, workspace } = blocklyContext || {};
                        let bc = 0;
                        if (Blockly && workspace) {
                          const dom = Blockly.Xml.workspaceToDom(workspace);
                          bc = dom.getElementsByTagName('block').length;
                        }
                        return bc <= (labData.rule.maxBlocks ?? Infinity);
                      })() ? t("missionEnd.pass") : t("missionEnd.fail")}
                    </div>
                  </div>
                )}
                {patternResults.map((pr, pIdx) => (
                  <div key={pr.id} className={`relative overflow-hidden flex items-center p-2.5 pl-4 rounded border bg-[#0d0f14]/80 backdrop-blur-md transition-all ${pr.report.success ? 'border-emerald-500/20' : 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${pr.report.success ? 'bg-emerald-500' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'}`} />

                    <div className="w-[85px] shrink-0">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("missionEnd.pattern")} {pIdx + 1}</span>
                    </div>

                    <div className="flex-1 min-w-0 pr-3">
                      <span className="text-[11px] font-mono font-bold text-white block truncate">{t(`missionEnd.shape_${pr.shape?.toLowerCase()}`) || pr.shape?.toUpperCase() || ""}</span>
                    </div>

                    <div className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-black tracking-widest border ${pr.report.success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {pr.report.success ? t("missionEnd.pass") : t("missionEnd.fail")}
                    </div>
                  </div>
                ))}
              </div>


              {/* Actions */}
              <div className="mt-auto space-y-3">
                {missionEndState === "success" && mode === "admin" ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className={`${(!labData.solution || isWorkspaceDirty) ? "w-1/3" : "w-full"} py-4 rounded border border-white/20 bg-transparent text-white font-black text-[11px] uppercase tracking-[0.1em] hover:bg-white/5 transition-all active:scale-95`}
                    >
                      {t("missionEnd.retry")}
                    </button>
                    {(!labData.solution || isWorkspaceDirty) && (
                      <button
                        onClick={() => {
                          if (onMissionComplete && blocklyContext) {
                            const { Blockly, workspace } = blocklyContext;
                            const xmlText = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(workspace));
                            const program = generateProgram(Blockly, workspace);

                            const solution: LabSolution = {
                              xml: xmlText,
                              metrics: {
                                timeSpent: labData.rule.timeLimit ? (labData.rule.timeLimit - timeLeft) : 0,
                                fuelConsumed: droneState.batteryConsumed || 0,
                                logicalDistance: calculateLogicalDistance(program) / 200,
                                blockCount: workspace.getAllBlocks(false).length
                              }
                            };

                            onMissionComplete(solution);
                          }
                        }}
                        className="w-2/3 py-4 rounded bg-emerald-500 text-black font-black text-[11px] uppercase tracking-[0.1em] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all active:scale-95"
                      >
                        {!labData.solution ? t("missionEnd.saveSolution") : t("missionEnd.updateSolution")}
                      </button>
                    )}
                  </div>
                ) : missionEndState === "success" ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="w-1/3 py-4 rounded border border-white/20 bg-transparent text-white font-black text-[11px] uppercase tracking-[0.1em] hover:bg-white/5 transition-all active:scale-95"
                    >
                      {t("missionEnd.retry")}
                    </button>
                    <button
                      onClick={() => {
                        if (onMissionComplete && blocklyContext && studentFinalMetrics) {
                          const { Blockly, workspace } = blocklyContext;
                          const xmlText = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(workspace));

                          const score = calculateLabScore(studentFinalMetrics, labData.solution?.metrics);

                          const solution: LabSolution = {
                            xml: xmlText,
                            metrics: studentFinalMetrics,
                            score: score // Passing score back for API
                          };
                          onMissionComplete(solution);
                        }
                        setShowScoring(true);
                      }}
                      className="w-2/3 py-4 rounded bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-slate-200 transition-all active:scale-95"
                    >
                      Nộp bài & Xem điểm
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleReset}
                    className="w-full py-4 rounded bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-slate-200 transition-all active:scale-95"
                  >
                    {t("missionEnd.tryAgain")}
                  </button>
                )}
                <button
                  onClick={onExit}
                  className="w-full py-2 rounded text-slate-500 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-colors"
                >
                  {t("missionEnd.backToList")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Helper to calculate total "logical" distance from a set of commands.
 * Sums all 'distance' and 'amount' fields, including nested repeats.
 */
function calculateLogicalDistance(commands: Command[]): number {
  return commands.reduce((acc, cmd) => {
    if (cmd.type === 'repeat') {
      return acc + (calculateLogicalDistance(cmd.actions) * cmd.count);
    }
    const dist = (cmd as any).distance || (cmd as any).amount || 0;
    return acc + dist;
  }, 0);
}
