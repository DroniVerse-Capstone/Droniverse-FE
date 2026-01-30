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
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  Line,
} from "@react-three/drei";
import { CatmullRomCurve3, Vector3 } from "three";
import type { DroneState } from "@/lib/simulator/droneSimulator";
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
// import { CONTACT_SHADOWS_CONFIG, SHOW_CONTACT_SHADOWS } from "@/lib/models3d/lightsConfig";
import { AMBIENT_COLOR } from "@/lib/models3d";

type Props = {
  state: DroneState;
  hudTitle: string;
  hudDescription?: string;
  hudOrigin?: { x: number; y: number; z: number };
  goal?: {
    position: [number, number, number];
    shape?: "circle" | "square";
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
  headingBase?: number;
  hudAxisHints?: { label: string; detail: string }[];
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
};

type HoverData = {
  coords: { x: number; y: number };
  screen: { x: number; y: number };
};

function Simulator3D(
  {
    state,
    hudTitle,
    hudDescription,
    hudOrigin,
    goal,
    obstacles,
    headingBase,
    hudAxisHints,
    colorConfig,
    displayConfig,
  }: Props,
  ref: any
) {
  useImperativeHandle(ref, () => ({
    clearTrail: () => {
      trailRef.current = [];
      setTrailPoints([]);
    },
  }));
  const [hoverData, setHoverData] = useState<HoverData | null>(null);

  const droneWorldState = useMemo(() => {
    const { x, y, z } = projectToWorld(state.x, state.y, state.altitude);
    return {
      position: [x, y, z] as [number, number, number],
      headingRad: ((180 - state.headingDeg) * Math.PI) / 180,
      isFlying: state.altitude > 0,
    };
  }, [state]);

  const obstaclesWorld = useMemo(
    () =>
      (obstacles ?? []).map((b) => {
        const wp = projectToWorld(
          b.position[0],
          b.position[2],
          b.position[1] ?? 0
        );
        const sizeWorld: [number, number, number] = [
          (b.size?.[0] ?? 1) * WORLD_SCALE_VALUE,
          (b.size?.[1] ?? 1) * ALTITUDE_SCALE,
          (b.size?.[2] ?? 1) * WORLD_SCALE_VALUE,
        ];
        return {
          id: b.id,
          type: (b.type ?? "box") as string,
          position: [wp.x, wp.y, wp.z] as [number, number, number],
          size: sizeWorld,
          rotation: b.rotation,
          color: b.color,
          coords: {
            x: b.position[0] - CANVAS_CENTER.x,
            y: b.position[2] - CANVAS_CENTER.y,
            z: b.position[1] ?? 0,
          },
        };
      }),
    [obstacles]
  );

  const goalWorld = useMemo(() => {
    if (!goal) return null;
    const worldPos = projectToWorld(
      goal.position[0],
      goal.position[2],
      goal.position[1] ?? 0
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
        x: goal.position[0] - CANVAS_CENTER.x,
        y: goal.position[2] - CANVAS_CENTER.y,
        altitude: goal.position[1] ?? 0,
      },
    };
  }, [goal]);

  const planeSize: [number, number] = [
    SIM_CANVAS.width * WORLD_SCALE_VALUE,
    SIM_CANVAS.height * WORLD_SCALE_VALUE,
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

    const sampleDistance = cfg.sampleDistance ?? 0.15;
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

    const maxLen = cfg.trailMaxLength ?? 500;
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
  }, [state.x, state.y, state.altitude]);


  const handlePlanePointerMove = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const { x, z } = event.point;
      const canvasCoords = worldToCanvas(x, z);
      setHoverData({
        coords: {
          x: Math.round(canvasCoords.x - CANVAS_CENTER.x),
          y: -Math.round(canvasCoords.y - CANVAS_CENTER.y),
        },
        screen: {
          x: event.clientX,
          y: event.clientY,
        },
      });
    },
    []
  );

  const handlePlanePointerOut = useCallback(() => {
    setHoverData(null);
  }, []);

  return (
    <div className="flex flex-col h-full w-full gap-3 sm:gap-4 p-2 sm:p-4">
      <div className="w-full flex-7 min-h-0 rounded-xl overflow-hidden">
        <Canvas
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
          <color attach="background" args={["#071427"]} />

          <ambientLight intensity={1.2} />
          <SceneLights />
          <Suspense fallback={null}>
            <GroundPlane
              size={planeSize}
              onPointerMove={handlePlanePointerMove}
              onPointerOut={handlePlanePointerOut}
              colorConfig={colorConfig?.map}
            />
            {goalWorld && <GoalMarker goal={goalWorld} />}
            {obstaclesWorld.length > 0 && (
              <ObstacleField obstacles={obstaclesWorld} />
            )}
            {cfg.trailEnabled !== false &&
              trailPoints.length >= 2 &&
              (() => {
                const color = cfg.trailColor ?? "#33F6FF";
                const lineWidth = cfg.lineWidth ?? 4;
                const smoothing = !!cfg.smoothing;
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
              state={droneWorldState}
              colorConfig={colorConfig?.drone}
            />
            {/* {SHOW_CONTACT_SHADOWS && (
              <ContactShadows
                position={CONTACT_SHADOWS_CONFIG.position}
                opacity={CONTACT_SHADOWS_CONFIG.opacity}
                scale={CONTACT_SHADOWS_CONFIG.scale}
                blur={CONTACT_SHADOWS_CONFIG.blur}
                far={CONTACT_SHADOWS_CONFIG.far}
              />
            )} */}
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
      {hoverData && (
        <div
          className="pointer-events-none fixed z-40 rounded-md border border-cyan-500/30 bg-slate-950/90 px-2 py-1 text-[11px] font-mono text-cyan-100 shadow-lg"
          style={{
            top: hoverData.screen.y + 12,
            left: hoverData.screen.x + 12,
          }}
        >
          X {hoverData.coords.x >= 0 ? "+" : ""}
          {hoverData.coords.x}, Z {-hoverData.coords.y >= 0 ? "+" : ""}
          {-hoverData.coords.y}
        </div>
      )}
    </div>
  );
}

export default forwardRef(Simulator3D);
