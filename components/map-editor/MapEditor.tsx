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
import { useSearchParams, useRouter } from "next/navigation";
import { LabData, LabRule, LabMap, MapObject } from "@/types/lab";
import { getLabValidation } from "@/lib/map-editor/labValidation";
import { useLabFull, useUpdateLabFull, useSuspenseLabFull } from "@/hooks/lab/useLabs";
import {
  FaSave, FaArrowLeft, FaCheck, FaClock, FaStar, FaExclamationTriangle,
  FaGlobe, FaCube, FaTree, FaGem, FaMapMarkerAlt, FaPaperPlane, FaQuestionCircle, FaImage, FaCubes
} from "react-icons/fa";
import Loading from "@/app/loading";
import { MapEditorErrorBoundary, MapEditorErrorScreen } from "./ErrorBoundary";
import { RuleConfigurationModal } from "./RuleConfigurationModal";
import { useTranslations } from "@/providers/i18n-provider";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  all: <FaGlobe />,
  drone: <FaPaperPlane />,
  obstacle: <FaCube />,
  decor: <FaTree />,
  bonus: <FaGem />,
  checkpoint: <FaMapMarkerAlt />,
  theme: <FaImage />,
  uncategorized: <FaQuestionCircle />
};

import {
  OrbitControls,
  TransformControls,
  Environment,
  ContactShadows,
  Html,
  Stars,
  Sky,
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
const EDITOR_CONFIG = {
  MAX_ALT_CEILING: 150,
  THROTTLE_MS: 16,
};

// @ts-ignore - FBXLoader typing may not be present in this project
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { map } from "zod";
import { LanguageSwitcher } from "../layouts/LanguageSwitcher";

type TransformMode = "translate" | "rotate" | "scale";


const DEFAULT_RULE: LabRule = {
  timeLimit: 0,
  requiredScore: 0,
  sequentialCheckpoints: false,
  maxBlocks: 0,
};

const DEFAULT_MAP: LabMap = {
  cells: 20,
  theme: "default",
};

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

type TransformPayload = Partial<MapObject> & { __final?: boolean };

const MODEL_CATEGORIES = buildModelCategories();

/**
 * Chuẩn hóa object sang string JSON với các key được sắp xếp để so sánh chính xác.
 */
function stableStringify(obj: any): string {
  if (!obj) return "";
  return JSON.stringify(obj, (key, value) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value).sort().reduce((acc: any, k) => {
        acc[k] = value[k];
        return acc;
      }, {});
    }
    return value;
  });
}

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
  const [mountedNode, setMountedNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      setMountedNode(containerRef.current);
    }
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (inView && !shouldRender && mountedNode) {
      timeout = setTimeout(() => setShouldRender(true), 150);
    }
    return () => clearTimeout(timeout);
  }, [inView, shouldRender, mountedNode]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
    >
      {!shouldRender || !mountedNode ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-sky-400/20 border-t-sky-400 rounded-full animate-spin" />
          <span className="text-[10px] text-sky-400/50 font-medium uppercase tracking-widest">
            Loading
          </span>
        </div>
      ) : (
        <Canvas
          eventSource={mountedNode}
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


      const cx = Math.max(-limit, Math.min(limit, position[0]));
      const cz = Math.max(-limit, Math.min(limit, position[2]));
      const floorConstraint =
        getConstraintsForModel(object.modelUrl)?.translate.y.min ?? 0;

      let finalFloor = floorConstraint;
      if (object.objectType === "bonus") {
        finalFloor = Math.max(finalFloor, effectiveRadius + 0.3);
      }

      const cy = Math.max(finalFloor, Math.min(EDITOR_CONFIG.MAX_ALT_CEILING, position[1]));

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
          node.material.emissive?.setRGB(intensity, 0, 0);
        }
      });
    } else if (meshRef.current) {
      meshRef.current.traverse((node: any) => {
        if (
          node.isMesh &&
          node.material &&
          node.material.emissive &&
          node.material._origEmissive
        ) {
          node.material.emissive.copy(node.material._origEmissive);
        }
      });
    }
  });

  const lastSyncRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const finalizingRef = useRef<boolean>(false);
  const THROTTLE_MS = EDITOR_CONFIG.THROTTLE_MS;
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
            scale={object.scale}
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
    } catch (e) { }
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

      console.log("position 222", position)
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


      const cx = Math.max(-limit, Math.min(limit, position[0]));
      const cz = Math.max(-limit, Math.min(limit, position[2]));
      const floorConstraint =
        getConstraintsForModel(object.modelUrl)?.translate.y.min ?? 0;

      let finalFloor = floorConstraint;
      if (object.objectType === "bonus") {
        finalFloor = Math.max(finalFloor, effectiveRadius + 0.3);
      }

      const cy = Math.max(finalFloor, Math.min(EDITOR_CONFIG.MAX_ALT_CEILING, position[1]));

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
        if (node.isMesh && node.material && node.material.emissive) {
          if (!node.material._origEmissive) {
            node.material._origEmissive = node.material.emissive.clone();
          }
          node.material.emissive?.setRGB(intensity, 0, 0);
        }
      });
    } else if (meshRef.current) {
      meshRef.current.traverse((node: any) => {
        if (
          node.isMesh &&
          node.material &&
          node.material.emissive &&
          node.material._origEmissive
        ) {
          node.material.emissive.copy(node.material._origEmissive);
        }
      });
    }
  });

  const lastSyncRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const finalizingRef = useRef<boolean>(false);
  const THROTTLE_MS = EDITOR_CONFIG.THROTTLE_MS;
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

function CameraManager({ map, labId, resetToken }: { map: LabMap; labId: string | null; resetToken: number }) {
  const { camera, controls } = useThree();
  const lastLoadedRef = useRef<string | null>(null);
  const targetPos = useRef<THREE.Vector3 | null>(null);

  const performReset = useCallback(() => {
    const worldSize = map.cells * GRID_CONFIG.sectionSize;
    const distance = worldSize * 0.8;
    const height = worldSize * 0.4;
    const newTarget = new THREE.Vector3(distance, height, distance);

    if (!lastLoadedRef.current) {
      camera.position.copy(newTarget);
      camera.lookAt(0, 0, 0);
      if (controls) {
        (controls as any).target.set(0, 0, 0);
        (controls as any).update();
      }
    } else {
      targetPos.current = newTarget;
    }
  }, [camera, controls, map.cells]);

  useFrame(() => {
    if (targetPos.current) {
      camera.position.lerp(targetPos.current, 0.1);
      camera.lookAt(0, 0, 0);
      if (camera.position.distanceTo(targetPos.current) < 0.1) {
        targetPos.current = null;
      }
    }
  });

  // Handle initial load and lab changes
  useEffect(() => {
    if (labId && lastLoadedRef.current !== labId) {
      performReset();
      lastLoadedRef.current = labId;
    }
  }, [labId, performReset]);

  // Handle manual reset token
  useEffect(() => {
    if (resetToken > 0) {
      performReset();
    }
  }, [resetToken, performReset]);

  return null;
}

function MapLoading() {
  const t = useTranslations("MapEditor.status");
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 backdrop-blur-md bg-greyscale-900/40 p-10 rounded-3xl border border-white/5 shadow-2xl">
        <div className="w-10 h-10 border-3 border-sky-400/20 border-t-sky-400 rounded-full animate-spin" />
        <span className="text-xs text-sky-400 font-black uppercase tracking-[0.3em] drop-shadow-sm">
          {t("loading")}
        </span>
      </div>
    </Html>
  );
}

function Scene({
  objects,
  selectedObjectId,
  onSelectObject,
  transformMode,
  onObjectTransform,
  disableOrbitControls,
  onTransformStart,
  onTransformEnd,
  map,
  labId,
  cameraResetToken,
}: {
  objects: MapObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  transformMode: TransformMode;
  onObjectTransform: (id: string, transform: Partial<MapObject>) => void;
  disableOrbitControls: boolean;
  onTransformStart: (id?: string) => void;
  onTransformEnd: (id?: string) => void;
  map: LabMap;
  labId: string | null;
  cameraResetToken: number;
}) {
  const { camera, gl, controls } = useThree();

  const handleCanvasClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      onSelectObject(null);
    },
    [onSelectObject],
  );

  return (
    <Suspense fallback={<MapLoading />}>
      <CameraManager map={map} labId={labId} resetToken={cameraResetToken} />
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
        scale={map.cells * GRID_CONFIG.sectionSize}
        blur={2.5}
        far={1.5}
      />

      {(() => {
        const worldSize = map.cells * GRID_CONFIG.sectionSize;
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
        console.log("objects", objects);
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
              mapWorldSize={map.cells * GRID_CONFIG.sectionSize}
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
        maxDistance={map.cells * GRID_CONFIG.sectionSize * 1.5}
      />
    </Suspense>
  );

}

export function MapEnvironment({ theme }: { theme?: "default" | "space" | "sunset" | "daylight" }) {
  if (theme === "space") {
    return (
      <>
        <color attach="background" args={["#050510"]} />
        <Stars radius={200} depth={200} count={3000} factor={15} saturation={0} fade speed={3} />
        <ambientLight intensity={0.2} />
      </>
    );
  }
  if (theme === "sunset") {
    return (
      <>
        <Sky
          sunPosition={[100, 10, 100]}
          turbidity={10}
          rayleigh={1}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />

        <Environment preset="sunset" />
        <ambientLight intensity={0.5} />

        {/* Clear Golden Hour Sunlight */}
        <directionalLight
          position={[50, 50, 50]}
          intensity={1.5}
          color="#291e50ff"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
      </>
    );
  }
  if (theme === "daylight") {
    return (
      <>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.8} />
      </>
    );
  }
  return <color attach="background" args={["#071427"]} />;
}

function MapEditorContent() {
  const mainCanvasContainerRef = useRef<HTMLDivElement>(null);
  const [mountedNode, setMountedNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (mainCanvasContainerRef.current) {
      setMountedNode(mainCanvasContainerRef.current);
    }
  }, []);

  const searchParams = useSearchParams();
  const router = useRouter();
  const labId = searchParams.get("id");
  const { data: storedLab, contentId } = useSuspenseLabFull(labId || "");
  const t = useTranslations("MapEditor");
  const { toasts, dismiss, toast } = useToast();

  // -- Core states initialized from suspended data to avoid "jumping" on first render --
  const [objects, setObjects] = useState<MapObject[]>(() =>
    storedLab?.labContent?.environment?.objects || []
  );
  const [map, setMap] = useState<LabMap>(() => {
    if (!storedLab) return DEFAULT_MAP;
    return {
      cells: storedLab.labContent?.environment?.map?.cells || 20,
      theme: storedLab.labContent?.environment?.map?.theme || "default",
    };
  });

  const [rule, setRule] = useState<LabRule>(() => {
    if (!storedLab) return DEFAULT_RULE;
    return {
      timeLimit: storedLab.labContent?.environment?.rule?.timeLimit || 0,
      requiredScore: storedLab.labContent?.environment?.rule?.requiredScore || 0,
      maxBlocks: storedLab.labContent?.environment?.rule?.maxBlocks || 0,
      sequentialCheckpoints: storedLab.labContent?.environment?.rule?.sequentialCheckpoints || false,
    };
  });
  const [hasSolution, setHasSolution] = useState<boolean>(() => {
    return (storedLab?.labContent?.environment?.hasSolution === true) || (storedLab?.labContent?.environment?.rule as any)?.hasSolution === true;
  });

  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [transformMode, setTransformMode] =
    useState<TransformMode>("translate");
  const [isTransforming, setIsTransforming] = useState(false);
  const [lockedObjectId, setLockedObjectId] = useState<string | null>(null);
  const finalizingRef = useRef<boolean>(false);
  const mapWorldSize = map.cells * GRID_CONFIG.sectionSize;
  const [cameraResetToken, setCameraResetToken] = useState(0);

  // -- Persistence & Missions --
  const updateLabFull = useUpdateLabFull();
  const hasLoadedRef = useRef<string | null>(labId);


  // -- UX & Resilience States --
  const [isDirty, setIsDirty] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const lastSavedStateRef = useRef<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [clipboardObject, setClipboardObject] = useState<Omit<MapObject, "id"> | null>(null);

  // 1. Monitor Online Status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. Track Dirty State (Change Detection)
  useEffect(() => {
    // Only track after initial load from API is successfully applied
    if (!storedLab || hasLoadedRef.current !== labId) return;

    const currentState = stableStringify({
      objects,
      map: {
        cells: map.cells,
        theme: map.theme,
      },
      rule,
      hasSolution
    });

    if (!lastSavedStateRef.current) {
      // First run after load: Snapshot as the reference point
      lastSavedStateRef.current = currentState;
      setIsDirty(false); // Ensure clean on start
      return;
    }

    const modified = currentState !== lastSavedStateRef.current;
    if (isDirty !== modified) {
      setIsDirty(modified);
    }
  }, [objects, map, rule, hasSolution, labId, storedLab]);

  // 3. Navigation Guard
  useEffect(() => {
    // A. External Navigation (Browser Refresh/Close)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = t("confirm.unsavedChanges");
      }
    };

    // B. Internal Navigation (SPA links)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor && anchor.href && isDirty) {
        // Only intercept internal links that actually change the path or search
        try {
          const url = new URL(anchor.href);
          const isInternal = url.origin === window.location.origin;
          const isDifferentPath = url.pathname !== window.location.pathname || url.search !== window.location.search;

          if (isInternal && isDifferentPath) {
            if (!window.confirm(t("confirm.unsavedChanges"))) {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        } catch (e) {
          // Ignore invalid URLs
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("click", handleAnchorClick, true); // Use capture phase

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("click", handleAnchorClick, true);
    };
  }, [isDirty]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      if (window.confirm(t("confirm.unsavedChanges"))) {
        router.push("/lab-management");
      }
    } else {
      router.push("/lab-management");
    }
  }, [isDirty, router]);




  /**
   * HÀM LƯU MAP CHÍNH (SAVE MAP FUNCTION)
   * Hàm này xử lý việc thu thập toàn bộ objects, mission settings và gửi lên API để lưu trữ.
   */
  const saveToStorage = useCallback(async (publish: boolean = false, ruleOverride?: LabRule, objectsOverride?: MapObject[]): Promise<boolean> => {
    setIsSaving(true);
    setSaveSuccess(false);

    if (!isOnline) {
      toast.error(t("toasts.noNetwork"));
      setIsSaving(false);
      return false;
    }

    // Sync state if provided as override
    if (ruleOverride) setRule(ruleOverride);
    if (objectsOverride) setObjects(objectsOverride);

    const currentRule = ruleOverride || rule;
    const currentObjects = objectsOverride || objects;

    try {
      // Small delay for psychological feedback (feel premium)
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Map Editor only manages map/rule data, so we strictly update labContent. 
      // Basic info (name, description, etc.) is handled in the Lab Management modal.
      const labDataUpdate: Partial<LabData> = {};
      console.log("Saving environment data:", { objects: currentObjects, rule: currentRule });

      const labContentData: any = {
        objects: currentObjects,
        map: {
          cells: map.cells,
          theme: map.theme,
        },
        rule: currentRule,
        hasSolution
      };

      if (publish) {
        const validation = getLabValidation({
          ...storedLab,
          ...labDataUpdate,
          labContent: { environment: labContentData }
        } as any);

        if (!validation.isValid) {
          toast.error(t("toasts.publishError"));
          setIsSaving(false);
          return false;
        }
      }

      if (labId) {
        return new Promise<boolean>((resolve) => {
          updateLabFull.mutate({
            labID: labId,
            data: { ...labDataUpdate, labContent: { environment: labContentData } },
            contentId
          }, {
            onSuccess: () => {
              setSaveSuccess(true);
              setIsDirty(false);
              // Snapshot new state as the reference
              lastSavedStateRef.current = stableStringify(labContentData);

              toast.success(publish ? t("toasts.publishSuccess") : t("toasts.saveSuccess"));
              if (publish) {
                setTimeout(() => router.push("/lab-management"), 1200);
              }
              setTimeout(() => setSaveSuccess(false), 2000);
              resolve(true);
            },
            onError: () => {
              toast.error(t("toasts.saveError"));
              resolve(false);
            },
            onSettled: () => {
              setIsSaving(false);
            }
          });
        });
      }
      return false;
    } catch (err) {
      toast.error(t("toasts.genericError"));
      setIsSaving(false);
      return false;
    }
  }, [labId, map, rule, objects, router, toast, updateLabFull, contentId, storedLab]);

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
      rule.requiredScore <= 0 ||
      currentScore >= rule.requiredScore;
    const hasWinCondition =
      checkpoints.length > 0 || rule.requiredScore > 0;
    if (hasWinCondition && cpCondition && scoreCondition) {
      clearInterval(missionTimerRef.current!);
      setMissionRunning(false);
      setMissionResult("pass");
      setHasSolution(true);
      toast.success(t("toasts.solutionSuccess"));
    }
  }, [
    collectedCheckpoints,
    currentScore,
    missionRunning,
    objects,
    rule.requiredScore,
  ]);

  const lastOnlineToastRef = useRef<boolean>(isOnline);
  useEffect(() => {
    if (lastOnlineToastRef.current !== isOnline) {
      if (!isOnline) {
        toast.warning(t("toasts.networkLost"));
      } else {
        toast.success(t("toasts.networkRestored"));
      }
      lastOnlineToastRef.current = isOnline;
    }
  }, [isOnline, toast]);

  const startMission = useCallback(() => {
    setCollectedCheckpoints(new Set());
    setCurrentScore(0);
    setMissionResult(null);
    setMissionTimeLeft(rule.timeLimit);
    setMissionRunning(true);
  }, [rule.timeLimit]);

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
              toast.error(t("toasts.droneCopyError"));
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
            toast.warning(t("toasts.dronePasteError"));
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
  }, [map.cells, mapWorldSize]);

  const handleObjectTransform = useCallback(
    (id: string, transform: TransformPayload) => {
      setObjects((prev) =>
        prev.map((obj) => {
          if (obj.id !== id) return obj;
          const merged = { ...obj, ...transform };
          if (transform.scale) {
            if (obj.scalable === false) {
              merged.scale = obj.scale;
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
            const floor =
              getConstraintsForModel(merged.modelUrl)?.translate.y.min ?? 0;

            if ((transform as any).__final) {
              const nx = Math.max(-limit, Math.min(limit, incomingPos[0]));
              const nz = Math.max(-limit, Math.min(limit, incomingPos[2]));
              const ny = Math.max(
                floor,
                Math.min(EDITOR_CONFIG.MAX_ALT_CEILING, incomingPos[1]),
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
                Math.min(EDITOR_CONFIG.MAX_ALT_CEILING, incomingPos[1]),
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
          toast.error(t("toasts.droneExists"));
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

  const categories = useMemo(() => [
    ...MODEL_CATEGORIES,
    { id: "theme", name: t("categories.theme"), models: [] }
  ], [t]);

  // Export / Import
  // const exportLabData = useCallback(() => {
  //   const checkpoints = objects.filter((o) => o.objectType === "checkpoint");
  //   console.log("checkpoints", checkpoints);
  //   const bonusItems = objects.filter((o) => o.objectType === "bonus");
  //   const obstacles = objects.filter(
  //     (o) =>
  //       o.objectType === "obstacle" ||
  //       (!o.objectType && o.modelUrl !== "primitive:checkpoint"),
  //   );

  //   const labData = {
  //     labName: missionSettings.labName,
  //     description: missionSettings.description,
  //     timeLimit: missionSettings.timeLimit,
  //     requiredScore: missionSettings.requiredScore,
  //     sequentialCheckpoints: missionSettings.sequentialCheckpoints,
  //     obstacles: obstacles.map((o) => ({
  //       id: o.id,
  //       modelUrl: o.modelUrl,
  //       position: o.position,
  //       rotation: o.rotation,
  //       scale: o.scale,
  //       color: o.color,
  //     })),
  //     bonusItems: bonusItems.map((o) => ({
  //       id: o.id,
  //       modelUrl: o.modelUrl,
  //       position: o.position,
  //       rotation: o.rotation,
  //       scale: o.scale,
  //       scoreValue: o.scoreValue ?? 10,
  //     })),
  //     checkpoints: checkpoints.map((o, idx) => ({
  //       id: o.id,
  //       modelUrl: o.modelUrl,
  //       position: o.position,
  //       rotation: o.rotation,
  //       radius: o.radius ?? 2,
  //       order: idx,
  //     })),
  //   };
  //   const blob = new Blob([JSON.stringify(labData, null, 2)], {
  //     type: "application/json",
  //   });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `${missionSettings.labName || "lab"}.json`;
  //   a.click();
  //   URL.revokeObjectURL(url);
  // }, [objects, missionSettings]);

  // const loadLabData = useCallback(
  //   (json: any) => {
  //     try {
  //       setMissionSettings({
  //         labName: json.labName ?? "",
  //         description: json.description ?? "",
  //         timeLimit: json.timeLimit ?? 120,
  //         requiredScore: json.requiredScore ?? 0,
  //         sequentialCheckpoints: json.sequentialCheckpoints ?? false,
  //       });

  //       const spawned: MapObject[] = [];

  //       for (const o of json.obstacles ?? []) {
  //         spawned.push({
  //           id: `loaded-${Date.now()}-${Math.random()}`,
  //           modelUrl: o.modelUrl,
  //           position: o.position,
  //           rotation: o.rotation,
  //           scale: o.scale,
  //           color: o.color,
  //           objectType: "obstacle",
  //           scalable: true,
  //           rotatable: true,
  //         });
  //       }

  //       for (const o of json.bonusItems ?? []) {
  //         spawned.push({
  //           id: `loaded-${Date.now()}-${Math.random()}`,
  //           modelUrl: o.modelUrl,
  //           position: o.position,
  //           rotation: o.rotation,
  //           scale: o.scale,
  //           objectType: "bonus",
  //           scoreValue: o.scoreValue ?? 10,
  //           scalable: true,
  //           rotatable: true,
  //         });
  //       }

  //       for (let idx = 0; idx < (json.checkpoints ?? []).length; idx++) {
  //         const o = json.checkpoints[idx];
  //         spawned.push({
  //           id: `loaded-${Date.now()}-${Math.random()}`,
  //           modelUrl: "primitive:checkpoint",
  //           position: o.position,
  //           rotation: o.rotation,
  //           scale: [1, 1, 1],
  //           objectType: "checkpoint",
  //           radius: o.radius ?? 2,
  //           scalable: false,
  //           rotatable: true,
  //         });
  //       }

  //       setObjects(spawned);
  //       setSelectedObjectId(null);
  //       stopMission();
  //     } catch (err) {
  //       alert("Tải dữ liệu bài Lab thất bại: " + (err as any)?.message);
  //     }
  //   },
  //   [stopMission],
  // );

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

  if (!storedLab) {
    return <MapEditorErrorScreen />;
  }

  return (
    <div className="fixed inset-0 flex bg-greyscale-900 text-gray-100 overflow-hidden select-none">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      {/* Left sidebar */}
      <aside
        className="
    w-85 sm:w-[420px] h-full
    
    bg-[linear-gradient(180deg,#0b0f18,#071426_45%,#0b0f18)]
    border-r border-white/6
    flex
    overflow-y-auto
    scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent 
  "
      >
        {/* Category  */}
        <nav className="sticky top-0 h-full w-16 sm:w-20 flex flex-col items-center gap-4 py-6 bg-greyscale-900 backdrop-blur-xl border-r border-white/6 ring-1 ring-white/5">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSetCategory(cat.id)}
                title={t(`categories.${cat.id}`)}
                className={`
            relative w-10 h-10 sm:w-12 sm:h-12 rounded  
            flex items-center justify-center
            transition-all duration-300 ease-out
            ${active
                    ? "bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.4)] scale-105 border border-sky-400/30"
                    : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10 hover:text-white hover:border-white/10"
                  }
          `}
              >
                <span className={`text-xl transition-transform duration-300 ${active ? 'scale-110 drop-shadow-md' : ''}`}>
                  {CATEGORY_ICONS[cat.id] || <FaQuestionCircle />}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Asset  */}
        <div className="flex-1 px-4 py-5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {selectedCategory === "theme" ? (
            <div className="flex flex-col gap-4">
              {/* <h3 className="text-white font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-1 opacity-60">Cài đặt Môi Trường</h3> */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'default', name: t('themes.default'), img: '/images/enviroment/default.jpg' },
                  { id: 'space', name: t('themes.space'), img: '/images/enviroment/space.jpg' },
                  { id: 'sunset', name: t('themes.sunset'), img: '/images/enviroment/sunset.jpg' },
                  { id: 'daylight', name: t('themes.daylight'), img: '/images/enviroment/daylight.jpg' }
                ].map(theme => {
                  const isActive = map.theme === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setMap((s: LabMap) => ({ ...s, theme: theme.id as any }))}
                      className={`group relative flex flex-col rounded overflow-hidden border transition-all duration-200 ${isActive
                        ? 'border-sky-400/40 shadow-[0_0_24px_rgba(56,189,248,0.15)] bg-sky-500/5'
                        : 'border-white/[0.08] hover:border-sky-400/40 bg-[linear-gradient(160deg,#0c1a30_0%,#06101e_100%)] hover:shadow-[0_0_24px_rgba(56,189,248,0.1)]'
                        }`}
                    >
                      {/* Colored accent line top */}
                      <div className={`absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300 z-10 ${isActive ? 'bg-sky-400 opacity-100' : 'bg-gradient-to-r from-sky-500/0 via-sky-400/60 to-sky-500/0 opacity-0 group-hover:opacity-100'
                        }`} />

                      {/* Preview area - matching exactly h-28 sm:h-36 */}
                      <div className="relative h-28 sm:h-36 overflow-hidden bg-black">
                        <img
                          src={theme.img}
                          alt={theme.name}
                          className={`w-full h-full object-cover transition-transform duration-500 ${isActive ? 'scale-110' : 'opacity-60 group-hover:opacity-90 group-hover:scale-[1.04]'}`}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(56,189,248,0.08),transparent_70%)]" />
                      </div>

                      {/* Footer - matching exactly px-3 py-2.5 bg-white/[0.02] border-t */}
                      <div className={`flex items-center gap-2 px-3 py-2.5 border-t transition-colors ${isActive ? 'border-sky-400/30 bg-sky-400/10' : 'border-white/[0.06] bg-white/[0.02]'
                        }`}>
                        <span className={`text-[13px] font-semibold truncate flex-1 tracking-tight ${isActive ? 'text-sky-300' : 'text-white'}`}>
                          {theme.name}
                        </span>

                        <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isActive
                          ? 'bg-sky-500 border border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                          : 'bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.1] text-slate-500'
                          }`}>
                          {isActive ? (
                            <FaCheck className="text-[10px]" />
                          ) : (
                            <div className="w-1.5 h-1.5 bg-sky-500/50 rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          ) : (
            <div className="grid grid-cols-2 gap-4">
              {MODEL_CATEGORIES.find(
                (c) => c.id === selectedCategory,
              )?.models.map((m) => (
                <div
                  key={m.id}
                  className="group relative flex flex-col rounded overflow-hidden border border-white/[0.08] hover:border-sky-400/40 bg-[linear-gradient(160deg,#0c1a30_0%,#06101e_100%)] transition-all duration-200 hover:shadow-[0_0_24px_rgba(56,189,248,0.10)]"
                >
                  {/* Colored accent line top */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500/0 via-sky-400/60 to-sky-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                  {/* Preview */}
                  <div className="relative h-28 sm:h-36 overflow-hidden">
                    {m.defaultScoreValue && (
                      <div className="absolute top-2 left-2 z-20 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-semibold">
                        ✦ {m.defaultScoreValue} {t("models.pts")}
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
                      {t(`models.${m.id}`)}
                    </span>
                    <button
                      onClick={() => addPredefinedModel(m)}
                      aria-label={t("models.add", { name: t(`models.${m.id}`) })}
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
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-2.5 bg-greyscale-900 border-b border-white/[0.06] backdrop-blur-md flex-wrap gap-y-2">
          {/* Map size */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded bg-white/[0.04] border border-white/[0.06]">
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
              value={map.cells}
              onChange={(e) => setMap((s: LabMap) => ({ ...s, cells: Number(e.target.value) }))}
              className="w-20 h-0.5 accent-sky-400 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              {map.cells}×{map.cells}m
            </span>
          </div>

          <div className="h-5 w-px bg-white/10" />

          {/* Navigation & Save */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleBack}
              className="group flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold rounded bg-greyscale-700 text-greyscale-0 border-2 border-greyscale-600 hover:bg-white/5 transition-all shadow-sm"
            >
              <FaArrowLeft className="text-[10px] group-hover:-translate-x-0.5 transition-transform text-primary-300" />
              {t("toolbar.back")}
            </button>

            <button
              onClick={() => saveToStorage(false)}
              disabled={isSaving || !isOnline}
              className={`
                relative flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold rounded transition-all duration-300 border
                ${saveSuccess
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  : !isOnline
                    ? "bg-red-500/10 text-red-400 border-red-500/20 opacity-70"
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isSaving ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : saveSuccess ? (
                <FaCheck className="animate-in zoom-in duration-300" />
              ) : !isOnline ? (
                <span>⚠</span>
              ) : (
                <FaSave className="text-[10px]" />
              )}
              {saveSuccess ? t("toolbar.saved") : isSaving ? t("toolbar.saving") : !isOnline ? t("toolbar.offline") : t("toolbar.save")}

              {isDirty && !saveSuccess && !isSaving && isOnline && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sky-400 rounded-full border-2 border-greyscale-900 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
              )}
            </button>

            <button
              onClick={() => setShowMissionModal(true)}
              className="group flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold rounded bg-primary-300 text-white border border-primary-200 hover:bg-primary-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300 ml-1"
            >
              {t("toolbar.configureRules")} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>


          </div>

          <div className="h-5 w-px bg-white/10" />

          <div className="flex items-center gap-1.5">
            {/* Action buttons removed */}
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
              {t("hud.completed")}
            </span>
          )}
          {missionResult === "fail" && (
            <span className="px-3 py-1.5 text-[11px] rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 font-semibold tracking-wide">
              {t("hud.failed")}
            </span>
          )}

          {/* Transform mode */}
          <div className="ml-auto relative">
            <div className="flex items-center gap-0.5 rounded bg-white/[0.04] p-0.5 border border-white/[0.07]">
              {[
                {
                  mode: "translate" as TransformMode,
                  label: "Di Chuyển",
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
                  label: "Xoay",
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
                  label: "Tỷ Lệ",
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded transition-all duration-150 ${transformMode === mode
                    ? "bg-sky-500/20 text-sky-300"
                    : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]"
                    }`}
                >
                  {icon}
                  {t(`toolbar.transform.${mode}`)}
                </button>
              ))}
            </div>
            <kbd className="absolute -top-2 -left-2 px-1 py-px bg-[#07111f] text-slate-300 rounded text-[11px] font-mono border border-white/[0.06] leading-tight">
              Tab
            </kbd>
          </div>

          <LanguageSwitcher />
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 relative" ref={mainCanvasContainerRef}>
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
                  strokeLinejoin="round"
                />
              </svg>
              {t("properties.remove")}
              <kbd className="ml-0.5 px-1 py-px bg-red-950/60 rounded text-[9px] font-mono border border-red-700/50 leading-tight text-red-500 group-hover:border-red-500/50 group-hover:text-red-300 transition-colors">
                Del
              </kbd>
            </button>
          )}
          {selectedObject && transformMode === "rotate" && (
            <div className="absolute right-6 top-6 z-40 bg-gray-800/90 text-gray-100 p-3 rounded border border-gray-700 w-40">
              <div className="text-sm font-medium mb-2">{t("properties.rotateY")}</div>
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
                { key: "x" as const, label: t("properties.width"), idx: 0 },
                { key: "y" as const, label: t("properties.height"), idx: 1 },
                { key: "z" as const, label: t("properties.depth"), idx: 2 },
              ];
              return (
                <div className="absolute right-6 top-6 z-30 bg-gray-800/80 text-gray-100 p-3 rounded border border-gray-700 w-48">
                  <div className="text-sm font-medium mb-2">{t("properties.title")}</div>
                  {modelCfg?.hasColor && (
                    <>
                      <label className="text-xs">{t("properties.color")}</label>
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
                      {t("properties.remove")}
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
                    🔵 {t("properties.checkpointTitle")}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    {t("properties.order")}:{" "}
                    <span className="text-white font-mono">#{cpIndex + 1}</span>
                  </div>
                  <label className="text-xs text-gray-400">{t("properties.radius")}</label>
                  <input
                    type="range"
                    min={4}
                    max={15}
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
                    {t("properties.removeCheckpoint")}
                  </button>
                </div>
              );
            })()}

          {/* ── Rule Configuration Modal ─────────────────────────────── */}
          <RuleConfigurationModal
            show={showMissionModal}
            onClose={() => setShowMissionModal(false)}
            rule={rule}
            onChange={setRule}
            objects={objects}
            isSaving={isSaving}
            onSave={async (draftRule) => {
              const success = await saveToStorage(false, draftRule);
              if (success) {
                setShowMissionModal(false);
              }
            }}
          />

          {mountedNode && (
            <Canvas
              eventSource={mountedNode}
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
              <MapEnvironment theme={map.theme} />
              <Scene
                objects={objects}
                selectedObjectId={selectedObjectId}
                onSelectObject={setSelectedObjectId}
                transformMode={transformMode}
                onObjectTransform={handleObjectTransform}
                disableOrbitControls={isTransforming}
                onTransformStart={handleTransformStart}
                onTransformEnd={handleTransformEnd}
                map={map}
                labId={labId}
                cameraResetToken={cameraResetToken}
              />
            </Canvas>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MapEditor() {
  return (
    <MapEditorErrorBoundary>
      <Suspense fallback={<Loading />}>
        <MapEditorContent />
      </Suspense>
    </MapEditorErrorBoundary>
  );
}
