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
import { ForceVectors } from "./ForceVectors";
import { cn } from "@/lib/utils";
import { RotateCcw, Eye, Video, LayoutGrid } from "lucide-react";

type CameraMode = "FOLLOW" | "ORBIT" | "TOP" | "FPV";

interface DroneProps {
  physicsRef: React.MutableRefObject<FlightState>;
  showForces: boolean;
  cameraMode: CameraMode;
}

// ── Camera Controller Component ──────────────────────────────────────────────
function CameraController({ mode, droneRef, altitude }: { mode: CameraMode, droneRef: React.RefObject<THREE.Group>, altitude: number }) {
  const { camera } = useThree();
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const lookAtPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!droneRef.current) return;

    const dronePos = droneRef.current.position;
    const droneRot = droneRef.current.rotation;
    lookAtPos.lerp(dronePos, 0.12);

    switch (mode) {
      case "FOLLOW": {
        const baseDistance = 6;
        const zoomFactor = Math.min(1.0, altitude / 25);
        const distance = baseDistance + (zoomFactor * 10);
        const height = 2.8 + (zoomFactor * 5);
        // Drone faces -Z, so camera should be placed at +Z to look at its back
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
        targetPos.set(dronePos.x, dronePos.y + 25, dronePos.z);
        camera.position.lerp(targetPos, 0.05);
        camera.lookAt(lookAtPos);
        break;
      }
      case "FPV": {
        // Gắn camera cố định vào mũi drone (Dùng Quaternion để bám theo cả Pitch, Roll, Yaw)
        const localOffset = new THREE.Vector3(0, 0.15, -0.35); 
        const worldPos = localOffset.applyQuaternion(droneRef.current.quaternion);
        targetPos.copy(dronePos).add(worldPos);
        
        camera.position.lerp(targetPos, 0.8);
        
        // FPV Camera Uptilt (Góc ngẩng camera): Khoảng 25 độ
        // Drone FPV thật luôn gắn camera ngẩng lên, để khi chúi mũi bay nhanh về trước, bạn vẫn nhìn thấy đường ngang
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
  m1: { pos: [-1.1, 0.3, -0.5], rotation: 1 },    // Front Left  (CW)
  m2: { pos: [0.3, 0.3, -0.5], rotation: -1 },   // Front Right (CCW)
  m3: { pos: [-1.1, 0.3, 0.9], rotation: -1 },    // Rear Left   (CCW)
  m4: { pos: [0.25, 0.3, 0.9], rotation: 1 },     // Rear Right  (CW)
};

const MOTOR_COLORS = {
  m1: "#34d399", // Emerald - CW
  m2: "#fb923c", // Orange - CCW
  m3: "#fb923c", // Orange - CCW
  m4: "#34d399", // Emerald - CW
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
      <torusGeometry args={[0.07, 0.01, 8, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0.15 + intensity * 0.4} depthTest={false} />
    </mesh>
  );
}

// Simple thrust arrow
function ThrustArrow({ position, color, value }: { position: [number, number, number]; color: string; value: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const currentScale = useRef(0);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const targetScale = Math.max(0.1, value / 100 * 1.0);
      currentScale.current += (targetScale - currentScale.current) * Math.min(1, delta * 8);
      groupRef.current.scale.y = currentScale.current;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.5]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} depthTest={false} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <coneGeometry args={[0.03, 0.1, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} depthTest={false} />
      </mesh>
    </group>
  );
}

function ForceArrow({ innerRef, position, color }: { innerRef: any, position: [number, number, number], color: string }) {
  return (
    <group position={position}>
      <group ref={innerRef}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.7]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} depthTest={false} />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <coneGeometry args={[0.04, 0.12]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} depthTest={false} />
        </mesh>
      </group>
    </group>
  );
}

function FlightDrone({ physicsRef, showForces, cameraMode }: DroneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const propsRef = useRef<{ [key: string]: THREE.Object3D }>({});
  const { scene } = useGLTF("/models/quadcopter.glb");

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
    // W = positive pitch → positive X rotation = tilt nose down = move forward
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      (s.pitch * Math.PI) / 180,
      lf
    );
    // D = positive roll → negative Z rotation = tilt right = strafe right
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      (-s.roll * Math.PI) / 180,
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
      const dir = (key === 'm1' || key === 'm4') ? 1 : -1; // CW vs CCW
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

// ─── HIGH-TECH LAB ENVIRONMENT ───
// A simulation testing chamber that fits the UI aesthetic
function TechLabEnvironment() {
  return (
    <group>
      {/* Deep Space / Tech Background */}
      <color attach="background" args={["#020617"]} />
      
      {/* Fog for depth */}
      <fog attach="fog" args={["#020617", 20, 120]} />

      {/* Lighting - Use Neutral white so the drone model keeps its original color */}
      <ambientLight intensity={1.5} color="#ffffff" />
      {/* Main overhead light - cool white */}
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#f8fafc" />
      {/* Rim light - cyan for sci-fi feel but not overpowering */}
      <directionalLight position={[-10, 5, -10]} intensity={1.5} color="#38bdf8" />
      {/* Ground glow from the landing pad */}
      <pointLight position={[0, 1, 0]} intensity={1.5} color="#22d3ee" distance={15} />

      {/* Glowing Tron-like Grid Floor */}
      <Grid 
        renderOrder={-1}
        position={[0, 0, 0]} 
        infiniteGrid 
        fadeDistance={100} 
        fadeStrength={5} 
        cellSize={1} 
        sectionSize={10} 
        sectionColor="#38bdf8" 
        cellColor="#1e293b" 
        cellThickness={0.5} 
        sectionThickness={1} 
      />

      {/* Center Landing Pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.5, 2, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.8} />
      </mesh>
      
      {/* Center Decal (H) */}
      <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[-0.3, 0, 0]}>
          <planeGeometry args={[0.2, 1]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[0.3, 0, 0]}>
          <planeGeometry args={[0.2, 1]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.4, 0.2]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Sci-fi Pillars / Test Equipment */}
      {[-20, 20].map((x) => 
        [-20, 20].map((z) => (
          <group key={`${x}-${z}`} position={[x, 0, z]}>
            {/* Pillar */}
            <mesh position={[0, 5, 0]}>
              <cylinderGeometry args={[1, 1.5, 10, 6]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
            </mesh>
            {/* Glowing Ring */}
            <mesh position={[0, 9, 0]} rotation={[Math.PI/2, 0, 0]}>
              <torusGeometry args={[1.8, 0.1, 16, 32]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            {/* Top Light */}
            <pointLight position={[0, 10, 0]} color="#38bdf8" intensity={2} distance={15} />
          </group>
        ))
      )}

      {/* Tech Rings (Flight Path Obstacles/Waypoints) */}
      {[[0, 10, -30], [-30, 15, 0], [30, 20, -10]].map((pos, i) => (
         <group key={`ring-${i}`} position={pos as any}>
            <mesh rotation={[0, Math.PI / 4 * i, 0]}>
              <torusGeometry args={[4, 0.2, 16, 64]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh rotation={[0, Math.PI / 4 * i, 0]}>
              <torusGeometry args={[3.8, 0.05, 16, 64]} />
              <meshBasicMaterial color="#818cf8" />
            </mesh>
         </group>
      ))}

      {/* Stars for background depth */}
      <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

export function FlightDroneViewer({ physicsRef, showForces = false }: { physicsRef: React.MutableRefObject<FlightState>, showForces?: boolean }) {
  const [cameraMode, setCameraMode] = useState<CameraMode>("FOLLOW");

  // Local ref for UI updates (Altitude/Stability mini HUD)
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

          <TechLabEnvironment />

          <FlightDrone physicsRef={physicsRef} showForces={showForces} cameraMode={cameraMode} />

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


      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl">
        {[
          { id: "FOLLOW", icon: Video, label: "Lái (Pilot)" },
          { id: "ORBIT", icon: RotateCcw, label: "Quan Sát (Orbit)" },
          { id: "TOP", icon: LayoutGrid, label: "Bản Đồ (Map)" },
          { id: "FPV", icon: Eye, label: "Góc Nhìn 1 (FPV)" },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setCameraMode(mode.id as CameraMode)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
              cameraMode === mode.id
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                : "text-white/40 hover:text-white/80 hover:bg-white/5"
            )}
          >
            <mode.icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
