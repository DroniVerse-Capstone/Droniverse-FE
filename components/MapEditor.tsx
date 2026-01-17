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
import { Canvas, useThree, useLoader } from "@react-three/fiber";
import GroundPlane from "./simulator3d/GroundPlane";
import { MAP_COLORS } from "@/lib/models3d/mapConfig";
import { CAMERA_CONFIG } from "@/lib/cameraConfig";
import { WORLD_SCALE } from "@/lib/constants";
import { SIM_CANVAS, WORLD_SCALE_VALUE } from "@/lib/simConfig";
import { OrbitControls, TransformControls, useGLTF } from "@react-three/drei";
import { Box3, Vector3, Quaternion, Euler } from "three";
import DroneBody from "./simulator3d/DroneBody";
import BoxObstacle from "./simulator3d/obstacles/BoxObstacle";
import PreviewModel from "./map-editor/PreviewModel";
import Tree from "./simulator3d/decor/Tree";
import {
  PREDEFINED_MODELS,
  buildModelCategories,
  PredefinedModel,
} from "@/lib/editorModels";
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
};

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

type TransformPayload = Partial<MapObject> & { __final?: boolean };

const MODEL_CATEGORIES = buildModelCategories();

function ModelObject({
  object,
  isSelected,
  onSelect,
  transformMode,
  onObjectTransform,
  onTransformStart,
  onTransformEnd,
  isTransforming,
}: {
  object: MapObject;
  isSelected: boolean;
  onSelect: () => void;
  transformMode: TransformMode;
  onObjectTransform: (id: string, transform: TransformPayload) => void;
  onTransformStart: (id?: string) => void;
  onTransformEnd: (id?: string) => void;
  isTransforming: boolean;
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
      // console.log(meshRef.current)
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
          const clampedX = Math.max(min, Math.min(max, s[0]));
          const clampedY = Math.max(min, Math.min(max, s[1]));
          const clampedZ = Math.max(min, Math.min(max, s[2]));
          meshRef.current.scale.set(clampedX, clampedY, clampedZ);
          scale = [clampedX, clampedY, clampedZ];
        } else {
          scale = meshRef.current.scale.toArray();
        }
      }

      if (transformMode === "translate" && meshRef.current) {
        const MAP_HALF = 10;
        const effectiveRadius =
          (object.collisionRadius ?? 1) *
          (meshRef.current.scale.toArray()[0] ?? 1);
        const minX = -MAP_HALF + effectiveRadius;
        const maxX = MAP_HALF - effectiveRadius;
        const minZ = -MAP_HALF + effectiveRadius;
        const maxZ = MAP_HALF - effectiveRadius;
        const groundY = -0.5;
        const clampedX = Math.max(minX, Math.min(maxX, position[0]));
        const clampedZ = Math.max(minZ, Math.min(maxZ, position[2]));
        const clampedY = Math.max(groundY, position[1]);
        if (
          clampedX !== position[0] ||
          clampedZ !== position[2] ||
          clampedY !== position[1]
        ) {
          meshRef.current.position.set(clampedX, clampedY, clampedZ);
          position[0] = clampedX;
          position[1] = clampedY;
          position[2] = clampedZ;
        }
      }

      if (transformMode === "rotate" && meshRef.current) {
        rotation[0] = object.rotation[0];
        rotation[2] = object.rotation[2];
        if (object.rotatable === false) {
          meshRef.current.rotation.set(
            object.rotation[0],
            object.rotation[1],
            object.rotation[2],
          );
        }
      }

      const updatePayload: Partial<MapObject> = {
        rotation: rotation as [number, number, number],
        scale: scale as [number, number, number],
      };
      if (transformMode === "translate") {
        updatePayload.position = position as [number, number, number];
      }
      onObjectTransform(object.id, updatePayload);
    }
  }, [
    onObjectTransform,
    object.id,
    transformMode,
    object.scaleLimits?.min,
    object.scaleLimits?.max,
    object.scalable,
    object.rotatable,
    object.collisionRadius,
  ]);

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

  useMemo(() => {
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
                color: (object as any).color,
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
      {isSelected && (
        <TransformControls
          ref={transformRef}
          object={meshRef.current}
          mode={transformMode}
          showX={transformMode !== "rotate"}
          showY={true}
          showZ={transformMode !== "rotate"}
          space="world"
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
            }

            if (transformMode === "scale") {
              handleChangeThrottled();
            }
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
              onObjectTransform(object.id, {
                position: [wp.x, wp.y, wp.z],
                rotation: [we.x, we.y, we.z],
                scale: [ws.x, ws.y, ws.z],
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
      )}
    </group>
  );
}

function ModelObjectFBX(props: {
  object: MapObject;
  isSelected: boolean;
  onSelect: () => void;
  transformMode: TransformMode;
  onObjectTransform: (id: string, transform: TransformPayload) => void;
  onTransformStart: (id?: string) => void;
  onTransformEnd: (id?: string) => void;
  isTransforming: boolean;
}) {
  const {
    object,
    isSelected,
    onSelect,
    transformMode,
    onObjectTransform,
    onTransformStart,
    onTransformEnd,
  } = props;
  const scene = useLoader(FBXLoader, object.modelUrl) as any;
  const clonedScene = useMemo(() => {
    const c = scene.clone();
    c.traverse((child: any) => {
      if (child && typeof child === "object") child.matrixAutoUpdate = true;
    });
    try {
      c.updateMatrixWorld(true);
      const box = new Box3().setFromObject(c);
      const center = new Vector3();
      box.getCenter(center);
      c.position.sub(center);
    } catch (e) {
    }
    return c;
  }, [scene]);

  const meshRef = useRef<any>();

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
          const clampedX = Math.max(min, Math.min(max, s[0]));
          const clampedY = Math.max(min, Math.min(max, s[1]));
          const clampedZ = Math.max(min, Math.min(max, s[2]));
          meshRef.current.scale.set(clampedX, clampedY, clampedZ);
          scale = [clampedX, clampedY, clampedZ];
        } else {
          scale = meshRef.current.scale.toArray();
        }
      }

      if (transformMode === "translate" && meshRef.current) {
        const MAP_HALF = 10;
        const effectiveRadius =
          (object.collisionRadius ?? 1) *
          (meshRef.current.scale.toArray()[0] ?? 1);
        const minX = -MAP_HALF + effectiveRadius;
        const maxX = MAP_HALF - effectiveRadius;
        const minZ = -MAP_HALF + effectiveRadius;
        const maxZ = MAP_HALF - effectiveRadius;
        const groundY = -0.5;
        const clampedX = Math.max(minX, Math.min(maxX, position[0]));
        const clampedZ = Math.max(minZ, Math.min(maxZ, position[2]));
        const clampedY = Math.max(groundY, position[1]);
        if (
          clampedX !== position[0] ||
          clampedZ !== position[2] ||
          clampedY !== position[1]
        ) {
          meshRef.current.position.set(clampedX, clampedY, clampedZ);
          position[0] = clampedX;
          position[1] = clampedY;
          position[2] = clampedZ;
        }
      }

      if (transformMode === "rotate" && meshRef.current) {
        rotation[0] = object.rotation[0];
        rotation[2] = object.rotation[2];
        if (object.rotatable === false) {
          meshRef.current.rotation.set(
            object.rotation[0],
            object.rotation[1],
            object.rotation[2],
          );
        }
      }

      const updatePayload: Partial<MapObject> = {
        rotation: rotation as [number, number, number],
        scale: scale as [number, number, number],
      };
      if (transformMode === "translate") {
        updatePayload.position = position as [number, number, number];
      }
      onObjectTransform(object.id, updatePayload);
    }
  }, [
    onObjectTransform,
    object.id,
    transformMode,
    object.scaleLimits?.min,
    object.scaleLimits?.max,
    object.scalable,
    object.rotatable,
    object.collisionRadius,
  ]);

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

  useMemo(() => {
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
      {isSelected && (
        <TransformControls
          object={meshRef.current}
          mode={transformMode}
          showX={transformMode !== "rotate"}
          showY={true}
          showZ={transformMode !== "rotate"}
          space="world"
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
            }
            if (transformMode === "scale") {
              handleChangeThrottled();
            }
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
              onObjectTransform(object.id, {
                position: [wp.x, wp.y, wp.z],
                rotation: [we.x, we.y, we.z],
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
      )}
    </group>
  );
}

function ModelObjectWrapper(props: any) {
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
}: {
  objects: MapObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  transformMode: TransformMode;
  onObjectTransform: (id: string, transform: Partial<MapObject>) => void;
  disableOrbitControls: boolean;
  onTransformStart: (id?: string) => void;
  onTransformEnd: (id?: string) => void;
}) {
  const { camera, gl } = useThree();

  const handleCanvasClick = useCallback(() => {
    onSelectObject(null);
  }, [onSelectObject]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {(() => {
        const planeSize: [number, number] = [
          SIM_CANVAS.width * WORLD_SCALE_VALUE,
          SIM_CANVAS.height * WORLD_SCALE_VALUE,
        ];
        return (
          <>
            <GroundPlane
              size={planeSize}
              colorConfig={{
                ground: MAP_COLORS.GROUND.color,
                grid: MAP_COLORS.GRID.sectionColor,
                border: MAP_COLORS.BORDER.color,
              }}
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

      <Suspense fallback={null}>
        {objects.map((object) => (
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
          />
        ))}
      </Suspense>

      <OrbitControls
        enablePan={!disableOrbitControls}
        enableZoom={!disableOrbitControls}
        enableRotate={!disableOrbitControls}
        maxPolarAngle={Math.PI / 2}
      />
    </>
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

  const [droneAddMode, setDroneAddMode] = useState<"replace" | "prevent">(
    "replace",
  );


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
            const MAP_HALF = 10;
            const incomingPos = transform.position;
            const baseRadius = merged.collisionRadius ?? 1;
            const effectiveRadius =
              baseRadius * (merged.scale ? merged.scale[0] : obj.scale[0]);
            if (lockedObjectId === id && !(transform as any).__final) {
              return obj;
            }
            const minX = -MAP_HALF + effectiveRadius;
            const maxX = MAP_HALF - effectiveRadius;
            const minZ = -MAP_HALF + effectiveRadius;
            const maxZ = MAP_HALF - effectiveRadius;
            const groundY = -0.5;
            if ((transform as any).__final) {
              const clampedY = Math.max(groundY, incomingPos[1]);
              merged.position = [incomingPos[0], clampedY, incomingPos[2]];
            } else {
              const clampedX = Math.max(minX, Math.min(maxX, incomingPos[0]));
              const clampedZ = Math.max(minZ, Math.min(maxZ, incomingPos[2]));
              const clampedY = Math.max(groundY, incomingPos[1]);
              merged.position = [clampedX, clampedY, clampedZ];
       
            }
          }
          return merged;
        }),
      );
    },
    [lockedObjectId],
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
      },
      position?: [number, number, number],
    ) => {
      setObjects((prev) => {
        if (m.id === "drone") {
          const existingDrone = prev.find((o) =>
            (o.modelUrl || "").startsWith("primitive:drone"),
          );
          if (existingDrone) {
            if (droneAddMode === "prevent") {
              alert("There is already a drone in the scene.");
              setSelectedObjectId(existingDrone.id);
              return prev;
            } else {
              const withoutDrone = prev.filter(
                (o) => !(o.modelUrl || "").startsWith("primitive:drone"),
              );
              const newObj: MapObject = {
                id: `object-${Date.now()}-${Math.random()}`,
                position: position ?? [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [m.defaultScale, m.defaultScale, m.defaultScale],
                scaleLimits:
                  m.scalable === false
                    ? undefined
                    : { min: m.minScale, max: m.maxScale },
                scalable: m.scalable === false ? false : true,
                modelUrl: m.url,
              };
              setTimeout(() => setSelectedObjectId(newObj.id), 0);
              return [...withoutDrone, newObj];
            }
          }
        }


        const obj: MapObject = {
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
          modelUrl: m.url,
        };
        setTimeout(() => setSelectedObjectId(obj.id), 0);
        return [...prev, obj];
      });
    },
    [droneAddMode],
  );

  const handleTransformStart = useCallback((id?: string) => {
    setIsTransforming(true);
    if (id) setLockedObjectId(id);
  }, []);

  const handleTransformEnd = useCallback((id?: string) => {
    setIsTransforming(false);
    if (id) setLockedObjectId((prev) => (prev === id ? null : prev));
  }, []);

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

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewModelId, setPreviewModelId] = useState<string | null>(null);

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
      {/* Left sidebar */}
      <aside
        className="
    w-[340px] sm:w-[420px] h-full
    bg-[linear-gradient(180deg,#041129_0%,#071426_45%,#020617_100%)]
    border-r border-white/6
    flex
    overflow-y-auto
    scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent
  "
      >
        {/* Category  */}
        <nav className="sticky top-0 h-full w-16 sm:w-20 flex flex-col items-center gap-4 py-6 bg-[#061a2b]/80 backdrop-blur-xl border-r border-white/6 ring-1 ring-white/5">
          {MODEL_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                title={cat.name}
                className={`
            relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl
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
                className="group relative rounded-lg overflow-hidden bg-linear-to-b from-gray-800/80 to-gray-900/60 border border-white/6 hover:border-sky-400/40 transition"
              >
                {/* preview */}
                <div className="relative h-28 sm:h-36 md:h-40 overflow-hidden bg-[linear-gradient(180deg,#081427,#021016)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(56,189,248,0.08),transparent_50%)]" />
                  <Suspense
                    fallback={
                      <div className="h-full flex items-center justify-center text-xs text-white/40">
                        Loading…
                      </div>
                    }
                  >
                    <Canvas
                      camera={{ position: [4, 2.5, 3], fov: 40 }}
                      className="
     w-full h-full
     rounded-[28px]
     bg-[radial-gradient(circle_at_50%_15%,rgba(56,189,248,0.06)_0%,rgba(37,99,235,0.03)_30%,rgba(2,6,23,0.72)_70%)]
   "
                    >
                      <ambientLight intensity={0.8} />
                      <directionalLight position={[6, 6, 4]} intensity={0.9} />
                      <PreviewModel model={m} />
                      <OrbitControls enablePan={false} enableZoom />
                    </Canvas>
                  </Suspense>
                </div>

                <div className="px-3 py-3 flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white truncate max-w-[72%]">
                    {m.name}
                  </div>
                  <div className="shrink-0">
                    <button
                      onClick={() => addPredefinedModel(m)}
                      className="w-9 h-9 inline-flex items-center justify-center rounded-md bg-linear-to-r from-sky-400 to-blue-600 text-white shadow-sm hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                      aria-label={`Add ${m.name}`}
                      title="Add"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-4 p-3 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {/* <div className="px-3 py-2 rounded text-sm text-gray-300">
              Choose from palette
            </div> */}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-medium text-gray-300">Mode</span>
            <div className="flex items-center border rounded overflow-hidden bg-gray-800">
              <button
                onClick={() => setTransformMode("translate")}
                className={`px-3 py-1 text-sm ${
                  transformMode === "translate"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-300"
                }`}
              >
                Translate
              </button>
              <button
                onClick={() => setTransformMode("rotate")}
                className={`px-3 py-1 text-sm ${
                  transformMode === "rotate"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-300"
                }`}
              >
                Rotate
              </button>
              <button
                onClick={() => setTransformMode("scale")}
                className={`px-3 py-1 text-sm ${
                  transformMode === "scale"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-300"
                }`}
              >
                Scale
              </button>
            </div>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 relative">
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
            selectedObject.modelUrl?.startsWith?.("primitive:drone") !==
              true && (
              <div className="absolute right-6 top-24 z-30 bg-gray-800/80 text-gray-100 p-3 rounded border border-gray-700 w-48">
                <div className="text-sm font-medium mb-2">Obstacle</div>
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
                <div className="space-y-2">
                  <div>
                    <label className="text-xs">Width (X)</label>
                    <input
                      type="range"
                      min={selectedObject.scaleLimits?.min ?? 0.2}
                      max={selectedObject.scaleLimits?.max ?? 3}
                      step={0.01}
                      value={selectedObject.scale[0]}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        updateObjectProps(selectedObject.id, {
                          scale: [
                            v,
                            selectedObject.scale[1],
                            selectedObject.scale[2],
                          ],
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs">Height (Y)</label>
                    <input
                      type="range"
                      min={selectedObject.scaleLimits?.min ?? 0.2}
                      max={selectedObject.scaleLimits?.max ?? 3}
                      step={0.01}
                      value={selectedObject.scale[1]}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        updateObjectProps(selectedObject.id, {
                          scale: [
                            selectedObject.scale[0],
                            v,
                            selectedObject.scale[2],
                          ],
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs">Depth (Z)</label>
                    <input
                      type="range"
                      min={selectedObject.scaleLimits?.min ?? 0.2}
                      max={selectedObject.scaleLimits?.max ?? 3}
                      step={0.01}
                      value={selectedObject.scale[2]}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        updateObjectProps(selectedObject.id, {
                          scale: [
                            selectedObject.scale[0],
                            selectedObject.scale[1],
                            v,
                          ],
                        });
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-300">
                    Dimensions ≈ W×H×D:{" "}
                    {(
                      (selectedObject.scale[0] ?? 1) *
                      2 *
                      WORLD_SCALE.POSITION
                    ).toFixed(2)}{" "}
                    m ×{" "}
                    {(
                      (selectedObject.scale[1] ?? 1) *
                      2 *
                      WORLD_SCALE.POSITION
                    ).toFixed(2)}{" "}
                    m ×{" "}
                    {(
                      (selectedObject.scale[2] ?? 1) *
                      2 *
                      WORLD_SCALE.POSITION
                    ).toFixed(2)}{" "}
                    m
                  </div>
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
                </div>
              </div>
            )}
          <Canvas
            shadows
            camera={{
              position: CAMERA_CONFIG.INITIAL_POSITION,
              fov: CAMERA_CONFIG.FOV,
              near: CAMERA_CONFIG.NEAR,
              far: CAMERA_CONFIG.FAR,
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
