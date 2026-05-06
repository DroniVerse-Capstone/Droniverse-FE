"use client";

import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Grid,
  Stars,
} from "@react-three/drei";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { FlightState, MotorValues } from "./physics";
import { cn } from "@/lib/utils";
import { LevelFactory, LevelInstance, LevelResult } from "./levels/types";
import { ForceVectors } from "./ForceVectors";

type CameraMode = "FOLLOW" | "ORBIT" | "TOP" | "FPV";
type EnvironmentType = "DAY" | "NIGHT" | "SPACE" | "INDUSTRIAL" | "CITY_FIRE";

interface DroneProps {
  physicsRef: React.MutableRefObject<FlightState>;
  showForces: boolean;
  cameraMode: CameraMode;
}

// ── Camera Controller Component ──────────────────────────────────────────────
function CameraController({ mode, droneRef, altitude }: { mode: CameraMode, droneRef: React.RefObject<THREE.Group>, altitude: number }) {
  const { camera, gl } = useThree();
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const lookAtPos = useMemo(() => new THREE.Vector3(), []);
  const [zoomOffset, setZoomOffset] = useState(0);

  // Thêm tính năng cuộn chuột để Zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      setZoomOffset(prev => Math.max(-5, Math.min(20, prev + e.deltaY * 0.01)));
    };
    gl.domElement.addEventListener("wheel", handleWheel);
    return () => gl.domElement.removeEventListener("wheel", handleWheel);
  }, [gl]);

  useFrame(() => {
    if (!droneRef.current) return;

    const dronePos = droneRef.current.position;
    const droneRot = droneRef.current.rotation;
    lookAtPos.lerp(dronePos, 0.12);

    switch (mode) {
      case "FOLLOW": {
        const baseDistance = 6 + zoomOffset;
        const zoomFactor = Math.min(1.0, altitude / 100); 
        const distance = baseDistance + (zoomFactor * 12);
        const height = (2.8 + zoomOffset * 0.4) + (zoomFactor * 6);
        
        const angle = droneRot.y;

        targetPos.set(
          dronePos.x + Math.sin(angle) * distance,
          dronePos.y + height,
          dronePos.z + Math.cos(angle) * distance
        );
        camera.position.lerp(targetPos, 0.08);
        camera.lookAt(lookAtPos);
        break;
      }
      case "TOP": {
        targetPos.set(dronePos.x, dronePos.y + 25 + zoomOffset, dronePos.z);
        camera.position.lerp(targetPos, 0.05);
        camera.lookAt(lookAtPos);
        break;
      }
      case "FPV": {
        const localOffset = new THREE.Vector3(0, 0.15, -0.35);
        const worldPos = localOffset.applyQuaternion(droneRef.current.quaternion);
        targetPos.copy(dronePos).add(worldPos);

        camera.position.lerp(targetPos, 0.8);

        const cameraTilt = 25 * (Math.PI / 180);
        const localLook = new THREE.Vector3(0, Math.sin(cameraTilt) * 10, -Math.cos(cameraTilt) * 10);
        const worldLook = localLook.applyQuaternion(droneRef.current.quaternion);

        const lookAhead = dronePos.clone().add(worldLook);
        camera.lookAt(lookAhead);
        break;
      }
      case "ORBIT": {
        camera.lookAt(lookAtPos);
        break;
      }
    }
  });

  return null;
}

// Motor positions in X-config: FL, FR, RL, RR
const MOTOR_POSITIONS: Record<string, { pos: [number, number, number], rotation: number }> = {
  m1: { pos: [-1.1, 0.3, -0.5], rotation: -1 },   // Front Left  (CCW)
  m2: { pos: [0.3, 0.3, -0.5], rotation: 1 },    // Front Right (CW)
  m3: { pos: [-1.1, 0.3, 0.9], rotation: 1 },    // Rear Left   (CW)
  m4: { pos: [0.25, 0.3, 0.9], rotation: -1 },    // Rear Right  (CCW)
};

const MOTOR_COLORS = {
  m1: "#34d399", // Cyan/Emerald - CCW
  m2: "#fb923c", // Orange - CW
  m3: "#fb923c", // Orange - CW
  m4: "#34d399", // Cyan/Emerald - CCW
};

// Simple motor ring indicator (no internal refs to avoid lag)
function MotorRing({ position, rotation, color, value }: { position: [number, number, number]; rotation: number; color: string; value: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const intensity = value / 100;

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += rotation * intensity * 20 * delta;
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.2 + intensity * 0.6;
    }
  });

  return (
    <mesh ref={ringRef} position={position}>
      <torusGeometry args={[0.1, 0.015, 8, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} depthTest={false} />
    </mesh>
  );
}

// Simple thrust arrow
function ThrustArrow({ position, color, value }: { position: [number, number, number]; color: string; value: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const currentScale = useRef(0);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const targetScale = Math.max(0.1, value / 100 * 2.5);
      currentScale.current += (targetScale - currentScale.current) * Math.min(1, delta * 8);
      groupRef.current.scale.y = currentScale.current;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.8]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} depthTest={false} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <coneGeometry args={[0.05, 0.15, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} depthTest={false} />
      </mesh>
    </group>
  );
}

function ForceArrow({ innerRef, position, color }: { innerRef: any, position: [number, number, number], color: string }) {
  return (
    <group position={position}>
      <group ref={innerRef}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 1]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} depthTest={false} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <coneGeometry args={[0.08, 0.25]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} depthTest={false} />
        </mesh>
      </group>
    </group>
  );
}

function FlightDrone({ physicsRef, showForces, cameraMode, onDroneMount }: DroneProps & { onDroneMount?: (drone: THREE.Group) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const propsRef = useRef<{ [key: string]: THREE.Object3D }>({});
  const { scene } = useGLTF("/models/quadcopter.glb");

  // Mount callback to pass drone ref back to parent
  useEffect(() => {
    if (groupRef.current && onDroneMount) {
      onDroneMount(groupRef.current);
    }
  }, [onDroneMount]);

  // Read current ref values for React render phase (UI updates)
  const physics = physicsRef.current;
  const motors = physics.motors;

  // Smooth interpolation state for positions/rotations
  const smoothState = useRef({
    positionX: 0, altitude: 0, positionZ: 0,
    pitch: 0, roll: 0, yaw: 0,
  });

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = false;
        (child as THREE.Mesh).receiveShadow = false;
      }
    });
    return clone;
  }, [scene]);

  useMemo(() => {
    propsRef.current = {};
    clonedScene.traverse((child) => {
      const name = child.name.toLowerCase();
      // DJI Phantom Specific Propeller Mapping (Verified by behavior)
      if (name.includes("polysurface40")) propsRef.current.m1 = child; // Front Left
      if (name.includes("polysurface45")) propsRef.current.m2 = child; // Front Right
      if (name.includes("polysurface47")) propsRef.current.m3 = child; // Rear Left
      if (name.includes("polysurface36")) propsRef.current.m4 = child; // Rear Riht

    });
  }, [clonedScene]);

  // Force vector refs - kept for compatibility but unused with new system
  const arrowRefs = {
    m1: useRef<THREE.Group>(null),
    m2: useRef<THREE.Group>(null),
    m3: useRef<THREE.Group>(null),
    m4: useRef<THREE.Group>(null),
  };

  useFrame((_, delta) => {
    if (!groupRef.current || !modelRef.current) return;

    const physics = physicsRef.current;
    const motors = physics.motors;

    // Smooth interpolation - lerp factor based on delta for consistent speed
    // Lowered to 0.35 to perfectly smooth out the 60Hz physics steps and prevent visual stuttering
    const lerpSpeed = 0.35;
    const s = smoothState.current;
    const lf = Math.min(1, delta * 60 * lerpSpeed);

    // Smooth position updates
    s.positionX += (physics.positionX - s.positionX) * lf;
    s.altitude += (physics.altitude - s.altitude) * lf;
    s.positionZ += (physics.positionZ - s.positionZ) * lf;

    // Smooth rotation updates
    s.pitch += (physics.pitch - s.pitch) * lf;
    s.roll += (physics.roll - s.roll) * lf;
    // Yaw is direct (no interpolation for responsiveness)
    s.yaw = physics.yaw;

    // Apply smooth state to group
    const VS = 0.5;
    // Increased Y offset to 0.22 to ensure gimbal and legs are above ground
    groupRef.current.position.set(s.positionX * VS, (s.altitude * VS) + 0.22, s.positionZ * VS);

    // Rotation order for correct behavior
    groupRef.current.rotation.order = "YXZ";
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      (s.pitch * Math.PI) / 180, // W (-pitch) -> Negative X rot -> Tilt Forward
      lf
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      (-s.roll * Math.PI) / 180, // D (+roll) -> Negative Z rot -> Tilt Right
      lf
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      (s.yaw * Math.PI) / 180, // Negative yaw -> Negative Y rot -> Rotate CW (Right)
      lf
    );

    // Propeller animation - Scales strictly with motor RPM (stops when motors are 0)
    Object.entries(propsRef.current).forEach(([key, obj]) => {
      const val = motors[key as keyof MotorValues] || 0;
      const speed = (Math.max(0, val) / 100) * 60; // Max 60 rad/s visual speed
      const dir = (key === 'm2' || key === 'm3') ? 1 : -1; // CW vs CCW
      obj.rotation.y += speed * delta * dir;
    });

    // Update legacy arrow refs for compatibility
    if (arrowRefs.m1.current) arrowRefs.m1.current.scale.y = Math.max(0.01, (motors.m1 / 100) * 2);
    if (arrowRefs.m2.current) arrowRefs.m2.current.scale.y = Math.max(0.01, (motors.m2 / 100) * 2);
    if (arrowRefs.m3.current) arrowRefs.m3.current.scale.y = Math.max(0.01, (motors.m3 / 100) * 2);
    if (arrowRefs.m4.current) arrowRefs.m4.current.scale.y = Math.max(0.01, (motors.m4 / 100) * 2);
  });

  return (
    <>
      <group ref={groupRef}>
        <group ref={modelRef}>
          {/* Added X offset (-0.05) to center the asymmetric model */}
          <primitive object={clonedScene} scale={0.065} rotation={[0, Math.PI, 0]} position={[-0.05, 0, 0]} />
        </group>

        {/* Motor rotation rings */}
        <MotorRing position={MOTOR_POSITIONS.m1.pos} rotation={MOTOR_POSITIONS.m1.rotation} color={MOTOR_COLORS.m1} value={motors.m1} />
        <MotorRing position={MOTOR_POSITIONS.m2.pos} rotation={MOTOR_POSITIONS.m2.rotation} color={MOTOR_COLORS.m2} value={motors.m2} />
        <MotorRing position={MOTOR_POSITIONS.m3.pos} rotation={MOTOR_POSITIONS.m3.rotation} color={MOTOR_COLORS.m3} value={motors.m3} />
        <MotorRing position={MOTOR_POSITIONS.m4.pos} rotation={MOTOR_POSITIONS.m4.rotation} color={MOTOR_COLORS.m4} value={motors.m4} />

        <ForceVectors
          motors={motors}
          visible={showForces}
          motorPositions={MOTOR_POSITIONS}
        />

        {/* Legacy arrows (kept for reference) */}
        <ForceArrow innerRef={arrowRefs.m1} position={MOTOR_POSITIONS.m1.pos} color={MOTOR_COLORS.m1} />
        <ForceArrow innerRef={arrowRefs.m2} position={MOTOR_POSITIONS.m2.pos} color={MOTOR_COLORS.m2} />
        <ForceArrow innerRef={arrowRefs.m3} position={MOTOR_POSITIONS.m3.pos} color={MOTOR_COLORS.m3} />
        <ForceArrow innerRef={arrowRefs.m4} position={MOTOR_POSITIONS.m4.pos} color={MOTOR_COLORS.m4} />
      </group>
      <CameraController mode={cameraMode} droneRef={groupRef} altitude={physics.altitude} />
    </>
  );
}

function DaylightEnvironment() {
  return (
    <group>
      <color attach="background" args={["#bae6fd"]} /> {/* Sky Blue - Trông chuyên nghiệp hơn */}
      <fog attach="fog" args={["#bae6fd", 50, 400]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[100, 100, 100]}
        intensity={2}
        castShadow
      />

      <Environment preset="park" />

      {/* Modern High-Tech Ground Area - Lowered to avoid flickering (Z-fighting) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <circleGeometry args={[50, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
      </mesh>

      <Grid
        infiniteGrid
        fadeDistance={250}
        fadeStrength={5}
        cellSize={1}
        sectionSize={10}
        sectionColor="#94a3b8"
        cellColor="#cbd5e1"
        cellThickness={1}
        sectionThickness={1.5}
      />

      {/* Modern Training Pillars */}
      {[[-30, -30], [30, -30], [-30, 30], [30, 30]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 15, 0]}>
            <cylinderGeometry args={[2, 3, 30, 6]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 30, 0]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <pointLight position={[0, 30, 0]} color="#38bdf8" intensity={10} distance={40} />
        </group>
      ))}

      {/* Floating Cloud Particles */}
      <Stars radius={200} depth={50} count={500} factor={10} saturation={0} fade speed={0.5} />
    </group>
  );
}

function NightCityEnvironment() {
  return (
    <group>
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 40, 250]} />

      <ambientLight intensity={0.2} />
      <pointLight position={[0, 80, 0]} intensity={3} color="#818cf8" distance={500} />
      <Environment preset="city" />

      <Grid
        infiniteGrid
        fadeDistance={200}
        fadeStrength={8}
        cellSize={1}
        sectionSize={10}
        sectionColor="#38bdf8"
        cellColor="#0f172a"
        cellThickness={0.8}
        sectionThickness={2}
      />

      {/* Cyberpunk Skyscrapers (Background) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 400,
            40 + Math.random() * 60,
            -150 - Math.random() * 200
          ]}
        >
          <boxGeometry args={[15 + Math.random() * 20, 100 + Math.random() * 120, 15 + Math.random() * 20]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive="#1e1b4b"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
          {/* Windows / Lights */}
          <pointLight color="#38bdf8" intensity={2} distance={50} />
        </mesh>
      ))}

      {/* Atmospheric Neon Haze */}
      <Stars radius={150} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

function ScaffoldTower({ x, z, h = 40 }: { x: number; z: number; h?: number }) {
  const steelMat = (
    <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.25} />
  );
  const crossMat = (
    <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.3} />
  );
  const cols: [number, number][] = [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]];
  const levels = Math.floor(h / 8);

  return (
    <group position={[x, 0, z]}>
      {/* 4 vertical columns */}
      {cols.map(([cx, cz], i) => (
        <mesh key={i} position={[cx, h / 2, cz]}>
          <boxGeometry args={[0.25, h, 0.25]} />
          {steelMat}
        </mesh>
      ))}
      {/* Horizontal rings every 8m */}
      {Array.from({ length: levels }).map((_, l) => (
        <group key={l} position={[0, (l + 1) * 8, 0]}>
          {/* Ring bars */}
          <mesh position={[0, 0, -1.5]}><boxGeometry args={[3.25, 0.2, 0.2]} />{steelMat}</mesh>
          <mesh position={[0, 0, 1.5]}><boxGeometry args={[3.25, 0.2, 0.2]} />{steelMat}</mesh>
          <mesh position={[-1.5, 0, 0]}><boxGeometry args={[0.2, 0.2, 3.25]} />{steelMat}</mesh>
          <mesh position={[1.5, 0, 0]}><boxGeometry args={[0.2, 0.2, 3.25]} />{steelMat}</mesh>
          {/* X braces on two faces */}
          <mesh position={[0, -4, -1.5]} rotation={[0, 0, Math.atan2(8, 3)]}>
            <boxGeometry args={[0.12, 8.6, 0.12]} />{crossMat}
          </mesh>
          <mesh position={[0, -4, 1.5]} rotation={[0, 0, -Math.atan2(8, 3)]}>
            <boxGeometry args={[0.12, 8.6, 0.12]} />{crossMat}
          </mesh>
        </group>
      ))}
      {/* Work light on top */}
      <mesh position={[0, h + 0.5, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>
      <pointLight position={[0, h, 0]} color="#fde68a" intensity={15} distance={60} />
    </group>
  );
}

function WarehouseWall({ x, z, w, h, rotY = 0 }: { x: number; z: number; w: number; h: number; rotY?: number }) {
  return (
    <group position={[x, h / 2, z]} rotation={[0, rotY, 0]}>
      {/* Main wall */}
      <mesh>
        <boxGeometry args={[w, h, 0.6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Horizontal panels */}
      {Array.from({ length: Math.floor(h / 4) }).map((_, i) => (
        <mesh key={i} position={[0, -h / 2 + i * 4 + 2, 0.35]}>
          <boxGeometry args={[w, 0.15, 0.1]} />
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function CityFireEnvironment() {
  // Cố định dữ liệu map để không bị nhảy khi render
  const buildings = useMemo(() => {
    const b = [];
    
    // 1. ĐẢM BẢO CÓ TÒA NHÀ TẠI CÁC ĐIỂM CHÁY (Hạ thấp độ cao)
    const missionPoints = [
      { x: -40, z: -120, h: 60, color: "#111827" },
      { x: 55, z: -300, h: 80, color: "#0f172a" },
      { x: -65, z: -500, h: 70, color: "#1e293b" }
    ];
    
    missionPoints.forEach((p, i) => {
      b.push({
        id: `mission-${i}`,
        x: p.x,
        z: p.z,
        w: 25,
        d: 25,
        h: p.h,
        color: p.color,
        windows: Array.from({ length: 15 }).map(() => ({
          y: (Math.random() - 0.5),
          opacity: 0.2 + Math.random() * 0.6
        }))
      });
    });

    // 2. Tạo thêm các tòa nhà ngẫu nhiên khác xung quanh
    for (let i = 0; i < 50; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (35 + Math.random() * 100);
      const z = (Math.random() - 0.5) * 1200;

      // Tránh đè lên các tòa nhà mission
      const isNearMission = missionPoints.some(p => Math.abs(p.x - x) < 50 && Math.abs(p.z - z) < 50);
      if (isNearMission) continue;

      b.push({
        id: i,
        x,
        z,
        w: 15 + Math.random() * 30,
        h: 40 + Math.random() * 200,
        d: 15 + Math.random() * 30,
        color: ["#0f172a", "#1e293b", "#020617"][Math.floor(Math.random() * 3)],
        windows: Array.from({ length: 10 }).map(() => ({
          y: (Math.random() - 0.5),
          opacity: 0.1 + Math.random() * 0.4
        }))
      });
    }
    return b;
  }, []);

  const streetLights = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      z: (i - 12) * 45
    }));
  }, []);

  return (
    <group>
      <color attach="background" args={["#010413"]} />
      <fog attach="fog" args={["#010413", 60, 450]} />

      <ambientLight intensity={0.15} />
      <Environment preset="city" />

      {/* ── MẶT ĐẤT & VỈA HÈ ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>

      {/* Đường nhựa chính */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[22, 2000]} />
        <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Vỉa hè (Sidewalks) */}
      {[-13.5, 13.5].map(x => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.04, 0]}>
          <planeGeometry args={[5, 2000]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
      ))}

      {/* Vạch kẻ đường */}
      {Array.from({ length: 60 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, (i - 30) * 40]}>
          <planeGeometry args={[0.8, 12]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* ── ĐÈN ĐƯỜNG ── */}
      {streetLights.map((light) => (
        <group key={light.id} position={[11.5, 0, light.z]}>
          <mesh position={[0, 8, 0]}>
            <cylinderGeometry args={[0.15, 0.25, 16]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[1, 16, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[2, 16, 0]}>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          <pointLight position={[2, 15, 0]} color="#fef08a" intensity={25} distance={60} />
        </group>
      ))}

      {/* ── TÒA NHÀ CAO TẦNG ── */}
      {buildings.map((b) => (
        <group key={b.id} position={[b.x, b.h / 2, b.z]}>
          <mesh>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={b.color} metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Windows */}
          {b.windows.map((win, j) => (
            <mesh key={j} position={[0, win.y * b.h, b.d / 2 + 0.1]}>
              <planeGeometry args={[b.w * 0.85, 1.2]} />
              <meshBasicMaterial color="#60a5fa" transparent opacity={win.opacity * 0.4} />
            </mesh>
          ))}
        </group>
      ))}

      <Stars radius={300} depth={60} count={3000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

function IndustrialEnvironment() {
  return (
    <group>
      {/* Dark industrial sky */}
      <color attach="background" args={["#0a0f1a"]} />
      <fog attach="fog" args={["#0a0f1a", 80, 350]} />

      {/* Lighting — orange sodium work lights + cool fill */}
      <ambientLight intensity={0.15} color="#334155" />
      <directionalLight position={[50, 120, -80]} intensity={1.2} color="#fde68a" />
      <directionalLight position={[-80, 60, 100]} intensity={0.5} color="#7dd3fc" />

      <Environment preset="warehouse" />

      {/* ── CONCRETE GROUND ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, -90]}>
        <planeGeometry args={[700, 500]} />
        <meshStandardMaterial color="#1c1917" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Concrete slabs with seams */}
      {[
        [0, 0], [-30, -40], [30, -40], [-60, -80], [0, -80], [60, -80],
        [-30, -120], [30, -120], [0, -160]
      ].map(([sx, sz], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[sx, -0.07, sz]}>
          <planeGeometry args={[29.6, 29.6]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#1e1b18" : "#211e1b"} roughness={0.98} />
        </mesh>
      ))}

      {/* ── GROUND RUNWAY MARKINGS ── */}
      {[0, -40, -80, -120, -160].map((sz, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, sz]}>
          <planeGeometry args={[1.5, 20]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* ── SCAFFOLD TOWERS along the course ── */}
      <ScaffoldTower x={-22} z={-20} h={35} />
      <ScaffoldTower x={22} z={-20} h={35} />
      <ScaffoldTower x={-28} z={-65} h={50} />
      <ScaffoldTower x={32} z={-65} h={50} />
      <ScaffoldTower x={-25} z={-110} h={60} />
      <ScaffoldTower x={30} z={-110} h={60} />
      <ScaffoldTower x={-20} z={-155} h={70} />
      <ScaffoldTower x={25} z={-155} h={70} />
      {/* Extra flanking towers */}
      <ScaffoldTower x={-55} z={-40} h={28} />
      <ScaffoldTower x={55} z={-40} h={28} />
      <ScaffoldTower x={-60} z={-130} h={45} />
      <ScaffoldTower x={60} z={-130} h={45} />

      {/* ── OVERHEAD CRANE BEAMS ── */}
      {[-30, -90, -150].map((sz, i) => (
        <group key={i} position={[0, 55 + i * 10, sz]}>
          <mesh>
            <boxGeometry args={[80, 1.2, 1.2]} />
            <meshStandardMaterial color="#1e293b" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Hanging cables */}
          {[-30, -10, 10, 30].map((cx, j) => (
            <mesh key={j} position={[cx, -8, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 16, 4]} />
              <meshStandardMaterial color="#374151" metalness={1} roughness={0.1} />
            </mesh>
          ))}
          {/* Work light on beam */}
          <pointLight color="#fbbf24" intensity={20} distance={80} position={[0, -2, 0]} />
        </group>
      ))}

      {/* ── WAREHOUSE WALLS (background) ── */}
      <WarehouseWall x={0} z={-240} w={180} h={55} />
      <WarehouseWall x={-120} z={-120} w={60} h={45} rotY={Math.PI / 2} />
      <WarehouseWall x={120} z={-120} w={60} h={45} rotY={Math.PI / 2} />
      <WarehouseWall x={-110} z={-30} w={40} h={30} rotY={Math.PI / 2} />
      <WarehouseWall x={110} z={-30} w={40} h={30} rotY={Math.PI / 2} />

      {/* ── SHIPPING CONTAINERS (stacked) ── */}
      {[
        [-75, 0, -50, "#7f1d1d"], [-75, 3.5, -50, "#991b1b"],
        [80, 0, -50, "#1e3a5f"], [80, 3.5, -50, "#1e40af"],
        [-80, 0, -100, "#14532d"],
        [75, 0, -100, "#7f1d1d"], [75, 3.5, -100, "#b91c1c"],
        [-78, 0, -150, "#1e3a5f"],
        [78, 0, -150, "#14532d"], [78, 3.5, -150, "#166534"],
      ].map(([cx, cy, cz, col], i) => (
        <mesh key={i} position={[cx as number, (cy as number) + 1.75, cz as number]}>
          <boxGeometry args={[12, 3.5, 6]} />
          <meshStandardMaterial color={col as string} roughness={0.8} metalness={0.4} />
        </mesh>
      ))}

      {/* ── GROUND PUDDLES / OIL SLICKS (reflective circles) ── */}
      {[[-10, -25], [15, -55], [-8, -90], [12, -130]].map(([px, pz], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[px, -0.04, pz]}>
          <circleGeometry args={[2 + i * 0.5, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={1} roughness={0} transparent opacity={0.8} />
        </mesh>
      ))}

      {/* ── SCATTERED DEBRIS ── */}
      {[[-18, 0, -18], [22, 0, -35], [-30, 0, -70], [28, 0, -110]].map(([dx, dy, dz], i) => (
        <mesh key={i} position={[dx, 0.5, dz]} rotation={[0, i * 1.2, 0]}>
          <boxGeometry args={[3 + i * 0.5, 1, 1.5]} />
          <meshStandardMaterial color="#374151" roughness={0.9} metalness={0.3} />
        </mesh>
      ))}

      {/* ── PERIMETER NEON ACCENT LIGHTS ── */}
      {[
        [-80, 20, -60, "#22d3ee"], [80, 20, -60, "#22d3ee"],
        [-80, 30, -130, "#f97316"], [80, 30, -130, "#f97316"],
      ].map(([lx, ly, lz, col], i) => (
        <pointLight key={i}
          position={[lx as number, ly as number, lz as number]}
          color={col as string}
          intensity={25}
          distance={100}
        />
      ))}

      {/* ── DUST/HAZE PARTICLES ── */}
      <Stars radius={200} depth={80} count={400} factor={1} saturation={0} fade speed={0.1} />
    </group>
  );
}

function SpaceEnvironment() {
  return (
    <group>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 30, 300]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[20, 50, 10]} intensity={2} color="#f8fafc" />
      <directionalLight position={[-20, -20, -20]} intensity={1.5} color="#38bdf8" />

      <Environment preset="city" />

      {/* Space Station Framework */}
      <group>
        {[0, 120, 240].map((angle) => (
          <group key={angle} rotation={[0, (angle * Math.PI) / 180, 0]}>
            <mesh position={[0, 0, -80]}>
              <boxGeometry args={[160, 2, 2]} />
              <meshStandardMaterial color="#1e293b" metalness={1} roughness={0} />
            </mesh>
            <mesh position={[0, 50, -80]}>
              <boxGeometry args={[200, 1, 1]} />
              <meshBasicMaterial color="#22d3ee" transparent opacity={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Distant Nebula (Using Large glowing spheres) */}
      <mesh position={[100, 100, -200]}>
        <sphereGeometry args={[80, 32, 32]} />
        <meshBasicMaterial color="#1e1b4b" transparent opacity={0.1} />
      </mesh>
      <mesh position={[-150, 50, -150]}>
        <sphereGeometry args={[60, 32, 32]} />
        <meshBasicMaterial color="#312e81" transparent opacity={0.1} />
      </mesh>

      <Grid
        infiniteGrid
        fadeDistance={150}
        fadeStrength={10}
        cellSize={2}
        sectionSize={20}
        sectionColor="#22d3ee"
        cellColor="#020617"
        cellThickness={1.5}
        sectionThickness={3}
      />

      <Stars radius={300} depth={100} count={10000} factor={6} saturation={1} fade speed={2} />
    </group>
  );
}

// ─── QUẢN LÝ MÀN CHƠI (LEVEL MANAGER) ───
// Component này phải nằm trong <Canvas> để sử dụng được useThree và useFrame
function LevelManager({
  levelFactory,
  onLevelUpdate,
  drone,
  resetTrigger
}: {
  levelFactory?: LevelFactory,
  onLevelUpdate?: (result: LevelResult) => void,
  drone: THREE.Group | null,
  resetTrigger?: number
}) {
  const { scene } = useThree();
  const levelInstanceRef = useRef<LevelInstance | null>(null);

  // Khởi tạo Level
  useEffect(() => {
    if (levelFactory && drone) {
      // Dọn dẹp level cũ nếu có
      if (levelInstanceRef.current) {
        levelInstanceRef.current.cleanup();
      }

      const instance = levelFactory(scene, drone);
      instance.init();
      levelInstanceRef.current = instance;

      return () => {
        if (levelInstanceRef.current) {
          levelInstanceRef.current.cleanup();
          levelInstanceRef.current = null;
        }
      };
    }
  }, [levelFactory, scene, drone]);

  // Reset level khi resetTrigger thay đổi
  useEffect(() => {
    if (resetTrigger !== undefined && levelInstanceRef.current) {
      levelInstanceRef.current.cleanup();
      if (levelFactory && drone) {
        const instance = levelFactory(scene, drone);
        instance.init();
        levelInstanceRef.current = instance;
      }
    }
  }, [resetTrigger, levelFactory, scene, drone]);

  // Cập nhật logic level mỗi khung hình
  useFrame((_, delta) => {
    if (levelInstanceRef.current && onLevelUpdate) {
      const result = levelInstanceRef.current.update(delta);
      onLevelUpdate(result);
    }
  });

  return null;
}

export function FlightDroneViewer({
  physicsRef,
  showForces = false,
  cameraMode: externalCameraMode,
  levelFactory,
  onLevelUpdate,
  environmentType = "SPACE",
  resetTrigger
}: {
  physicsRef: React.MutableRefObject<FlightState>,
  showForces?: boolean,
  cameraMode?: CameraMode,
  levelFactory?: LevelFactory,
  onLevelUpdate?: (result: LevelResult) => void,
  environmentType?: EnvironmentType,
  resetTrigger?: number
}) {
  // Use external camera mode if provided, otherwise default to FOLLOW
  const cameraMode = externalCameraMode || "FOLLOW";
  const [droneGroup, setDroneGroup] = useState<THREE.Group | null>(null);

  // Local ref cho UI (Altitude/Stability mini HUD)
  const [hudState, setHudState] = useState({ altitude: 0, stability: 100 });

  useEffect(() => {
    // Update HUD occasionally (10Hz) to avoid 60Hz React renders
    const interval = setInterval(() => {
      setHudState({
        altitude: physicsRef.current.altitude,
        stability: physicsRef.current.stability
      });
    }, 100);
    return () => clearInterval(interval);
  }, [physicsRef]);

  return (
    <div className="w-full h-full relative bg-[#020617] overflow-hidden rounded-xl">
      <Canvas dpr={1} gl={{ powerPreference: "high-performance", antialias: false }}>
        <Suspense fallback={null}>
          {environmentType === "DAY" ? (
            <DaylightEnvironment />
          ) : environmentType === "NIGHT" ? (
            <NightCityEnvironment />
          ) : environmentType === "INDUSTRIAL" ? (
            <IndustrialEnvironment />
          ) : environmentType === "CITY_FIRE" ? (
            <CityFireEnvironment />
          ) : (
            <SpaceEnvironment />
          )}

          <LevelManager
            key={resetTrigger}
            levelFactory={levelFactory}
            onLevelUpdate={onLevelUpdate}
            drone={droneGroup}
            resetTrigger={resetTrigger}
          />

          <FlightDrone
            physicsRef={physicsRef}
            showForces={showForces}
            cameraMode={cameraMode}
            onDroneMount={setDroneGroup}
          />

          <ContactShadows
            position={[physicsRef.current.positionX * 0.5, -0.04, physicsRef.current.positionZ * 0.5]}
            opacity={0.65}
            scale={6}
            blur={3}
            far={1.5}
            color="#000"
          />
        </Suspense>

        {cameraMode === "ORBIT" && (
          <OrbitControls
            makeDefault
            maxPolarAngle={Math.PI / 2.05}
            minDistance={2}
            maxDistance={100}
            target={[physicsRef.current.positionX, physicsRef.current.altitude, physicsRef.current.positionZ]}
          />
        )}
      </Canvas>


    </div>
  );
}
