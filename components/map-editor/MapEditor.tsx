"use client";

import {
  useState,
  useRef,
  useCallback,
  Suspense,
  useMemo,
  useEffect,
  memo,
} from "react";
import { useInView } from "framer-motion";
import { Canvas, useThree, useLoader, useFrame } from "@react-three/fiber";
import GroundPlane from "../simulator3d/GroundPlane";
import { MAP_COLORS, GRID_CONFIG } from "@/lib/models3d/mapConfig";
import { CAMERA_CONFIG } from "@/lib/config3D/cameraConfig";
import { WORLD_SCALE } from "@/lib/config3D/constants";

import {
  OrbitControls,
  TransformControls,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { Box3, Vector3, Quaternion, Euler, Color } from "three";
import DroneBody from "../simulator3d/DroneBody";

import BoxObstacle from "../simulator3d/obstacles/BoxObstacle";
import PreviewModel from "./PreviewModel";
import Tree from "../simulator3d/decor/Tree";
import DiamondBonus from "../simulator3d/bonus/DiamondBonus";
import StarBonus from "../simulator3d/bonus/StarBonus";
import HeartBonus from "../simulator3d/bonus/HeartBonus";
import CheckpointRing from "../simulator3d/checkpoint/CheckpointBeacon";
import RockGLB from "../simulator3d/obstacles/RockGLB";
import GrassGLB from "../simulator3d/decor/GrassGLB";
import Tree2GLB from "../simulator3d/decor/Tree2GLB";
import {
  buildModelCategories,
  getConstraintsForModel,
  applyConstraints,
  getModelConfig,
} from "@/lib/map-editor/editorModels";
import { useToast, ToastContainer } from "./Toast";
// @ts-ignore - FBXLoader typing may not be present in this project
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";

type TransformMode = "translate" | "rotate" | "scale";

type MapObject = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  modelUrl: string;
  scaleLimits?: { min: number; max: number };
  scalable?: boolean;
  rotatable?: boolean;
  collisionRadius?: number;
  isClamped?: boolean;
  color?: string;
  objectType?: "obstacle" | "bonus" | "checkpoint";
  scoreValue?: number;
  radius?: number;
};

type MissionSettings = {
  labName: string;
  description: string;
  timeLimit: number;
  requiredScore: number;
  sequentialCheckpoints: boolean;
};

const DEFAULT_MISSION: MissionSettings = {
  labName: "",
  description: "",
  timeLimit: 120,
  requiredScore: 0,
  sequentialCheckpoints: false,
};

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

type TransformPayload = Partial<MapObject> & { __final?: boolean };

const MODEL_CATEGORIES = buildModelCategories();

const BONUS_LIGHT_COLOR: Record<string, string> = {
  diamond: "#00eeff",
  star: "#ffe234",
  heart: "#ff2d55",
};
const BONUS_ANIM: Record<
  string,
  { rotSpeed: number; floatAmp: number; floatFreq: number; pulseFreq: number }
> = {
  diamond: { rotSpeed: 0.7, floatAmp: 0.28, floatFreq: 1.4, pulseFreq: 2.0 },
  star: { rotSpeed: 1.0, floatAmp: 0.28, floatFreq: 1.6, pulseFreq: 2.8 },
  heart: { rotSpeed: 0.55, floatAmp: 0.28, floatFreq: 1.3, pulseFreq: 2.2 },
};

function AnimatedBonus({ type }: { type: "diamond" | "star" | "heart" }) {
  const groupRef = useRef<any>(null!);
  const lightRef = useRef<any>(null!);
  const anim = BONUS_ANIM[type];
  const color = BONUS_LIGHT_COLOR[type] ?? "#ffffff";

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * anim.rotSpeed;
      groupRef.current.position.y =
        Math.sin(t * anim.floatFreq) * anim.floatAmp;
    }
    if (type === "heart" && groupRef.current) {
      const beat = 1 + Math.abs(Math.sin(t * anim.pulseFreq)) * 0.14;
      groupRef.current.scale.setScalar(beat);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 3.5 + Math.sin(t * anim.pulseFreq) * 1.2;
    }
  });

  return (
    <group>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={3.5}
        distance={10}
        decay={2}
      />
      <group ref={groupRef}>
        {type === "diamond" && <DiamondBonus />}
        {type === "star" && <StarBonus />}
        {type === "heart" && <HeartBonus />}
      </group>
    </group>
  );
}

function SidebarModelPreview({ m }: { m: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { amount: 0.1, once: true });

  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (inView && !shouldRender) {
      timeout = setTimeout(() => setShouldRender(true), 150);
    }
    return () => clearTimeout(timeout);
  }, [inView, shouldRender]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
    >
      {!shouldRender ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-sky-400/20 border-t-sky-400 rounded-full animate-spin" />
          <span className="text-[10px] text-sky-400/50 font-medium uppercase tracking-widest">
            Loading
          </span>
        </div>
      ) : (
        <Canvas
          shadows
          gl={{
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.8,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          camera={{ position: [4, 2.5, 3], fov: 40 }}
          className="w-full h-full"
        >
          <hemisphereLight intensity={1.0} />
          <Environment preset="apartment" blur={0.8} />
          <directionalLight position={[6, 6, 4]} intensity={1.0} />
          <Suspense fallback={null}>
            <PreviewModel model={m} />
          </Suspense>
          <OrbitControls enablePan={false} enableZoom />
        </Canvas>
      )}
    </div>
  );
}

function ModelObject({
  object,
  isSelected,
  onSelect,
  transformMode,
  onObjectTransform,
  onTransformStart,
  onTransformEnd,
  isTransforming,
  mapWorldSize,
  checkpointOrder,
}: {
  object: MapObject;
  isSelected: boolean;
  onSelect: () => void;
  transformMode: TransformMode;
  onObjectTransform: (id: string, transform: TransformPayload) => void;
  onTransformStart: (id?: string) => void;
  onTransformEnd: (id?: string) => void;
  isTransforming: boolean;
  mapWorldSize: number;
  checkpointOrder?: number;
}) {
  const isPrimitive = object.modelUrl?.startsWith?.("primitive:");
  const primitiveType = isPrimitive ? object.modelUrl.split(":")[1] : null;
  const meshRef = useRef<any>();
  const transformRef = useRef<any>();

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      onSelect();
    },
    [onSelect],
  );

  const handleObjectChange = useCallback(() => {
    if (meshRef.current) {
      const position = meshRef.current.position.toArray();
      const rotation = meshRef.current.rotation.toArray().slice(0, 3);
      let scale = meshRef.current.scale.toArray();

      if (transformMode === "scale") {
        if (object.scalable === false) {
          meshRef.current.scale.set(
            object.scale[0],
            object.scale[1],
            object.scale[2],
          );
          scale = [...object.scale];
        } else if (object.scaleLimits) {
          const s = meshRef.current.scale.toArray();
          const min = object.scaleLimits.min;
          const max = object.scaleLimits.max;
          const cx = Math.max(min, Math.min(max, s[0]));
          const cy = Math.max(min, Math.min(max, s[1]));
          const cz = Math.max(min, Math.min(max, s[2]));
          meshRef.current.scale.set(cx, cy, cz);
          scale = [cx, cy, cz];
        }
      }

      const MAP_HALF = mapWorldSize / 2;
      const baseRadius = object.collisionRadius ?? 1;
      const effectiveRadius =
        baseRadius * (meshRef.current.scale.toArray()[0] ?? 1);
      const limit = Math.max(0, MAP_HALF - effectiveRadius);
      const MAX_ALT_CEILING = 50;

      const cx = Math.max(-limit, Math.min(limit, position[0]));
      const cz = Math.max(-limit, Math.min(limit, position[2]));
      const floorConstraint =
        getConstraintsForModel(object.modelUrl)?.translate.y.min ?? 0;

      let finalFloor = floorConstraint;
      if (object.objectType === "bonus") {
        finalFloor = Math.max(finalFloor, effectiveRadius + 0.3);
      }

      const cy = Math.max(finalFloor, Math.min(MAX_ALT_CEILING, position[1]));

      if (cx !== position[0] || cz !== position[2] || cy !== position[1]) {
        meshRef.current.position.set(cx, cy, cz);
        position[0] = cx;
        position[1] = cy;
        position[2] = cz;
      }

      const constraints = getConstraintsForModel(object.modelUrl);
      let finalRotation: [number, number, number] = rotation as [
        number,
        number,
        number,
      ];

      if (constraints) {
        const rc = constraints.rotate;
        const rx = rc.x.locked
          ? (rc.x.lockedValue ?? 0)
          : !rc.x.enabled
            ? object.rotation[0]
            : rotation[0];
        const ry = rc.y.locked
          ? (rc.y.lockedValue ?? 0)
          : !rc.y.enabled
            ? object.rotation[1]
            : rotation[1];
        const rz = rc.z.locked
          ? (rc.z.lockedValue ?? 0)
          : !rc.z.enabled
            ? object.rotation[2]
            : rotation[2];
        finalRotation = [rx, ry, rz];
        meshRef.current.rotation.set(rx, ry, rz);
      } else if (object.rotatable === false) {
        finalRotation = [...object.rotation];
        meshRef.current.rotation.set(
          finalRotation[0],
          finalRotation[1],
          finalRotation[2],
        );
      }

      const updatePayload: Partial<MapObject> = {
        rotation: finalRotation,
        scale: scale as [number, number, number],
        position: position as [number, number, number],
      };

      onObjectTransform(object.id, updatePayload);
    }
  }, [
    onObjectTransform,
    object.id,
    transformMode,
    mapWorldSize,
    object.scale,
    object.scalable,
    object.scaleLimits,
    object.collisionRadius,
  ]);

  useFrame((state) => {
    if (object.isClamped && meshRef.current) {
      const time = state.clock.getElapsedTime();
      const intensity = (Math.sin(time * 15) * 0.5 + 0.5) * 0.8;
      meshRef.current.traverse((node: any) => {
        if (node.isMesh && node.material) {
          if (!node.material._origEmissive) {
            node.material._origEmissive =
              node.material.emissive?.clone() || new Color(0, 0, 0);
          }
          node.material.emissive.setRGB(intensity, 0, 0);
        }
      });
    } else if (meshRef.current) {
      meshRef.current.traverse((node: any) => {
        if (node.isMesh && node.material && node.material._origEmissive) {
          node.material.emissive.copy(node.material._origEmissive);
        }
      });
    }
  });

  const lastSyncRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const finalizingRef = useRef<boolean>(false);
  const THROTTLE_MS = 16;
  const scheduleSync = useCallback(() => {
    if (finalizingRef.current) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      handleObjectChange();
      lastSyncRef.current = Date.now();
      rafRef.current = null;
    });
  }, [handleObjectChange]);

  const handleChangeThrottled = useCallback(() => {
    if (finalizingRef.current) return;
    const now = Date.now();
    if (now - lastSyncRef.current > THROTTLE_MS) {
      handleObjectChange();
      lastSyncRef.current = now;
    } else {
      scheduleSync();
    }
  }, [handleObjectChange, scheduleSync]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return (
    <group>
      {isPrimitive ? (
        primitiveType === "drone" ? (
          <group
            ref={meshRef}
            onClick={handleClick}
            castShadow
            receiveShadow
            position={object.position}
            scale={object.scale}
          >
            <DroneBody
              state={{
                position: [0, 0, 0],
                headingRad: object.rotation[1] ?? 0,
                isFlying: false,
              }}
            />
          </group>
        ) : primitiveType === "box" ? (
          <group
            ref={meshRef}
            onClick={handleClick}
            castShadow
            receiveShadow
            position={object.position}
            rotation={object.rotation}
            scale={object.scale}
          >
            <BoxObstacle
              ob={{
                id: object.id,
                position: [0, 0, 0],
                size: [
                  object.scale[0] * 2,
                  object.scale[1] * 2,
                  object.scale[2] * 2,
                ],
                color: object.color,
              }}
            />
          </group>
        ) : primitiveType === "tree" ? (
          <group
            ref={meshRef}
            onClick={handleClick}
            castShadow
            receiveShadow
            position={object.position}
            rotation={object.rotation}
            scale={object.scale}
          >
            <Tree scale={1} />
          </group>
        ) : primitiveType === "rock" ? (
          <group
            ref={meshRef}
            onClick={handleClick}
            castShadow
            receiveShadow
            position={object.position}
            rotation={object.rotation}
            scale={object.scale}
          >
            <RockGLB physics={false} />
          </group>
        ) : primitiveType === "grass" ? (
          <group
            ref={meshRef}
            onClick={handleClick}
            castShadow
            receiveShadow
            position={object.position}
            rotation={object.rotation}
            scale={object.scale}
          >
            <GrassGLB physics={false} />
          </group>
        ) : primitiveType === "tree2" ? (
          <group
            ref={meshRef}
            onClick={handleClick}
            castShadow
            receiveShadow
            position={object.position}
            rotation={object.rotation}
            scale={object.scale}
          >
            <Tree2GLB physics={false} />
          </group>
        ) : primitiveType === "diamond" ||
          primitiveType === "star" ||
          primitiveType === "heart" ? (
          <group
            ref={meshRef}
            onClick={handleClick}
            position={object.position}
            rotation={object.rotation}
            scale={object.scale}
          >
            <AnimatedBonus
              type={primitiveType as "diamond" | "star" | "heart"}
            />
          </group>
        ) : primitiveType === "checkpoint" ? (
          <group
            ref={meshRef}
            onClick={handleClick}
            position={object.position}
            rotation={object.rotation}
          >
            <CheckpointRing
              radius={object.radius ?? 2}
              order={checkpointOrder ?? 0}
            />
          </group>
        ) : null
      ) : (
        <mesh
          ref={meshRef}
          onClick={handleClick}
          castShadow
          receiveShadow
          position={object.position}
          rotation={object.rotation}
          scale={object.scale}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={"#7f1d1d"} />
        </mesh>
      )}
      {isSelected &&
        meshRef.current &&
        (() => {
          const _c = getConstraintsForModel(object.modelUrl);
          const _showX =
            transformMode === "rotate" ? (_c?.rotate.x.enabled ?? true) : true;
          const _showY =
            transformMode === "translate"
              ? !_c?.translate.y.locked
              : transformMode === "rotate"
                ? (_c?.rotate.y.enabled ?? true)
                : true;
          const _showZ =
            transformMode === "rotate" ? (_c?.rotate.z.enabled ?? true) : true;
          return (
            <TransformControls
              ref={transformRef}
              object={meshRef.current}
              mode={transformMode}
              showX={_showX}
              showY={_showY}
              showZ={_showZ}
              space={transformMode === "scale" ? "local" : "world"}
              onChange={() => {
                if (meshRef.current) {
                  if (transformMode === "scale") {
                    if (object.scalable === false) {
                      meshRef.current.scale.set(
                        object.scale[0],
                        object.scale[1],
                        object.scale[2],
                      );
                    } else if (object.scaleLimits) {
                      const s = meshRef.current.scale.toArray();
                      const min = object.scaleLimits.min;
                      const max = object.scaleLimits.max;
                      const cx = Math.max(min, Math.min(max, s[0]));
                      const cy = Math.max(min, Math.min(max, s[1]));
                      const cz = Math.max(min, Math.min(max, s[2]));
                      if (cx !== s[0] || cy !== s[1] || cz !== s[2]) {
                        meshRef.current.scale.set(cx, cy, cz);
                      }
                    }
                  } else if (transformMode === "rotate") {
                    if (object.rotatable === false) {
                      meshRef.current.rotation.set(
                        object.rotation[0],
                        object.rotation[1],
                        object.rotation[2],
                      );
                    }
                  }

                  handleObjectChange();
                }
                handleChangeThrottled();
              }}
              onMouseDown={() => onTransformStart(object.id)}
              onMouseUp={() => {
                finalizingRef.current = true;
                if (rafRef.current !== null) {
                  cancelAnimationFrame(rafRef.current);
                  rafRef.current = null;
                }
                if (meshRef.current) {
                  meshRef.current.updateMatrixWorld(true);
                  const wp = new Vector3();
                  const wq = new Quaternion();
                  const ws = new Vector3();
                  meshRef.current.getWorldPosition(wp);
                  meshRef.current.getWorldQuaternion(wq);
                  meshRef.current.getWorldScale(ws);
                  const we = new Euler().setFromQuaternion(wq, "XYZ");
                  const constraints = getConstraintsForModel(object.modelUrl);
                  let finalRotation: [number, number, number] = [
                    we.x,
                    we.y,
                    we.z,
                  ];

                  if (constraints) {
                    const rc = constraints.rotate;
                    const rx = rc.x.locked
                      ? (rc.x.lockedValue ?? 0)
                      : !rc.x.enabled
                        ? object.rotation[0]
                        : we.x;
                    const ry = rc.y.locked
                      ? (rc.y.lockedValue ?? 0)
                      : !rc.y.enabled
                        ? object.rotation[1]
                        : we.y;
                    const rz = rc.z.locked
                      ? (rc.z.lockedValue ?? 0)
                      : !rc.z.enabled
                        ? object.rotation[2]
                        : we.z;
                    finalRotation = [rx, ry, rz];
                  } else if (object.rotatable === false) {
                    finalRotation = [...object.rotation];
                  }

                  onObjectTransform(object.id, {
                    position: [wp.x, wp.y, wp.z],
                    rotation: finalRotation,
                    scale: [ws.x, ws.y, ws.z],
                    __final: true,
                  });
                } else {
                  handleObjectChange();
                }
                setTimeout(() => {
                  finalizingRef.current = false;
                  lastSyncRef.current = Date.now();
                }, 80);
                onTransformEnd(object.id);
              }}
            />
          );
        })()}
    </group>
  );
}

function ModelObjectFBX({
  object,
  isSelected,
  onSelect,
  transformMode,
  onObjectTransform,
  onTransformStart,
  onTransformEnd,
  isTransforming,
  mapWorldSize,
}: {
  object: MapObject;
  isSelected: boolean;
  onSelect: () => void;
  transformMode: TransformMode;
  onObjectTransform: (id: string, transform: TransformPayload) => void;
  onTransformStart: (id?: string) => void;
  onTransformEnd: (id?: string) => void;
  isTransforming: boolean;
  mapWorldSize: number;
}) {
  const scene = useLoader(FBXLoader, object.modelUrl) as any;
  const clonedScene = useMemo(() => {
    const c = scene.clone();
    c.traverse((child: any) => {
      if (child && typeof child === "object") child.matrixAutoUpdate = true;
    });
    try {
      const box = new Box3().setFromObject(c);
      const center = new Vector3();
      box.getCenter(center);
      c.position.sub(center);
    } catch (e) {}
    return c;
  }, [scene]);

  const meshRef = useRef<any>();
  const transformRef = useRef<any>();

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      onSelect();
    },
    [onSelect],
  );

  const handleObjectChange = useCallback(() => {
    if (meshRef.current) {
      const position = meshRef.current.position.toArray();
      const rotation = meshRef.current.rotation.toArray().slice(0, 3);
      let scale = meshRef.current.scale.toArray();

      if (transformMode === "scale") {
        if (object.scalable === false) {
          meshRef.current.scale.set(
            object.scale[0],
            object.scale[1],
            object.scale[2],
          );
          scale = [...object.scale];
        } else if (object.scaleLimits) {
          const s = meshRef.current.scale.toArray();
          const min = object.scaleLimits.min;
          const max = object.scaleLimits.max;
          const cx = Math.max(min, Math.min(max, s[0]));
          const cy = Math.max(min, Math.min(max, s[1]));
          const cz = Math.max(min, Math.min(max, s[2]));
          meshRef.current.scale.set(cx, cy, cz);
          scale = [cx, cy, cz];
        }
      }

      const MAP_HALF = mapWorldSize / 2;
      const baseRadius = object.collisionRadius ?? 1;
      const effectiveRadius =
        baseRadius * (meshRef.current.scale.toArray()[0] ?? 1);
      const limit = Math.max(0, MAP_HALF - effectiveRadius);
      const MAX_ALT_CEILING = 50;

      const cx = Math.max(-limit, Math.min(limit, position[0]));
      const cz = Math.max(-limit, Math.min(limit, position[2]));
      const floorConstraint =
        getConstraintsForModel(object.modelUrl)?.translate.y.min ?? 0;

      let finalFloor = floorConstraint;
      if (object.objectType === "bonus") {
        finalFloor = Math.max(finalFloor, effectiveRadius + 0.3);
      }

      const cy = Math.max(finalFloor, Math.min(MAX_ALT_CEILING, position[1]));

      if (cx !== position[0] || cz !== position[2] || cy !== position[1]) {
        meshRef.current.position.set(cx, cy, cz);
        position[0] = cx;
        position[1] = cy;
        position[2] = cz;
      }

      const constraints = getConstraintsForModel(object.modelUrl);
      let finalRotation: [number, number, number] = rotation as [
        number,
        number,
        number,
      ];

      if (constraints) {
        const rc = constraints.rotate;
        const rx = rc.x.locked
          ? (rc.x.lockedValue ?? 0)
          : !rc.x.enabled
            ? object.rotation[0]
            : rotation[0];
        const ry = rc.y.locked
          ? (rc.y.lockedValue ?? 0)
          : !rc.y.enabled
            ? object.rotation[1]
            : rotation[1];
        const rz = rc.z.locked
          ? (rc.z.lockedValue ?? 0)
          : !rc.z.enabled
            ? object.rotation[2]
            : rotation[2];
        finalRotation = [rx, ry, rz];
        meshRef.current.rotation.set(rx, ry, rz);
      } else if (object.rotatable === false) {
        finalRotation = [...object.rotation];
        meshRef.current.rotation.set(
          finalRotation[0],
          finalRotation[1],
          finalRotation[2],
        );
      }

      const updatePayload: Partial<MapObject> = {
        rotation: finalRotation,
        scale: scale as [number, number, number],
        position: position as [number, number, number],
      };

      onObjectTransform(object.id, updatePayload);
    }
  }, [
    onObjectTransform,
    object.id,
    transformMode,
    mapWorldSize,
    object.scale,
    object.scalable,
    object.scaleLimits,
    object.collisionRadius,
  ]);

  useFrame((state) => {
    if (object.isClamped && meshRef.current) {
      const time = state.clock.getElapsedTime();
      const intensity = (Math.sin(time * 15) * 0.5 + 0.5) * 0.8;
      meshRef.current.traverse((node: any) => {
        if (node.isMesh && node.material) {
          if (!node.material._origEmissive) {
            node.material._origEmissive =
              node.material.emissive?.clone() || new Color(0, 0, 0);
          }
          node.material.emissive.setRGB(intensity, 0, 0);
        }
      });
    } else if (meshRef.current) {
      meshRef.current.traverse((node: any) => {
        if (node.isMesh && node.material && node.material._origEmissive) {
          node.material.emissive.copy(node.material._origEmissive);
        }
      });
    }
  });

  const lastSyncRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const finalizingRef = useRef<boolean>(false);
  const THROTTLE_MS = 16;
  const scheduleSync = useCallback(() => {
    if (finalizingRef.current) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      handleObjectChange();
      lastSyncRef.current = Date.now();
      rafRef.current = null;
    });
  }, [handleObjectChange]);

  const handleChangeThrottled = useCallback(() => {
    if (finalizingRef.current) return;
    const now = Date.now();
    if (now - lastSyncRef.current > THROTTLE_MS) {
      handleObjectChange();
      lastSyncRef.current = now;
    } else {
      scheduleSync();
    }
  }, [handleObjectChange, scheduleSync]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return (
    <group>
      <primitive
        ref={meshRef}
        object={clonedScene}
        onClick={handleClick}
        castShadow
        receiveShadow
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
      />
      {isSelected &&
        meshRef.current &&
        (() => {
          const _c = getConstraintsForModel(object.modelUrl);
          const _showX =
            transformMode === "rotate" ? (_c?.rotate.x.enabled ?? true) : true;
          const _showY =
            transformMode === "translate"
              ? !_c?.translate.y.locked
              : transformMode === "rotate"
                ? (_c?.rotate.y.enabled ?? true)
                : true;
          const _showZ =
            transformMode === "rotate" ? (_c?.rotate.z.enabled ?? true) : true;
          return (
            <TransformControls
              ref={transformRef}
              object={meshRef.current}
              mode={transformMode}
              showX={_showX}
              showY={_showY}
              showZ={_showZ}
              space={transformMode === "scale" ? "local" : "world"}
              onChange={() => {
                if (meshRef.current) {
                  if (transformMode === "scale") {
                    if (object.scalable === false) {
                      meshRef.current.scale.set(
                        object.scale[0],
                        object.scale[1],
                        object.scale[2],
                      );
                    } else if (object.scaleLimits) {
                      const s = meshRef.current.scale.toArray();
                      const min = object.scaleLimits.min;
                      const max = object.scaleLimits.max;
                      const cx = Math.max(min, Math.min(max, s[0]));
                      const cy = Math.max(min, Math.min(max, s[1]));
                      const cz = Math.max(min, Math.min(max, s[2]));
                      if (cx !== s[0] || cy !== s[1] || cz !== s[2]) {
                        meshRef.current.scale.set(cx, cy, cz);
                      }
                    }
                  } else if (transformMode === "rotate") {
                    if (object.rotatable === false) {
                      meshRef.current.rotation.set(
                        object.rotation[0],
                        object.rotation[1],
                        object.rotation[2],
                      );
                    }
                  }

                  handleObjectChange();
                }
                handleChangeThrottled();
              }}
              onMouseDown={() => onTransformStart(object.id)}
              onMouseUp={() => {
                finalizingRef.current = true;
                if (rafRef.current !== null) {
                  cancelAnimationFrame(rafRef.current);
                  rafRef.current = null;
                }
                if (meshRef.current) {
                  meshRef.current.updateMatrixWorld(true);
                  const wp = new Vector3();
                  const wq = new Quaternion();
                  const ws = new Vector3();
                  meshRef.current.getWorldPosition(wp);
                  meshRef.current.getWorldQuaternion(wq);
                  meshRef.current.getWorldScale(ws);
                  const we = new Euler().setFromQuaternion(wq, "XYZ");
                  const constraints = getConstraintsForModel(object.modelUrl);
                  let finalRotation: [number, number, number] = [
                    we.x,
                    we.y,
                    we.z,
                  ];

                  if (constraints) {
                    const rc = constraints.rotate;
                    const rx = rc.x.locked
                      ? (rc.x.lockedValue ?? 0)
                      : !rc.x.enabled
                        ? object.rotation[0]
                        : we.x;
                    const ry = rc.y.locked
                      ? (rc.y.lockedValue ?? 0)
                      : !rc.y.enabled
                        ? object.rotation[1]
                        : we.y;
                    const rz = rc.z.locked
                      ? (rc.z.lockedValue ?? 0)
                      : !rc.z.enabled
                        ? object.rotation[2]
                        : we.z;
                    finalRotation = [rx, ry, rz];
                  } else if (object.rotatable === false) {
                    finalRotation = [...object.rotation];
                  }

                  onObjectTransform(object.id, {
                    position: [wp.x, wp.y, wp.z],
                    rotation: finalRotation,
                    scale: [ws.x, ws.y, ws.z],
                    __final: true,
                  });
                } else {
                  handleObjectChange();
                }
                setTimeout(() => {
                  finalizingRef.current = false;
                  lastSyncRef.current = Date.now();
                }, 80);
                onTransformEnd(object.id);
              }}
            />
          );
        })()}
    </group>
  );
}

function ModelObjectWrapper(props: {
  object: MapObject;
  isSelected: boolean;
  onSelect: () => void;
  transformMode: TransformMode;
  onObjectTransform: (id: string, transform: TransformPayload) => void;
  onTransformStart: (id?: string) => void;
  onTransformEnd: (id?: string) => void;
  isTransforming: boolean;
  mapWorldSize: number;
  checkpointOrder?: number;
}) {
  const ext = (props.object.modelUrl || "").split(".").pop()?.toLowerCase();
  if (ext === "fbx") return <ModelObjectFBX {...props} />;
  return <ModelObject {...props} />;
}

const MemoModelObject = memo(ModelObjectWrapper);

function Scene({
  objects,
  selectedObjectId,
  onSelectObject,
  transformMode,
  onObjectTransform,
  disableOrbitControls,
  onTransformStart,
  onTransformEnd,
  mapCells,
}: {
  objects: MapObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  transformMode: TransformMode;
  onObjectTransform: (id: string, transform: Partial<MapObject>) => void;
  disableOrbitControls: boolean;
  onTransformStart: (id?: string) => void;
  onTransformEnd: (id?: string) => void;
  mapCells: number;
}) {
  const { camera, gl } = useThree();

  const handleCanvasClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      onSelectObject(null);
    },
    [onSelectObject],
  );

  return (
    <Suspense fallback={null}>
      <hemisphereLight intensity={1} groundColor="#444444" color="#ffffff" />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Environment preset="apartment" blur={0.8} />
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.4}
        scale={mapCells * GRID_CONFIG.sectionSize}
        blur={2.5}
        far={1.5}
      />

      {(() => {
        const worldSize = mapCells * GRID_CONFIG.sectionSize;
        const planeSize: [number, number] = [worldSize, worldSize];
        return (
          <>
            <GroundPlane
              size={planeSize}
              colorConfig={{
                ground: MAP_COLORS.GROUND.color,
                grid: MAP_COLORS.GRID.sectionColor,
                border: MAP_COLORS.BORDER.color,
              }}
              bgOpacity={0}
            />
            <mesh
              rotation-x={-Math.PI / 2}
              position={[0, 0.01, 0]}
              onClick={handleCanvasClick}
            >
              <planeGeometry args={planeSize} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </>
        );
      })()}

      {(() => {
        let cpIdx = 0;
        return objects.map((object) => {
          const isCheckpoint = object.objectType === "checkpoint";
          const order = isCheckpoint ? cpIdx : undefined;
          if (isCheckpoint) cpIdx++;
          return (
            <MemoModelObject
              key={object.id}
              object={object}
              isSelected={selectedObjectId === object.id}
              onSelect={() => onSelectObject(object.id)}
              transformMode={transformMode}
              onObjectTransform={onObjectTransform}
              onTransformStart={onTransformStart}
              onTransformEnd={onTransformEnd}
              isTransforming={disableOrbitControls}
              mapWorldSize={mapCells * GRID_CONFIG.sectionSize}
              checkpointOrder={order}
            />
          );
        });
      })()}

      <OrbitControls
        enablePan={!disableOrbitControls}
        enableZoom={!disableOrbitControls}
        enableRotate={!disableOrbitControls}
        maxPolarAngle={Math.PI / 2}
        maxDistance={mapCells * GRID_CONFIG.sectionSize * 1.5}
      />
    </Suspense>
  );
}

function MapEditorContent() {
  const [objects, setObjects] = useState<MapObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [transformMode, setTransformMode] =
    useState<TransformMode>("translate");
  const [isTransforming, setIsTransforming] = useState(false);
  const [lockedObjectId, setLockedObjectId] = useState<string | null>(null);
  const finalizingRef = useRef<boolean>(false);
  const [mapCells, setMapCells] = useState(20);
  const mapWorldSize = mapCells * GRID_CONFIG.sectionSize;

  const [clipboardObject, setClipboardObject] = useState<Omit<
    MapObject,
    "id"
  > | null>(null);

  const { toasts, dismiss, toast } = useToast();

  const [missionSettings, setMissionSettings] =
    useState<MissionSettings>(DEFAULT_MISSION);
  const [showMissionModal, setShowMissionModal] = useState(false);

  const [missionRunning, setMissionRunning] = useState(false);
  const [missionTimeLeft, setMissionTimeLeft] = useState(0);
  const [missionResult, setMissionResult] = useState<"pass" | "fail" | null>(
    null,
  );
  const [collectedCheckpoints, setCollectedCheckpoints] = useState<Set<number>>(
    new Set(),
  );
  const [currentScore, setCurrentScore] = useState(0);
  const missionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (missionRunning && missionTimeLeft > 0) {
      missionTimerRef.current = setInterval(() => {
        setMissionTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(missionTimerRef.current!);
            setMissionRunning(false);
            setMissionResult("fail");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (missionTimerRef.current) clearInterval(missionTimerRef.current);
    };
  }, [missionRunning]);

  useEffect(() => {
    if (!missionRunning) return;
    const checkpoints = objects.filter((o) => o.objectType === "checkpoint");
    const cpCondition =
      checkpoints.length === 0 ||
      collectedCheckpoints.size === checkpoints.length;
    const scoreCondition =
      missionSettings.requiredScore <= 0 ||
      currentScore >= missionSettings.requiredScore;
    const hasWinCondition =
      checkpoints.length > 0 || missionSettings.requiredScore > 0;
    if (hasWinCondition && cpCondition && scoreCondition) {
      clearInterval(missionTimerRef.current!);
      setMissionRunning(false);
      setMissionResult("pass");
    }
  }, [
    collectedCheckpoints,
    currentScore,
    missionRunning,
    objects,
    missionSettings.requiredScore,
  ]);

  const startMission = useCallback(() => {
    setCollectedCheckpoints(new Set());
    setCurrentScore(0);
    setMissionResult(null);
    setMissionTimeLeft(missionSettings.timeLimit);
    setMissionRunning(true);
  }, [missionSettings.timeLimit]);

  const stopMission = useCallback(() => {
    if (missionTimerRef.current) clearInterval(missionTimerRef.current);
    setMissionRunning(false);
    setMissionResult(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA";

      if (e.key === "Tab") {
        e.preventDefault();
        setTransformMode((prev) => {
          if (prev === "translate") return "rotate";
          if (prev === "rotate") return "scale";
          return "translate";
        });
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedObjectId) {
        if (isInput) return;
        e.preventDefault();
        setObjects((prev) => prev.filter((o) => o.id !== selectedObjectId));
        setSelectedObjectId(null);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !isInput) {
        if (e.key === "c" || e.key === "x") {
          e.preventDefault();
          const obj = objects.find((o) => o.id === selectedObjectId);
          if (obj) {
            const isDrone = obj.modelUrl?.startsWith("primitive:drone");
            if (isDrone && e.key === "c") {
              toast.error("Drone là object duy nhất, không thể copy.");
              return;
            }
            if (!isDrone) {
              const { id: _id, ...rest } = obj;
              setClipboardObject(rest);
            }
            if (e.key === "x") {
              setObjects((prev) =>
                prev.filter((o) => o.id !== selectedObjectId),
              );
              setSelectedObjectId(null);
            }
          }
          return;
        }

        if (e.key === "v") {
          e.preventDefault();
          if (!clipboardObject) return;
          if (clipboardObject.modelUrl?.startsWith("primitive:drone")) {
            toast.warning("Drone là object duy nhất, không thể paste.");
            return;
          }
          const newObj: MapObject = {
            ...clipboardObject,
            id: `object-${Date.now()}-${Math.random()}`,
            position: [
              clipboardObject.position[0] + 1,
              clipboardObject.position[1],
              clipboardObject.position[2] + 1,
            ],
            isClamped: false,
          };
          setObjects((prev) => [...prev, newObj]);
          setTimeout(() => setSelectedObjectId(newObj.id), 0);
          return;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedObjectId, clipboardObject, objects]);

  useEffect(() => {
    setObjects((prev) =>
      prev.map((obj) => {
        const constraints = getConstraintsForModel(obj.modelUrl);
        if (constraints) {
          return applyConstraints(obj, constraints, mapWorldSize / 2);
        }
        return obj;
      }),
    );
  }, [mapCells, mapWorldSize]);

  const handleObjectTransform = useCallback(
    (id: string, transform: TransformPayload) => {
      setObjects((prev) =>
        prev.map((obj) => {
          if (obj.id !== id) return obj;
          const merged = { ...obj, ...transform };
          if (transform.scale) {
            if (obj.scalable === false) {
              // --
              return { ...obj, scale: obj.scale };
            } else if (obj.scaleLimits) {
              const incoming = transform.scale ?? obj.scale;
              const min = obj.scaleLimits.min;
              const max = obj.scaleLimits.max;
              const cx = Math.max(min, Math.min(max, incoming[0]));
              const cy = Math.max(min, Math.min(max, incoming[1]));
              const cz = Math.max(min, Math.min(max, incoming[2]));
              merged.scale = [cx, cy, cz];
            } else {
              merged.scale = transform.scale ?? obj.scale;
            }
          }
          if (transform.rotation) {
            if (obj.rotatable === false) {
              merged.rotation = obj.rotation;
            } else {
              merged.rotation = [
                obj.rotation[0],
                transform.rotation[1],
                obj.rotation[2],
              ];
            }
          }

          if (transform.position) {
            const MAP_HALF = mapWorldSize / 2;
            const incomingPos = transform.position;
            const baseRadius = merged.collisionRadius ?? 1;
            const effectiveRadius =
              baseRadius * (merged.scale ? merged.scale[0] : obj.scale[0]);

            const limit = Math.max(0, MAP_HALF - effectiveRadius);
            const MAX_ALT_CEILING = 50;
            const floor =
              getConstraintsForModel(merged.modelUrl)?.translate.y.min ?? 0;

            if ((transform as any).__final) {
              const nx = Math.max(-limit, Math.min(limit, incomingPos[0]));
              const nz = Math.max(-limit, Math.min(limit, incomingPos[2]));
              const ny = Math.max(
                floor,
                Math.min(MAX_ALT_CEILING, incomingPos[1]),
              );

              merged.position = [nx, ny, nz];
              merged.isClamped = false;
            } else {
              const clampedX = Math.max(
                -limit,
                Math.min(limit, incomingPos[0]),
              );
              const clampedZ = Math.max(
                -limit,
                Math.min(limit, incomingPos[2]),
              );
              const clampedY = Math.max(
                floor,
                Math.min(MAX_ALT_CEILING, incomingPos[1]),
              );

              const wasClamped =
                clampedX !== incomingPos[0] ||
                clampedZ !== incomingPos[2] ||
                clampedY !== incomingPos[1];
              merged.position = [clampedX, clampedY, clampedZ];
              merged.isClamped = wasClamped;
            }
          }
          const modelConstraints = getConstraintsForModel(merged.modelUrl);
          if (modelConstraints) {
            const constrained = applyConstraints(
              merged as any,
              modelConstraints,
              mapWorldSize / 2,
            );
            merged.position = constrained.position;
            merged.rotation = constrained.rotation;
            merged.scale = constrained.scale;
          }
          return merged;
        }),
      );
    },
    [lockedObjectId, mapWorldSize],
  );

  const addPredefinedModel = useCallback(
    (
      m: {
        id: string;
        name: string;
        url: string;
        defaultScale: number;
        minScale: number;
        maxScale: number;
        scalable?: boolean;
        category?: string;
        rotatable?: boolean;
        hasColor?: boolean;
        defaultScoreValue?: number;
        defaultRadius?: number;
      },
      position?: [number, number, number],
    ) => {
      if (m.id === "drone") {
        const existingDrone = objects.find((o) =>
          (o.modelUrl || "").startsWith("primitive:drone"),
        );
        if (existingDrone) {
          toast.error("Drone đã tồn tại trong scene!");
          setSelectedObjectId(existingDrone.id);
          return;
        }
      }

      setObjects((prev) => {
        const newObj: MapObject = {
          id: `object-${Date.now()}-${Math.random()}`,
          position: position ?? [
            Math.random() * 4 - 2,
            0,
            Math.random() * 4 - 2,
          ],
          rotation: [0, 0, 0],
          scale: [m.defaultScale, m.defaultScale, m.defaultScale],
          scaleLimits:
            m.scalable === false
              ? undefined
              : { min: m.minScale, max: m.maxScale },
          scalable: m.scalable === false ? false : true,
          rotatable: m.rotatable !== false,
          modelUrl: m.url,
          color: m.hasColor ? "#3AC0D3" : undefined,
        };
        const config = getModelConfig(m.url);
        if (config) {
          newObj.collisionRadius = config.collisionRadius;
        }

        if (m.category === "bonus") {
          newObj.objectType = "bonus";
          newObj.scoreValue = m.defaultScoreValue ?? 10;
        } else if (m.category === "checkpoint") {
          newObj.objectType = "checkpoint";
          newObj.radius = m.defaultRadius ?? 2;
          newObj.scale = [1, 1, 1];
          newObj.scalable = false;
          newObj.position[1] = Math.max(2, newObj.position[1]);
        } else if (m.category === "obstacle" || m.category === "decor") {
          newObj.objectType = "obstacle";
        }

        const constraints = getConstraintsForModel(newObj.modelUrl);
        if (constraints) {
          const constrained = applyConstraints(
            newObj,
            constraints,
            mapWorldSize / 2,
          );
          newObj.position = constrained.position;
          newObj.rotation = constrained.rotation;
          newObj.scale = constrained.scale;
        }

        setTimeout(() => setSelectedObjectId(newObj.id), 0);
        return [...prev, newObj];
      });
    },
    [mapWorldSize, objects, toast],
  );

  const handleTransformStart = useCallback((id?: string) => {
    setIsTransforming(true);
    if (id) {
      setLockedObjectId(id);
    }
  }, []);

  const handleTransformEnd = useCallback((id?: string) => {
    setIsTransforming(false);
    if (id) {
      setLockedObjectId((prev) => (prev === id ? null : prev));
    }
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedObjectId) return;
    setObjects((prev) => prev.filter((o) => o.id !== selectedObjectId));
    setSelectedObjectId(null);
  }, [selectedObjectId]);

  const toggleScalable = useCallback((id: string) => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== id) return obj;
        return { ...obj, scalable: !(obj.scalable ?? true) };
      }),
    );
  }, []);

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);
  const updateObjectProps = useCallback(
    (id: string, patch: Partial<MapObject> & { color?: string }) => {
      setObjects((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...patch } : o)),
      );
    },
    [],
  );

  const categories = useMemo(() => [...MODEL_CATEGORIES], []);

  // Export / Import
  const exportLabData = useCallback(() => {
    const checkpoints = objects.filter((o) => o.objectType === "checkpoint");
    const bonusItems = objects.filter((o) => o.objectType === "bonus");
    const obstacles = objects.filter(
      (o) =>
        o.objectType === "obstacle" ||
        (!o.objectType && o.modelUrl !== "primitive:checkpoint"),
    );

    const labData = {
      labName: missionSettings.labName,
      description: missionSettings.description,
      timeLimit: missionSettings.timeLimit,
      requiredScore: missionSettings.requiredScore,
      sequentialCheckpoints: missionSettings.sequentialCheckpoints,
      obstacles: obstacles.map((o) => ({
        id: o.id,
        modelUrl: o.modelUrl,
        position: o.position,
        rotation: o.rotation,
        scale: o.scale,
        color: o.color,
      })),
      bonusItems: bonusItems.map((o) => ({
        id: o.id,
        modelUrl: o.modelUrl,
        position: o.position,
        rotation: o.rotation,
        scale: o.scale,
        scoreValue: o.scoreValue ?? 10,
      })),
      checkpoints: checkpoints.map((o, idx) => ({
        id: o.id,
        modelUrl: o.modelUrl,
        position: o.position,
        rotation: o.rotation,
        radius: o.radius ?? 2,
        order: idx,
      })),
    };
    const blob = new Blob([JSON.stringify(labData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${missionSettings.labName || "lab"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [objects, missionSettings]);

  const loadLabData = useCallback(
    (json: any) => {
      try {
        setMissionSettings({
          labName: json.labName ?? "",
          description: json.description ?? "",
          timeLimit: json.timeLimit ?? 120,
          requiredScore: json.requiredScore ?? 0,
          sequentialCheckpoints: json.sequentialCheckpoints ?? false,
        });

        const spawned: MapObject[] = [];

        for (const o of json.obstacles ?? []) {
          spawned.push({
            id: `loaded-${Date.now()}-${Math.random()}`,
            modelUrl: o.modelUrl,
            position: o.position,
            rotation: o.rotation,
            scale: o.scale,
            color: o.color,
            objectType: "obstacle",
            scalable: true,
            rotatable: true,
          });
        }

        for (const o of json.bonusItems ?? []) {
          spawned.push({
            id: `loaded-${Date.now()}-${Math.random()}`,
            modelUrl: o.modelUrl,
            position: o.position,
            rotation: o.rotation,
            scale: o.scale,
            objectType: "bonus",
            scoreValue: o.scoreValue ?? 10,
            scalable: true,
            rotatable: true,
          });
        }

        for (let idx = 0; idx < (json.checkpoints ?? []).length; idx++) {
          const o = json.checkpoints[idx];
          spawned.push({
            id: `loaded-${Date.now()}-${Math.random()}`,
            modelUrl: "primitive:checkpoint",
            position: o.position,
            rotation: o.rotation,
            scale: [1, 1, 1],
            objectType: "checkpoint",
            radius: o.radius ?? 2,
            scalable: false,
            rotatable: true,
          });
        }

        setObjects(spawned);
        setSelectedObjectId(null);
        stopMission();
      } catch (err) {
        alert("Failed to load lab data: " + (err as any)?.message);
      }
    },
    [stopMission],
  );

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewModelId, setPreviewModelId] = useState<string | null>(null);

  const handleSetCategory = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedObjectId(null);
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, []);

  return (
    <div className="fixed inset-0 flex bg-gray-900 text-gray-100 overflow-hidden">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      {/* Left sidebar */}
      <aside
        className="
    w-85 sm:w-[420px] h-full
    bg-[linear-gradient(180deg,#041129_0%,#071426_45%,#020617_100%)]
    border-r border-white/6
    flex
    overflow-y-auto
    scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent 
  "
      >
        {/* Category  */}
        <nav className="sticky top-0 h-full w-16 sm:w-20 flex flex-col items-center gap-4 py-6 bg-[#061a2b]/80 backdrop-blur-xl border-r border-white/6 ring-1 ring-white/5">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSetCategory(cat.id)}
                title={cat.name}
                className={`
            relative w-10 h-10 sm:w-12 sm:h-12 rounded  
            flex items-center justify-center
            transition-all duration-250
            ${
              active
                ? "bg-linear-to-br from-sky-400 to-blue-600 text-white shadow-lg"
                : "bg-white/4 text-gray-400 hover:bg-white/8 hover:text-white"
            }
          `}
              >
                <span className="text-lg">{cat.icon}</span>
              </button>
            );
          })}
        </nav>

        {/* Asset  */}
        <div className="flex-1 px-4 py-5">
          <div className="grid grid-cols-2 gap-4">
            {MODEL_CATEGORIES.find(
              (c) => c.id === selectedCategory,
            )?.models.map((m) => (
              <div
                key={m.id}
                className="group relative flex flex-col rounded-xl overflow-hidden border border-white/[0.08] hover:border-sky-400/40 bg-[linear-gradient(160deg,#0c1a30_0%,#06101e_100%)] transition-all duration-200 hover:shadow-[0_0_24px_rgba(56,189,248,0.10)]"
              >
                {/* Colored accent line top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500/0 via-sky-400/60 to-sky-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                {/* Preview */}
                <div className="relative h-28 sm:h-36 overflow-hidden">
                  {m.defaultScoreValue && (
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-semibold">
                      ✦ {m.defaultScoreValue} pts
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(56,189,248,0.08),transparent_70%)]" />
                  <div className="w-full h-full group-hover:scale-[1.04] transition-transform duration-300 ease-out">
                    <SidebarModelPreview m={m} />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-t border-white/[0.06] bg-white/[0.02]">
                  <span className="text-[13px] font-semibold text-white truncate flex-1 tracking-tight">
                    {m.name}
                  </span>
                  <button
                    onClick={() => addPredefinedModel(m)}
                    aria-label={`Add ${m.name}`}
                    className="shrink-0 w-7 h-7 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.1] hover:border-sky-400/30 flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-95"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-2.5 bg-[#07111f]/95 border-b border-white/[0.06] backdrop-blur-md flex-wrap gap-y-2">
          {/* Map size */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              className="text-slate-400 shrink-0"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M3 9h18M9 3v18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={mapCells}
              onChange={(e) => setMapCells(Number(e.target.value))}
              className="w-20 h-0.5 accent-sky-400 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              {mapCells}×{mapCells}m
            </span>
          </div>

          <div className="h-5 w-px bg-white/10" />

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowMissionModal(true)}
              title="Mission Settings"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 hover:text-white transition-all duration-150 border border-white/[0.07] hover:border-white/[0.13]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              Mission
            </button>

            <button
              onClick={exportLabData}
              title="Export lab as JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 hover:text-white transition-all duration-150 border border-white/[0.07] hover:border-white/[0.13]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3v13M7 11l5 5 5-5M5 20h14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Export
            </button>

            <label
              title="Load lab from JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 hover:text-white transition-all duration-150 border border-white/[0.07] hover:border-white/[0.13] cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21V8M7 13l5-5 5 5M5 4h14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Load
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    try {
                      loadLabData(JSON.parse(evt.target!.result as string));
                    } catch {
                      toast.error("Invalid JSON file");
                    }
                  };
                  reader.readAsText(file);
                  e.target.value = "";
                }}
              />
            </label>

            {clipboardObject && (
              <button
                onClick={() => {
                  const newObj: MapObject = {
                    ...clipboardObject,
                    id: `object-${Date.now()}-${Math.random()}`,
                    position: [
                      clipboardObject.position[0] + 1,
                      clipboardObject.position[1],
                      clipboardObject.position[2] + 1,
                    ],
                    isClamped: false,
                  };
                  setObjects((prev) => [...prev, newObj]);
                  setTimeout(() => setSelectedObjectId(newObj.id), 0);
                }}
                title="Paste copied object (Ctrl+V)"
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 transition-all duration-150 border border-sky-500/20 hover:border-sky-400/40"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="8"
                    y="4"
                    width="12"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M8 8H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                Paste
                <kbd className="px-1 py-px bg-sky-950/60 rounded text-[9px] font-mono border border-sky-700/30 leading-tight opacity-70">
                  ⌃V
                </kbd>
              </button>
            )}
          </div>

          {/* Mission HUD */}
          {missionRunning && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {Math.floor(missionTimeLeft / 60)
                .toString()
                .padStart(2, "0")}
              :{(missionTimeLeft % 60).toString().padStart(2, "0")}
            </span>
          )}
          {missionResult === "pass" && (
            <span className="px-3 py-1.5 text-[11px] rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold tracking-wide">
              PASS
            </span>
          )}
          {missionResult === "fail" && (
            <span className="px-3 py-1.5 text-[11px] rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 font-semibold tracking-wide">
              FAIL
            </span>
          )}

          {/* Transform mode */}
          <div className="ml-auto relative">
            <div className="flex items-center gap-0.5 rounded-lg bg-white/[0.04] p-0.5 border border-white/[0.07]">
              {[
                {
                  mode: "translate" as TransformMode,
                  label: "Move",
                  icon: (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 3v18M3 12h18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 3l-3 4M12 3l3 4M12 21l-3-4M12 21l3-4M3 12l4-3M3 12l4 3M21 12l-4-3M21 12l-4 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ),
                },
                {
                  mode: "rotate" as TransformMode,
                  label: "Rotate",
                  icon: (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2v4M20.364 4.636A9 9 0 1012 21"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  ),
                },
                {
                  mode: "scale" as TransformMode,
                  label: "Scale",
                  icon: (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  ),
                },
              ].map(({ mode, label, icon }) => (
                <button
                  key={mode}
                  onClick={() => setTransformMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md transition-all duration-150 ${
                    transformMode === mode
                      ? "bg-sky-500/20 text-sky-300"
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
            <kbd className="absolute -top-2 -left-2 px-1 py-px bg-[#07111f] text-slate-600 rounded text-[9px] font-mono border border-white/[0.06] leading-tight">
              Tab
            </kbd>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 relative">
          {selectedObject && (
            <button
              onClick={handleDeleteSelected}
              title="Delete selected object (Del / Backspace)"
              className="absolute left-4 top-4 z-40 group flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/80 hover:bg-red-700/90 border border-red-500/30 hover:border-red-400/60 text-red-400 hover:text-white text-[12px] font-medium backdrop-blur-sm shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Delete
              <kbd className="ml-0.5 px-1 py-px bg-red-950/60 rounded text-[9px] font-mono border border-red-700/50 leading-tight text-red-500 group-hover:border-red-500/50 group-hover:text-red-300 transition-colors">
                Del
              </kbd>
            </button>
          )}
          {selectedObject && transformMode === "rotate" && (
            <div className="absolute right-6 top-6 z-40 bg-gray-800/90 text-gray-100 p-3 rounded border border-gray-700 w-40">
              <div className="text-sm font-medium mb-2">Rotate (Y)</div>
              <div className="flex gap-2 items-center">
                <button
                  title="Rotate +90°"
                  className="w-10 h-8 flex items-center justify-center bg-gray-700 rounded"
                  onClick={() => {
                    const d = degToRad(90);
                    const y = (selectedObject.rotation[1] ?? 0) + d;
                    finalizingRef.current = true;
                    updateObjectProps(selectedObject.id, {
                      rotation: [
                        selectedObject.rotation[0],
                        y,
                        selectedObject.rotation[2],
                      ],
                    });
                    setTimeout(() => {
                      finalizingRef.current = false;
                    }, 80);
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2v4M20.364 4.636A9 9 0 1012 21"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
          {selectedObject &&
            transformMode === "scale" &&
            (() => {
              const sc = getConstraintsForModel(selectedObject.modelUrl)?.scale;
              if (!sc) return null;
              const hasAnyScale = sc.x.enabled || sc.y.enabled || sc.z.enabled;
              if (!hasAnyScale) return null;
              const modelCfg = getModelConfig(selectedObject.modelUrl);
              const axes = [
                { key: "x" as const, label: "Width (X)", idx: 0 },
                { key: "y" as const, label: "Height (Y)", idx: 1 },
                { key: "z" as const, label: "Depth (Z)", idx: 2 },
              ];
              return (
                <div className="absolute right-6 top-6 z-30 bg-gray-800/80 text-gray-100 p-3 rounded border border-gray-700 w-48">
                  <div className="text-sm font-medium mb-2">Properties</div>
                  {modelCfg?.hasColor && (
                    <>
                      <label className="text-xs">Color</label>
                      <input
                        type="color"
                        value={(selectedObject as any).color ?? "#00d9ff"}
                        onChange={(e) =>
                          updateObjectProps(selectedObject.id, {
                            color: e.target.value,
                          })
                        }
                        className="w-full h-8 mb-2 p-0 border-0"
                      />
                    </>
                  )}
                  <div className="space-y-2">
                    {axes.map(({ key, label, idx }) => {
                      const ac = sc[key];
                      if (!ac.enabled) return null;
                      return (
                        <div key={key}>
                          <label className="text-xs">{label}</label>
                          <input
                            type="range"
                            min={ac.min ?? 0.2}
                            max={ac.max ?? 3}
                            step={0.01}
                            value={selectedObject.scale[idx]}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              const s: [number, number, number] = [
                                ...selectedObject.scale,
                              ];
                              s[idx] = v;
                              if (sc.uniform) {
                                s[0] = v;
                                s[1] = v;
                                s[2] = v;
                              }
                              updateObjectProps(selectedObject.id, {
                                scale: s,
                              });
                            }}
                            className="w-full"
                          />
                        </div>
                      );
                    })}

                    {/* {getConstraintsForModel(selectedObject.modelUrl)?.rotate.y
                      .enabled && (
                        <div className="mt-2">
                          <button
                            className="px-3 py-1 bg-gray-700 rounded text-sm"
                            onClick={() => {
                              const d = degToRad(90);
                              const y = (selectedObject.rotation[1] ?? 0) + d;
                              updateObjectProps(selectedObject.id, {
                                rotation: [
                                  selectedObject.rotation[0],
                                  y,
                                  selectedObject.rotation[2],
                                ],
                              });
                            }}
                          >
                            Rotate +90°
                          </button>
                        </div>
                      )} */}
                    <button
                      onClick={handleDeleteSelected}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-900/40 hover:bg-red-700/60 border border-red-700/40 hover:border-red-500/60 rounded text-red-400 hover:text-red-200 text-[11px] font-medium transition-all duration-150"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Remove Object
                    </button>
                  </div>
                </div>
              );
            })()}

          {/* ── Bonus Item: Score Value panel (any transform mode) ─────── */}
          {/* {selectedObject?.objectType === "bonus" && (
            <div className="absolute right-6 top-6 z-40 bg-gray-800/90 text-gray-100 p-3 rounded border border-gray-700 w-52 shade-lg">
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <span>💎 Bonus Properties</span>
              </div>
              <div className="px-3 py-2 bg-indigo-500/20 border border-indigo-400/30 rounded text-indigo-200 text-sm font-semibold text-center">
                Fixed Value: {selectedObject.scoreValue ?? 10} Points
              </div>
              <button
                onClick={handleDeleteSelected}
                className="mt-3 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-900/40 hover:bg-red-700/60 border border-red-700/40 hover:border-red-500/60 rounded text-red-400 hover:text-red-200 text-[11px] font-medium transition-all duration-150"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Remove Object
              </button>
            </div>
          )} */}

          {selectedObject?.objectType === "checkpoint" &&
            (() => {
              const cpIndex = objects
                .filter((o) => o.objectType === "checkpoint")
                .findIndex((o) => o.id === selectedObject.id);
              return (
                <div className="absolute right-6 top-6 z-40 bg-gray-800/90 text-gray-100 p-3 rounded border border-gray-700 w-52">
                  <div className="text-sm font-medium mb-2">
                    🔵 Checkpoint Properties
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    Order:{" "}
                    <span className="text-white font-mono">#{cpIndex + 1}</span>
                  </div>
                  <label className="text-xs text-gray-400">Radius</label>
                  <input
                    type="range"
                    min={4}
                    max={10}
                    step={0.5}
                    value={selectedObject.radius ?? 2}
                    onChange={(e) =>
                      updateObjectProps(selectedObject.id, {
                        radius: parseFloat(e.target.value),
                      })
                    }
                    className="w-full mt-1"
                  />
                  {/* <div className="text-xs text-gray-400 mt-1">
                    {(selectedObject.radius ?? 2).toFixed(2)} m
                  </div> */}
                  <button
                    onClick={handleDeleteSelected}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-900/40 hover:bg-red-700/60 border border-red-700/40 hover:border-red-500/60 rounded text-red-400 hover:text-red-200 text-[11px] font-medium transition-all duration-150"
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Remove Checkpoint
                  </button>
                </div>
              );
            })()}

          {/* ── Mission Settings Modal ────────────────────────────────── */}
          {showMissionModal && (
            <div
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowMissionModal(false);
              }}
            >
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-[380px] shadow-2xl text-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold">
                    ⚙ Mission Settings
                  </h2>
                  <button
                    onClick={() => setShowMissionModal(false)}
                    className="text-gray-500 hover:text-white text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Lab Name
                    </label>
                    <input
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
                      value={missionSettings.labName}
                      onChange={(e) =>
                        setMissionSettings((s) => ({
                          ...s,
                          labName: e.target.value,
                        }))
                      }
                      placeholder="My Lab"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm resize-none h-20"
                      value={missionSettings.description}
                      onChange={(e) =>
                        setMissionSettings((s) => ({
                          ...s,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe the mission objectives…"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Time Limit (s)
                      </label>
                      <input
                        type="number"
                        min={10}
                        step={5}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
                        value={missionSettings.timeLimit}
                        onChange={(e) =>
                          setMissionSettings((s) => ({
                            ...s,
                            timeLimit: Math.max(10, Number(e.target.value)),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Required Score
                      </label>
                      <input
                        type="number"
                        min={0}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
                        value={missionSettings.requiredScore}
                        onChange={(e) =>
                          setMissionSettings((s) => ({
                            ...s,
                            requiredScore: Math.max(0, Number(e.target.value)),
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="seq-cp"
                      type="checkbox"
                      checked={missionSettings.sequentialCheckpoints}
                      onChange={(e) =>
                        setMissionSettings((s) => ({
                          ...s,
                          sequentialCheckpoints: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-[#3AC0D3]"
                    />
                    <label
                      htmlFor="seq-cp"
                      className="text-sm text-gray-300 cursor-pointer"
                    >
                      Sequential Checkpoints
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => setShowMissionModal(false)}
                    className="px-4 py-2 text-sm rounded bg-gray-700 hover:bg-gray-600"
                  >
                    Close
                  </button>
                  {!missionRunning ? (
                    <button
                      onClick={() => {
                        setShowMissionModal(false);
                        startMission();
                      }}
                      className="px-4 py-2 text-sm rounded bg-emerald-700 hover:bg-emerald-600 text-white font-medium"
                    >
                      ▶ Start Mission
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowMissionModal(false);
                        stopMission();
                      }}
                      className="px-4 py-2 text-sm rounded bg-red-700 hover:bg-red-600 text-white font-medium"
                    >
                      ■ Stop Mission
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <Canvas
            shadows
            gl={{
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 0.8,
              outputColorSpace: THREE.SRGBColorSpace,
              preserveDrawingBuffer: true,
            }}
            camera={{
              position: CAMERA_CONFIG.INITIAL_POSITION,
              fov: CAMERA_CONFIG.FOV,
              near: CAMERA_CONFIG.NEAR,
              far: 5000,
            }}
            className="w-full h-full"
          >
            <color attach="background" args={["#071427"]} />
            <Scene
              objects={objects}
              selectedObjectId={selectedObjectId}
              onSelectObject={setSelectedObjectId}
              transformMode={transformMode}
              onObjectTransform={handleObjectTransform}
              disableOrbitControls={isTransforming}
              onTransformStart={handleTransformStart}
              onTransformEnd={handleTransformEnd}
              mapCells={mapCells}
            />
          </Canvas>
        </div>
      </div>
    </div>
  );
}

export default function MapEditor() {
  return <MapEditorContent />;
}
