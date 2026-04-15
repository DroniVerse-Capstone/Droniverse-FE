"use client";

import {
  Suspense,
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  Line,
  Html,
  Float,
  Sparkles,
} from "@react-three/drei";
import { CatmullRomCurve3, Vector3 } from "three";
import type { DroneState } from "@/lib/simulator/droneSimulator";
import type { MapObject } from "@/types/lab";
import { DEFAULT_DISPLAY_CONFIG } from "@/lib/config3D/displayDefaults";
import {
  CANVAS_CENTER,
  projectToWorld,
  radiusToWorld,
  SIM_CANVAS,
  WORLD_SCALE_VALUE,
  ALTITUDE_SCALE,
  worldToCanvas,
} from "@/lib/config3D/simConfig";
import { CAMERA_CONFIG, ORBIT_CONTROLS_CONFIG } from "@/lib/config3D/cameraConfig";
import DroneBody from "../simulator3d/DroneBody";
import GroundPlane from "../simulator3d/GroundPlane";
import GoalMarker from "../simulator3d/GoalMarker";
import ObstacleField from "../simulator3d/ObstacleField";
import SceneLights from "../simulator3d/SceneLights";
import DroneHUD from "./DroneHUD";
import {
  SHOW_CONTACT_SHADOWS,
  CONTACT_SHADOWS_CONFIG
} from "@/lib/models3d/lightsConfig";
import { AMBIENT_COLOR } from "@/lib/models3d";
import { MapEnvironment } from "../simulator3d/MapEnvironment";
import CrashEffect from "../simulator3d/effects/CrashEffect";
import { SIMULATOR_CONFIG } from "@/lib/simulator/config";

// --- STATIC IMPORTS FOR PERFORMANCE (NO MORE Dynamic REQUIRES in RENDER) ---
import CheckpointBeacon from "../simulator3d/checkpoint/CheckpointBeacon";
import Tree from "../simulator3d/decor/Tree";
import Tree2GLB from "../simulator3d/decor/Tree2GLB";
import RockGLB from "../simulator3d/obstacles/RockGLB";
import GrassGLB from "../simulator3d/decor/GrassGLB";
import DiamondBonus from "../simulator3d/bonus/DiamondBonus";
import StarBonus from "../simulator3d/bonus/StarBonus";
import HeartBonus from "../simulator3d/bonus/HeartBonus";
import BoxObstacle from "../simulator3d/obstacles/BoxObstacle";

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

type Props = {
  state: DroneState;
  hudTitle: string;
  hudDescription?: string;
  hudOrigin?: { x: number; y: number; z: number };
  hudAxisHints?: { label: string; detail: string }[];
  goal?: {
    position: [number, number, number];
    shape?: "circle" | "square" | "zigzag";
    radius?: number;
    size?: [number, number];
    rotation?: [number, number, number];
  };
  obstacles?: {
    id: string;
    type: string;
    position: [number, number, number];
    size: [number, number, number];
    color?: string;
    rotation?: [number, number, number];
  }[];
  /** Danh sách tất cả các đối tượng trên bản đồ (checkpoint, bonus, obstacle, decor) */
  objects?: MapObject[];
  /** Set các checkpoint ID đã hoàn thành */
  completedCheckpoints?: Set<string>;
  /** Set các bonus ID đã thu thập */
  completedBonuses?: Set<string>;
  /** Theme của bản đồ */
  theme?: "default" | "space" | "sunset" | "daylight";
  /** Góc heading gốc (dùng cho HUD) */
  headingBase?: number;
  sessionKey?: number;
  mapSize?: number;
  colorConfig?: {
    drone?: {
      fuselage?: string;
      fuselageEmissive?: string;
      nose?: string;
      noseEmissive?: string;
      canopy?: string;
      wings?: string;
      rotor?: string;
      rotorEmissive?: string;
    };
    map?: {
      ground?: string;
      grid?: string;
      border?: string;
    };
    ambient?: string;
  };
  displayConfig?: {
    trailEnabled?: boolean;
    trailColor?: string;
    trailMaxLength?: number;
    smoothing?: boolean;
    fade?: boolean;
    sampleDistance?: number;
    lineWidth?: number;
  };
  gridSize?: number;
  status?: string;
  failReason?: string;
  isSequential?: boolean;
  debugBounds?: { matrix: number[]; id: string; size: number[]; raw?: any }[];
  /** Kết quả xác thực quỹ đạo thời gian thực */
  patternResults?: any[];
};

const DebugBounds = ({ bounds }: { bounds: { matrix: number[]; id: string; size: number[]; raw?: any }[] }) => {
  if (!SIMULATOR_CONFIG.debug.showBounds) return null;
  return (
    <>
      {bounds.map((b, idx) => {

        const matrix = new THREE.Matrix4().fromArray(b.matrix);
        const [w, h, d] = b.size || [1, 1, 1];
        const isTree = (b.raw?.raw?.modelUrl || b.raw?.modelUrl || "").includes("tree");
        const isRock = (b.raw?.raw?.modelUrl || b.raw?.modelUrl || "").includes("rock");
        return (
          <group
            key={b.id || `debug-${idx}`}
            matrix={matrix}
            matrixAutoUpdate={false}
          >
            {isTree ? (
              <>
                <mesh position={[0, 0.35, 0]}>
                  <cylinderGeometry args={[0.12, 0.12, 0.7, 8]} />
                  <meshBasicMaterial color="#ff0000" wireframe transparent opacity={0.4} depthTest={false} />
                </mesh>
                <mesh position={[0, 0.7 + 0.28, 0]}>
                  <sphereGeometry args={[0.48, 8, 8]} />
                  <meshBasicMaterial color="#ff0000" wireframe transparent opacity={0.4} depthTest={false} />
                </mesh>
                <mesh position={[0, 0.7 + 0.65, 0]}>
                  <sphereGeometry args={[0.38, 8, 8]} />
                  <meshBasicMaterial color="#ff0000" wireframe transparent opacity={0.4} depthTest={false} />
                </mesh>
                <mesh position={[0, 0.7 + 0.98, 0]}>
                  <sphereGeometry args={[0.30, 8, 8]} />
                  <meshBasicMaterial color="#ff0000" wireframe transparent opacity={0.4} depthTest={false} />
                </mesh>
                <mesh position={[0, 0.7 + 1.22, 0]}>
                  <sphereGeometry args={[0.18, 8, 8]} />
                  <meshBasicMaterial color="#ff0000" wireframe transparent opacity={0.4} depthTest={false} />
                </mesh>
              </>
            ) : isRock ? (
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1.8, 1, 1, 4, 4, 4]} />
                <meshBasicMaterial color="#ff0000" wireframe transparent opacity={0.4} depthTest={false} />
              </mesh>
            ) : (
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1, 1, 1, 4, 4, 4]} />
                <meshBasicMaterial color="#ff0000" wireframe transparent opacity={0.4} depthTest={false} />
              </mesh>
            )}
          </group>
        );
      })}
    </>
  );
};

const PatternRenderer = ({ obj, results }: { obj: MapObject, results: any[] }) => {
  const { shape, id } = obj;
  const matRef = useRef<any>(null);
  const result = results?.find(r => r.id === id);
  const report = result?.report;

  const startCornerIdx = report?.startCornerIdx ?? 0;
  const isCCW = report?.isCCW ?? false;

  useFrame((state, delta) => {
    if (matRef.current) {
      matRef.current.dashOffset -= delta * 2;
    }
  });

  const shapeColor = useMemo(() => {
    const colorMap: Record<string, string> = {
      square: "#00ffff",
      circle: "#39ff14",
      zigzag: "#ffea00",
    };
    return colorMap[shape ?? ""] ?? "#00ffff";
  }, [shape]);

  const points = useMemo(() => {
    const Y_HEIGHT = 0.2;
    const hw = 0.5, hd = 0.5;
    if (shape === "square" || shape === "rectangle") {
      return [
        new THREE.Vector3(-hw, Y_HEIGHT, -hd),
        new THREE.Vector3(hw, Y_HEIGHT, -hd),
        new THREE.Vector3(hw, Y_HEIGHT, hd),
        new THREE.Vector3(-hw, Y_HEIGHT, hd),
        new THREE.Vector3(-hw, Y_HEIGHT, -hd),
      ];
    }
    if (shape === "circle") {
      const pts: THREE.Vector3[] = [];
      const steps = 64;
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * 0.5, Y_HEIGHT, Math.sin(a) * 0.5));
      }
      return pts;
    }
    if (shape === "zigzag") {
      return [
        new THREE.Vector3(-0.5, Y_HEIGHT, -0.5),
        new THREE.Vector3(-0.25, Y_HEIGHT, 0.5),
        new THREE.Vector3(0, Y_HEIGHT, -0.5),
        new THREE.Vector3(0.25, Y_HEIGHT, 0.5),
        new THREE.Vector3(0.5, Y_HEIGHT, -0.5),
      ];
    }
    return [];
  }, [shape]);

  const segments = useMemo(() => {
    if (shape !== "square" && shape !== "rectangle") return [];
    const res = [];
    for (let i = 0; i < points.length - 1; i++) {
      res.push({ start: points[i], end: points[i + 1], edgeIdx: i });
    }
    return res;
  }, [shape, points]);

  // ── Circle / Zigzag: single polyline, 4-layer neon glow (matches Map Editor exactly) ──
  if (shape === "circle" || shape === "zigzag") {
    if (points.length === 0) return null;
    const flatPts = points.map((p) => [p.x, p.y, p.z] as [number, number, number]);
    return (
      <group>
        {/* L1: Outer Glow — very thick, low opacity */}
        <Line points={flatPts} color={shapeColor} lineWidth={24} transparent opacity={0.12} depthWrite={false} />
        {/* L2: Middle Glow */}
        <Line points={flatPts} color={shapeColor} lineWidth={10} transparent opacity={0.3} depthWrite={false} />
        {/* L3: Solid core */}
        <Line points={flatPts} color={shapeColor} lineWidth={2} transparent opacity={0.8} depthWrite={false} />
        {/* L4: Flowing animated dashes (matRef drives dashOffset) */}
        <Line
          ref={matRef}
          points={flatPts}
          color="#ffffff"
          lineWidth={3}
          dashed
          dashSize={0.1}
          gapSize={0.2}
          dashScale={2}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </group>
    );
  }

  // ── Square / Rectangle: per-segment with real-time pass/fail highlight ──
  if (segments.length === 0) return null;

  return (
    <group>
      {segments.map((seg, i) => {
        let k = -1;
        if (report?.segmentPass) {
          k = isCCW
            ? (startCornerIdx - 1 - i + 4) % 4
            : (i - startCornerIdx + 4) % 4;
        }

        const isPassed = k >= 0 ? !!report?.segmentPass[k] : false;
        const segColor = isPassed ? "#10b981" : shapeColor; // Emerald Green for success
        const glowOp = isPassed ? 0.8 : 0.3; // Increased pulse glow
        const coreOp = isPassed ? 1.0 : 0.8;

        const pts: [number, number, number][] = [
          [seg.start.x, seg.start.y, seg.start.z],
          [seg.end.x, seg.end.y, seg.end.z],
        ];

        return (
          <group key={i}>
            {/* L1: Outer Glow */}
            <Line points={pts} color={segColor} lineWidth={24} transparent opacity={glowOp * 0.4} depthWrite={false} />
            {/* L2: Middle Glow */}
            <Line points={pts} color={segColor} lineWidth={10} transparent opacity={glowOp} depthWrite={false} />
            {/* L3: Core — white when passed, neon color when not */}
            <Line points={pts} color={isPassed ? "#ffffff" : segColor} lineWidth={isPassed ? 4 : 2} transparent opacity={coreOp} depthWrite={false} />
            {/* L4: Flowing dashes — vivid (0.9) when passed, subtle (0.4) otherwise */}
            <Line
              ref={i === 0 ? matRef : null}
              points={pts}
              color="#ffffff"
              lineWidth={3}
              dashed
              dashSize={0.1}
              gapSize={0.2}
              dashScale={2}
              transparent
              opacity={isPassed ? 0.9 : 0.4}
              depthWrite={false}
            />
          </group>
        );
      })}
    </group>
  );
};

const CollectionEffect3D = ({ color, score }: { color: string, score: number }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const textGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.scale.x += delta * 35;
      ringRef.current.scale.y += delta * 35;
      ringRef.current.scale.z += delta * 35;
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, mat.opacity - delta * 1.5);
    }
    if (ring2Ref.current) {
      ring2Ref.current.scale.x += delta * 45;
      ring2Ref.current.scale.y += delta * 45;
      ring2Ref.current.scale.z += delta * 45;
      ring2Ref.current.rotation.z += delta * 3;
      const mat = ring2Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, mat.opacity - delta * 2.0);
    }
    if (sphereRef.current) {
      sphereRef.current.scale.x += delta * 20;
      sphereRef.current.scale.y += delta * 20;
      sphereRef.current.scale.z += delta * 20;
      const mat = sphereRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, mat.opacity - delta * 3.0);
    }
    if (lightRef.current) {
      lightRef.current.intensity = Math.max(0, lightRef.current.intensity - delta * 30);
    }
    if (textGroupRef.current) {
      textGroupRef.current.position.y += delta * 2.5; // fly up
      textGroupRef.current.scale.x += delta * 0.5; // grow slightly in 3D
      textGroupRef.current.scale.y += delta * 0.5;
      textGroupRef.current.scale.z += delta * 0.5;
    }
  });

  return (
    <group>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={1} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.2, 64]} />
        <meshBasicMaterial color={color} transparent opacity={1} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI / 2.5, 0.2, 0]}>
        <ringGeometry args={[1.0, 1.1, 64]} />
        <meshBasicMaterial color={"#ffffff"} transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* High speed outward color sparks */}
      <Sparkles count={200} scale={18} size={25} speed={6} opacity={0.9} fade color={color} />

      {/* Huge white flashes */}
      <Sparkles count={60} scale={12} size={60} speed={3} opacity={1} fade color="#ffffff" />

      <pointLight ref={lightRef} color={color} intensity={50} distance={40} decay={2} />

      <group ref={textGroupRef} position={[0, 1.5, 0]}>
        <Html center>
          <div className="relative flex items-center justify-center pointer-events-none mb-10">
            <div
              className="absolute inset-0 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_forwards]"
              style={{ backgroundColor: color, opacity: 0.6 }}
            />
            <div className="animate-out fade-out duration-1000 delay-[800ms] fill-mode-forwards pointer-events-none">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-t from-white to-gray-200"
                style={{ filter: `drop-shadow(0 0 35px ${color})`, WebkitTextStroke: `1.5px ${color}` }}>
                +{score}
              </span>
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
};

const BonusRenderer = ({ obj, completed }: { obj: any, completed: boolean }) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (completed) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [completed]);

  const isPrimitive = obj.modelUrl?.startsWith?.("primitive:");
  const primitiveType = isPrimitive ? obj.modelUrl.split(":")[1] : (obj.modelUrl || "box");

  const getBonusConfig = (type: string) => {
    switch (type) {
      case "diamond": return {
        primary: "#00eeff",
        textGradient: "from-cyan-100 to-cyan-400",
        icon: "💎"
      };
      case "star": return {
        primary: "#ffe234",
        textGradient: "from-yellow-100 to-amber-500",
        icon: "⭐"
      };
      case "heart": return {
        primary: "#ff2d55",
        textGradient: "from-rose-100 to-pink-500",
        icon: "❤️"
      };
      default: return {
        primary: "#e879f9",
        textGradient: "from-white to-fuchsia-400",
        icon: "✨"
      };
    }
  };

  const config = getBonusConfig(primitiveType);

  if (completed && !showAnimation) return null;

  return (
    <group
      position={obj.position as [number, number, number]}
      rotation={obj.rotation as [number, number, number]}
      scale={obj.scale as [number, number, number]}
    >
      {!completed && (
        <Float speed={3} rotationIntensity={2} floatIntensity={2} floatingRange={[-0.3, 0.3]}>
          {/* Ambient colored dust */}
          <Sparkles count={40} scale={obj.scale ? obj.scale[0] * 3 : 6} size={6} speed={0.4} opacity={0.6} color={config.primary} />
          {/* Bright twinkling central fragments */}
          <Sparkles count={20} scale={obj.scale ? obj.scale[0] * 4 : 8} size={15} speed={1.5} opacity={1} color="#ffffff" fade />
          {/* Stray large dust motes */}
          <Sparkles count={10} scale={obj.scale ? obj.scale[0] * 5 : 10} size={25} speed={0.8} opacity={0.8} color={config.primary} fade />

          <pointLight color={config.primary} intensity={2} distance={10} decay={2} />

          {(() => {
            switch (primitiveType) {
              case "diamond": return <DiamondBonus />;
              case "star": return <StarBonus />;
              case "heart": return <HeartBonus />;
              default: return <DiamondBonus />;
            }
          })()}

          <Html center position={[0, (obj.scale ? obj.scale[1] : 1) * 1.5, 0]}>
            <div className="relative group cursor-default">
              {/* Ambient thick glow */}
              <div
                className="absolute -inset-4 rounded-full opacity-40 blur-xl animate-[pulse_3s_ease-in-out_infinite]"
                style={{ background: `radial-gradient(circle, ${config.primary} 10%, transparent 70%)` }}
              />
              {/* Core intense glow */}
              <div
                className="absolute -inset-1 rounded-full opacity-70 blur-md animate-[pulse_2s_ease-in-out_infinite]"
                style={{ background: `radial-gradient(circle, ${config.primary} 30%, transparent 80%)` }}
              />

              <div
                className="relative z-10 flex items-center justify-center gap-1.5 px-2 py-[2px] rounded-md bg-black/60 backdrop-blur-md overflow-hidden"
                style={{
                  boxShadow: `0 0 12px ${config.primary}55, inset 0 0 6px ${config.primary}44`,
                  border: `1px solid ${config.primary}55`
                }}
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-[shimmer_2s_infinite]" />

                <span className="text-[10px] drop-shadow-sm pb-[1px] grayscale brightness-125">{config.icon}</span>
                <span className={`text-[12px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b ${config.textGradient}`}
                  style={{ filter: `drop-shadow(0 0 4px ${config.primary}88)` }}>
                  {obj.scoreValue || 50}
                </span>
              </div>
            </div>
          </Html>
        </Float>
      )}

      {showAnimation && (
        <CollectionEffect3D color={config.primary} score={obj.scoreValue || 50} />
      )}
    </group>
  );
};

function Simulator3D(
  {
    state,
    hudTitle,
    hudDescription,
    hudOrigin,
    goal,
    objects = [],
    completedCheckpoints,
    completedBonuses,
    theme,
    headingBase,
    hudAxisHints,
    colorConfig,
    displayConfig,
    isSequential = true,
    sessionKey = 0,
    mapSize = SIM_CANVAS.width,
    debugBounds = [],
    status = "idle",
    failReason = "",
    patternResults = [],
  }: Props,
  ref: any
) {
  const canvasCenter = useMemo(() => ({
    x: mapSize / 2,
    y: mapSize / 2,
  }), [mapSize]);

  useImperativeHandle(ref, () => ({
    clearTrail: () => {
      trailRef.current = [];
      setTrailPoints([]);
    },
  }));

  const [lastCrashPos, setLastCrashPos] = useState<[number, number, number] | null>(null);
  const [shakeIntensity, setShakeIntensity] = useState(0);

  const droneWorldState = useMemo(() => {
    if (!state) {
      return {
        position: [0, 0, 0] as [number, number, number],
        headingRad: 0,
        isFlying: false,
      };
    }
    const { x, y, z } = projectToWorld(state.x, state.y, state.altitude, canvasCenter);
    return {
      position: [x, y, z] as [number, number, number],
      headingRad: ((180 - state.headingDeg) * Math.PI) / 180,
      isFlying: !!state.isStarted || state.altitude > 0,
    };
  }, [state, canvasCenter]);

  // Handle Crash Visuals & Audio
  useEffect(() => {
    if (status === "crashed" && droneWorldState.position) {
      // Impact point (before falling to 0)
      const explosionPos: [number, number, number] = [
        droneWorldState.position[0],
        Math.max(droneWorldState.position[1], 0.5),
        droneWorldState.position[2]
      ];

      setLastCrashPos(explosionPos);
      setShakeIntensity(4.5);

      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const masterGain = audioCtx.createGain();
        masterGain.connect(audioCtx.destination);

        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.25);
        gain1.gain.setValueAtTime(0.7, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc1.connect(gain1);
        gain1.connect(masterGain);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.4);

        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(1000, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gain2.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc2.connect(gain2);
        gain2.connect(masterGain);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.25);
      } catch (e) {
        console.warn("Audio Context blocked.");
      }

      const timer = setTimeout(() => {
        setShakeIntensity(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const crashLockedRef = useRef(false);

  // Update Trail (Stop on crash to avoid "Sharp Line")
  useEffect(() => {
    // If we ever locked, or it's currently crashed, stop everything
    if (crashLockedRef.current || status === "crashed" || status === "failed") {
      crashLockedRef.current = true;
      return;
    }

    if (droneWorldState.position) {
      const now = Date.now();
      const pos = droneWorldState.position;

      if (trailRef.current.length === 0) {
        trailRef.current = [{ pos, t: now }];
      } else {
        const last = trailRef.current[trailRef.current.length - 1];

        // AGGRESSIVE FALL FILTER: 
        // If altitude drops significantly suddenly (even with small X,Z move), lock it!
        const isSuddenDrop = pos[1] < last.pos[1] - 0.15 && Math.hypot(pos[0] - last.pos[0], pos[2] - last.pos[2]) < 0.2;

        if (isSuddenDrop) {
          crashLockedRef.current = true;
          return;
        }

        const dist = Math.hypot(
          pos[0] - last.pos[0],
          pos[1] - last.pos[1],
          pos[2] - last.pos[2]
        );
        if (dist > 0.1) {
          trailRef.current = [...trailRef.current, { pos, t: now }];
        }
      }
      setTrailPoints(trailRef.current.map(tp => tp.pos));
    }
  }, [droneWorldState.position, status]);

  // Reset lock when mission restarts
  useEffect(() => {
    if (status === "ready" || status === "idle") {
      crashLockedRef.current = false;
    }
  }, [status]);

  // Camera Shake & Gravity Fall Logic
  const visualAltitudeRef = useRef(droneWorldState.position[1]);
  const fallVelocityRef = useRef(0);

  const CameraShake = () => {
    useFrame((state, delta) => {
      // 1. Shake Logic - Chỉ chạy khi thực sự cần rung lắc
      if (shakeIntensity > 0) {
        state.camera.position.x += (Math.random() - 0.5) * shakeIntensity;
        state.camera.position.y += (Math.random() - 0.5) * shakeIntensity;
      }

      // 2. Gravity Fall Logic
      if (status === "crashed") {
        if (visualAltitudeRef.current > 0.05) {
          fallVelocityRef.current += delta * 15.0;
          visualAltitudeRef.current -= fallVelocityRef.current * delta;
        } else {
          visualAltitudeRef.current = 0;
        }
      } else {
        visualAltitudeRef.current = droneWorldState.position[1];
        fallVelocityRef.current = 0;
      }
    });
    return null;
  };

  // Modified DroneBody State for visual fall
  const visualDroneState = useMemo(() => ({
    ...droneWorldState,
    position: [
      droneWorldState.position[0],
      (status === "crashed" || status === "failed") ? visualAltitudeRef.current : droneWorldState.position[1],
      droneWorldState.position[2]
    ] as [number, number, number]
  }), [droneWorldState, status]);

  // Audio Engine Hook
  useEffect(() => {
    if (droneWorldState.isFlying) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(120, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 1.2);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.3);
        gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 1.5);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2.0);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 2.0);
      } catch (e) {
        console.warn("Audio engine suppressed by browser.");
      }
    }
  }, [droneWorldState.isFlying]);

  const goalWorld = useMemo(() => {
    if (!goal) return null;
    const worldPos = projectToWorld(
      goal.position[0],
      goal.position[2],
      goal.position[1] ?? 0,
      canvasCenter
    );
    const sizeWorld: [number, number] | undefined =
      goal.shape === "square" && goal.size
        ? [
          (goal.size[0] ?? 0) * WORLD_SCALE_VALUE,
          (goal.size[1] ?? 0) * WORLD_SCALE_VALUE,
        ]
        : undefined;
    return {
      position: worldPos,
      shape:
        goal.shape ?? (typeof goal.radius === "number" ? "circle" : "square"),
      radius: goal.radius ? radiusToWorld(goal.radius) : undefined,
      size: sizeWorld,
      rotation: goal.rotation ?? [0, 90, 0],
      coords: {
        x: goal.position[0] - canvasCenter.x,
        y: goal.position[2] - canvasCenter.y,
        altitude: goal.position[1] ?? 0,
      },
    };
  }, [goal, canvasCenter]);

  const planeSize: [number, number] = [
    mapSize * WORLD_SCALE_VALUE,
    mapSize * WORLD_SCALE_VALUE,
  ];

  const cfg = useMemo(
    () => ({ ...DEFAULT_DISPLAY_CONFIG, ...(displayConfig ?? {}) }),
    [displayConfig]
  );

  type TimedPoint = { pos: [number, number, number]; t: number };
  const trailRef = useRef<TimedPoint[]>([]);
  const [trailPoints, setTrailPoints] = useState<[number, number, number][]>(
    []
  );
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof colorConfig === "undefined" && !cfg) {
    }
    if (cfg && cfg.trailEnabled === false) {
      trailRef.current = [];
      setTrailPoints([]);
      return;
    }

    const pos = droneWorldState.position;
    const p: [number, number, number] = [pos[0], pos[1], pos[2]];

    const sampleDistance = SIMULATOR_CONFIG.performance.sampleDistance;
    const lastEntry = trailRef.current[trailRef.current.length - 1];
    let shouldPush = true;
    if (lastEntry) {
      const last = lastEntry.pos;
      const dx = last[0] - p[0];
      const dy = last[1] - p[1];
      const dz = last[2] - p[2];
      const distSq = dx * dx + dy * dy + dz * dz;
      shouldPush = distSq >= sampleDistance * sampleDistance;
    }
    if (shouldPush) {
      trailRef.current.push({ pos: p, t: Date.now() });
    }

    const maxLen = SIMULATOR_CONFIG.performance.trailMaxLength;
    let total = 0;
    for (let i = trailRef.current.length - 1; i > 0; i--) {
      const a = trailRef.current[i - 1].pos;
      const b = trailRef.current[i].pos;
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const dz = b[2] - a[2];
      const dist = Math.hypot(dx, dy, dz);
      total += dist;
    }
    while (trailRef.current.length > 1 && total > maxLen) {
      const first = trailRef.current.shift()!;
      if (trailRef.current.length > 1) {
        const a = first.pos;
        const b = trailRef.current[0].pos;
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const dz = b[2] - a[2];
        const dist = Math.hypot(dx, dy, dz);
        total -= dist;
      } else {
        total = 0;
      }
    }

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        setTrailPoints(trailRef.current.map((pt) => pt.pos));
        rafRef.current = null;
      });
    }
  }, [state]);


  return (
    <div className="flex flex-col h-full w-full gap-3 sm:gap-4 p-2 sm:p-4">
      <div className="w-full flex-7 min-h-0 rounded-xl overflow-hidden">
        <Canvas
          shadows
          dpr={SIMULATOR_CONFIG.performance.dpr}
          gl={{
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.8,
            outputColorSpace: THREE.SRGBColorSpace,
            preserveDrawingBuffer: true,
            powerPreference: SIMULATOR_CONFIG.performance.powerPreference,
            antialias: SIMULATOR_CONFIG.performance.antialiasing,
          }}
          camera={{
            position: CAMERA_CONFIG.INITIAL_POSITION,
            fov: CAMERA_CONFIG.FOV,
            near: CAMERA_CONFIG.NEAR,
            far: CAMERA_CONFIG.FAR,
          }}
        >
          {/* {colorConfig?.ambient && (
            <color attach="background" args={[colorConfig.ambient]} />
          )} */}
          <MapEnvironment theme={theme} />
          <SceneLights />
          <Suspense fallback={null}>
            <GroundPlane
              size={planeSize}
              colorConfig={colorConfig?.map}
            />
            {goalWorld && <GoalMarker goal={goalWorld} />}
            {/* Render dynamically passed objects from LabMap (if any) */}
            {/* Optimized Object Rendering Loop */}
            {useMemo(() => {
              let cpIdx = 0;
              return objects.map((obj) => {
                if (obj.objectType === "checkpoint") {
                  const currentOrder = cpIdx++;
                  return (
                    <group key={`${obj.id}-${sessionKey}`} position={obj.position as [number, number, number]}>
                      <CheckpointBeacon
                        radius={obj.radius || 4}
                        order={currentOrder}
                        completed={completedCheckpoints?.has(obj.id)}
                        isSequential={isSequential}
                        isInteractive={true}
                        droneState={droneWorldState}
                      />
                    </group>
                  );
                }

                if (obj.objectType === "bonus") {
                  return <BonusRenderer key={obj.id} obj={obj} completed={!!completedBonuses?.has(obj.id)} />;
                }

                if (["obstacle", "decor"].includes(obj.objectType ?? "")) {
                  const isPrimitive = obj.modelUrl?.startsWith?.("primitive:");
                  const primitiveType = isPrimitive ? (obj.modelUrl.split(":")[1] ?? "box") : (obj.modelUrl || "box");

                  return (
                    <group
                      key={obj.id}
                      position={obj.position as [number, number, number]}
                      rotation={obj.rotation as [number, number, number]}
                      scale={obj.scale as [number, number, number]}
                    >
                      {(() => {
                        switch (primitiveType) {
                          case "tree": return <Tree scale={1} />;
                          case "tree2": return <Tree2GLB physics={false} />;
                          case "rock": return <RockGLB physics={false} />;
                          case "grass": return <GrassGLB physics={false} />;
                          case "box":
                          default:
                            return (
                              <BoxObstacle
                                color={obj.color}
                                size={[1, 1, 1]}
                              />
                            );
                        }
                      })()}
                    </group>
                  );
                }

                if (obj.objectType === "pattern") {
                  return (
                    <group
                      key={obj.id}
                      position={obj.position as [number, number, number]}
                      rotation={[degToRad(obj.rotation?.[0] || 0), degToRad(obj.rotation?.[1] || 0), degToRad(obj.rotation?.[2] || 0)]}
                      scale={obj.scale as [number, number, number]}
                      visible={status === "running" ? true : !obj.hiddenUntilRun}
                    >
                      <PatternRenderer obj={obj} results={patternResults || []} />
                    </group>
                  );
                }
                return null;
              });
            }, [objects, completedCheckpoints, droneWorldState])}

            {/* Render Physics Debug Bounds */}
            {debugBounds && debugBounds.length > 0 && <DebugBounds bounds={debugBounds as any} />}

            {cfg.trailEnabled !== false &&
              trailPoints.length >= 2 &&
              (() => {
                const color = cfg.trailColor ?? "#33F6FF";
                const lineWidth = SIMULATOR_CONFIG.performance.lineWidth;
                const smoothing = !SIMULATOR_CONFIG.performance.useSimpleTrail;
                const fade = !!cfg.fade;

                const renderPieces: JSX.Element[] = [];

                if (smoothing && trailPoints.length >= 4) {
                  const curvePts = trailPoints.map(
                    (p) => new Vector3(p[0], p[1], p[2])
                  );
                  const curve = new CatmullRomCurve3(
                    curvePts,
                    false,
                    "catmullrom",
                    0.5
                  );
                  const divisions = Math.max((trailPoints.length - 1) * 3, 12);
                  const sampled = curve
                    .getPoints(divisions)
                    .map((v) => [v.x, v.y, v.z] as [number, number, number]);
                  if (fade) {
                    const segments = Math.min(
                      16,
                      Math.max(8, Math.floor(sampled.length / 8))
                    );
                    for (let i = 0; i < segments; i++) {
                      const start = Math.floor((i / segments) * sampled.length);
                      const end = Math.floor(
                        ((i + 1) / segments) * sampled.length
                      );
                      const slice = sampled.slice(start, end + 1);
                      const t = segments > 1 ? i / (segments - 1) : 1;
                      const opacity = 0.14 + t * 0.82;
                      if (slice.length >= 2) {
                        renderPieces.push(
                          <Line
                            key={`trail-${i}`}
                            points={slice}
                            color={color}
                            lineWidth={lineWidth}
                            transparent
                            opacity={opacity}
                          />
                        );
                      }
                    }
                  } else {
                    renderPieces.push(
                      <Line
                        key="trail-smooth"
                        points={sampled}
                        color={color}
                        lineWidth={lineWidth}
                        transparent
                        opacity={0.96}
                      />
                    );
                  }
                } else {
                  if (fade) {
                    const segments = Math.min(
                      16,
                      Math.max(8, Math.floor(trailPoints.length / 8))
                    );
                    for (let i = 0; i < segments; i++) {
                      const start = Math.floor(
                        (i / segments) * trailPoints.length
                      );
                      const end = Math.floor(
                        ((i + 1) / segments) * trailPoints.length
                      );
                      const slice = trailPoints.slice(start, end + 1);
                      const t = segments > 1 ? i / (segments - 1) : 1;
                      const opacity = 0.14 + t * 0.82;
                      if (slice.length >= 2) {
                        renderPieces.push(
                          <Line
                            key={`trail-raw-${i}`}
                            points={slice}
                            color={color}
                            lineWidth={lineWidth}
                            transparent
                            opacity={opacity}
                          />
                        );
                      }
                    }
                  } else {
                    renderPieces.push(
                      <Line
                        key="trail-raw"
                        points={trailPoints}
                        color={color}
                        lineWidth={lineWidth}
                        transparent
                        opacity={0.96}
                      />
                    );
                  }
                }

                return renderPieces;
              })()}
            <DroneBody
              state={visualDroneState}
              colorConfig={colorConfig?.drone}
            />
            {status === "crashed" && lastCrashPos && (
              <Suspense fallback={null}>
                <CrashEffect position={lastCrashPos} />
              </Suspense>
            )}
            <CameraShake />
            {SIMULATOR_CONFIG.lighting.contactShadow.show && (
              <ContactShadows
                position={CONTACT_SHADOWS_CONFIG.position}
                opacity={CONTACT_SHADOWS_CONFIG.opacity}
                scale={Math.min(planeSize[0] * 1.2, 80)} // Dynamic shadow area coverage
                blur={CONTACT_SHADOWS_CONFIG.blur}
                far={CONTACT_SHADOWS_CONFIG.far}
                resolution={512} // Giảm độ phân giải bóng đổ nền cho mượt
              />
            )}
            {/* <Environment preset="sunset" /> */}
          </Suspense>
          <OrbitControls
            enablePan={ORBIT_CONTROLS_CONFIG.ENABLE_PAN}
            maxPolarAngle={ORBIT_CONTROLS_CONFIG.MAX_POLAR_ANGLE}
            minDistance={ORBIT_CONTROLS_CONFIG.MIN_DISTANCE}
            maxDistance={ORBIT_CONTROLS_CONFIG.MAX_DISTANCE}
          />
        </Canvas>
      </div>
      {/* <div className="w-full shrink-0">
        <DroneHUD
          state={state}
          title={hudTitle}
          description={hudDescription}
          headingBase={headingBase}
          originPoint={hudOrigin}
          axisHints={hudAxisHints}
        />
      </div> */}
    </div>
  );
}

export default forwardRef(Simulator3D);
