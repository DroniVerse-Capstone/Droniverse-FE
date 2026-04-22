"use client";

import { useRef, useMemo, Suspense, type MutableRefObject, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Float, ContactShadows } from "@react-three/drei";
import { CameraIcon, ZapIcon, ArrowUpIcon, MoveHorizontalIcon, RotateCwIcon } from "lucide-react";
import * as THREE from "three";
import { LabPhysicsState, Lesson, MASS, GRAVITY, MAX_THRUST } from "./PhysicsLabPhysics";

const DRONE_BASE_Y = 0.5;

// ─── PROPELLER VISUALS (THE ONLY 3D FEEDBACK KEPT) ───────────────────────────
function PropVisual({ position, value, color }: { position: [number, number, number]; value: number; color: string; }) {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    const intensity = (value - 15) / (100 - 15);
    if (ringRef.current) {
      ringRef.current.rotation.z += (1 + intensity * 25) * delta;
      ringRef.current.scale.setScalar(0.8 + intensity * 0.3);
      (ringRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 4 + intensity * 10;
    }
  });
  return (
    <group position={position}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.27, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} emissive={color} emissiveIntensity={5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── DRONE MODEL ─────────────────────────────────────────────────────────────
function DroneModel({ physicsRef, isPivot }: { physicsRef: MutableRefObject<LabPhysicsState>; isPivot: boolean }) {
  const groupRef  = useRef<THREE.Group>(null);
  const propsRef  = useRef<Record<string, THREE.Object3D>>({});
  const { scene } = useGLTF("/models/quadcopter.glb");
  const { camera } = useThree();

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => { if ((child as THREE.Mesh).isMesh) { (child as THREE.Mesh).castShadow = (child as THREE.Mesh).receiveShadow = true; } });
    return clone;
  }, [scene]);

  useMemo(() => {
    propsRef.current = {};
    clonedScene.traverse((child) => {
      const name = child.name.toLowerCase();
      if (name.includes("prop1") || name.includes("polysurface36")) propsRef.current.fl = child;
      if (name.includes("prop4") || name.includes("polysurface40")) propsRef.current.fr = child;
      if (name.includes("prop3") || name.includes("polysurface45")) propsRef.current.rl = child;
      if (name.includes("prop2") || name.includes("polysurface47")) propsRef.current.rr = child;
    });
  }, [clonedScene]);

  const smooth = useRef({ posX: 0, posZ: 0, pitch: 0, roll: 0, yaw: 0, altitude: 0 });

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const s = physicsRef.current;
    const lf = Math.min(1, delta * 15);
    smooth.current.posX += (s.posX - smooth.current.posX) * lf;
    smooth.current.posZ += (s.posZ - smooth.current.posZ) * lf;
    smooth.current.pitch += (s.pitch - smooth.current.pitch) * lf;
    smooth.current.roll  += (s.roll  - smooth.current.roll)  * lf;
    smooth.current.yaw   += (s.yaw   - smooth.current.yaw)   * lf;
    smooth.current.altitude += (s.altitude - smooth.current.altitude) * lf;

    const g = groupRef.current;
    g.position.set(smooth.current.posX, DRONE_BASE_Y + smooth.current.altitude * 0.25, smooth.current.posZ);
    g.rotation.order = "YXZ";
    g.rotation.x = (smooth.current.pitch * Math.PI) / 180;
    g.rotation.z = (smooth.current.roll * Math.PI) / 180;
    g.rotation.y = (smooth.current.yaw * Math.PI) / 180;

    if (isPivot) {
      const camOffset = new THREE.Vector3(0, 2.0, -8.0);
      const targetPos = g.position.clone().add(camOffset);
      camera.position.lerp(targetPos, 0.1);
      camera.lookAt(g.position.x, g.position.y + 0.3, g.position.z);
    }
    Object.entries(propsRef.current).forEach(([key, obj]) => {
      const val = (s.motors as any)[key] ?? 0;
      const speed = 25 + (val / 100) * 120;
      obj.rotation.y += speed * delta * ((key === "fl" || key === "rr") ? 1 : -1);
    });
  });

  const motorOffsets: Record<string, [number, number, number]> = { fl: [0.4, 0.06, 0.4], fr: [-0.4, 0.06, 0.4], rl: [0.4, 0.06, -0.4], rr: [-0.4, 0.06, -0.4] };

  return (
    <group ref={groupRef} position={[0, DRONE_BASE_Y, 0]}>
      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.1}>
        <primitive object={clonedScene} scale={0.075} />
      </Float>
      {Object.entries(motorOffsets).map(([key, pos]) => {
        const val = (physicsRef.current.motors as any)[key] ?? 15;
        return <PropVisual key={key} position={pos} value={val} color={val > 50 ? "#22d3ee" : "#1e40af"} />;
      })}
    </group>
  );
}

// ─── STATUS HUD COMPONENT (2D OVERLAY) ───────────────────────────────────────
function StatusHUD({ physicsRef }: { physicsRef: MutableRefObject<LabPhysicsState> }) {
  const [data, setData] = useState<LabPhysicsState>(physicsRef.current);

  useEffect(() => {
    const interval = setInterval(() => {
      setData({ ...physicsRef.current });
    }, 50); // Update HUD every 50ms
    return () => clearInterval(interval);
  }, [physicsRef]);

  const getAnalysis = () => {
    if (data.altitude <= 0 && data.totalThrust < 10) return "Drone đang ở mặt đất. Tăng Throttle để tạo Lực Nâng.";
    if (data.altitude > 0 && Math.abs(data.pitch) < 2 && Math.abs(data.roll) < 2) return "Drone đang bay lơ lửng cân bằng (Hover).";
    
    let parts = [];
    if (data.pitch > 2) parts.push("Motor Sau mạnh hơn -> Mũi chúi xuống -> Bay TIẾN.");
    if (data.pitch < -2) parts.push("Motor Trước mạnh hơn -> Mũi ngóc lên -> Bay LÙI.");
    if (data.roll > 2) parts.push("Motor Phải mạnh hơn -> Nghiêng PHẢI -> Dạt PHẢI.");
    if (data.roll < -2) parts.push("Motor Trái mạnh hơn -> Nghiêng TRÁI -> Dạt TRÁI.");
    
    return parts.length > 0 ? parts.join(" ") : "Đang thực hiện các thao tác kết hợp.";
  };

  return (
    <div className="absolute top-24 left-6 flex flex-col gap-4 pointer-events-none select-none max-w-sm">
      {/* Physics Analysis Panel */}
      <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2 mb-3 text-cyan-400">
          <ZapIcon className="w-4 h-4 fill-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-widest">Phân tích Vật lý Live</span>
        </div>
        <p className="text-sm text-white/90 leading-relaxed font-medium min-h-[3rem]">
          {getAnalysis()}
        </p>
      </div>

      {/* Telemetry Stats Panel */}
      <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-white/40 uppercase font-bold">Lực Nâng</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all" style={{ width: `${(data.totalThrust / MAX_THRUST) * 100}%` }} />
            </div>
            <span className="text-[10px] text-white font-mono">{Math.round(data.totalThrust)}N</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-white/40 uppercase font-bold">Độ Cao</span>
          <div className="text-xs text-white font-bold">{data.altitude.toFixed(1)}m</div>
        </div>
      </div>
    </div>
  );
}

// ─── VIEWER COMPONENT ────────────────────────────────────────────────────────
export function PhysicsLabViewer({ physicsRef, lesson }: { physicsRef: MutableRefObject<LabPhysicsState>; lesson: Lesson | null; }) {
  const [isPivot, setIsPivot] = useState(true);

  return (
    <div className="w-full h-full relative group overflow-hidden">
      <Canvas shadows camera={{ position: [0, 3, -10], fov: 38 }}>
        <color attach="background" args={["#020205"]} />
        <Environment preset="city" />
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 10, -5]} intensity={1.5} />
        <ContactShadows opacity={0.4} scale={40} blur={2.5} far={12} />
        <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <gridHelper args={[1000, 2000, "#1a1a35", "#0a0a1a"]} rotation={[Math.PI / 2, 0, 0]} />
        </group>

        <Suspense fallback={null}>
          <DroneModel physicsRef={physicsRef} isPivot={isPivot} />
        </Suspense>
        
        <OrbitControls enablePan={false} minDistance={4} maxDistance={100} target={[0, DRONE_BASE_Y, 0]} enabled={!isPivot} makeDefault />
      </Canvas>

      {/* 2D Status HUD - Replaces chaotic 3D arrows/labels */}
      <StatusHUD physicsRef={physicsRef} />

      {/* CAMERA TOGGLE */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button onClick={() => setIsPivot(!isPivot)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest ${isPivot ? "bg-cyan-500 text-black border-cyan-400" : "bg-black/40 text-white border-white/10"}`}>
          <CameraIcon className="w-3.5 h-3.5" /> {isPivot ? "Pivot View" : "Free View"}
        </button>
      </div>

      {/* MOTOR LEGEND */}
      <div className="absolute bottom-6 right-6 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex flex-col gap-2 pointer-events-none">
        <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Trạng thái Động cơ</div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#22d3ee] shadow-[0_0_10px_#22d3ee]" /> <span className="text-[10px] text-white/80">Công suất Cao (High)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#1e40af]" /> <span className="text-[10px] text-white/80">Công suất Thấp (Idle)</span>
        </div>
      </div>
    </div>
  );
}

useGLTF.preload("/models/quadcopter.glb");
