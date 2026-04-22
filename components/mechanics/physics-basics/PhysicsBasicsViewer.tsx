"use client";

import { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, ContactShadows, Stars, PerspectiveCamera, Html } from "@react-three/drei";
import * as THREE from "three";
import { PhysicsState, LessonId } from "./PhysicsBasicsEngine";
import { WEIGHT_FORCE_N } from "./PhysicsBasicsEngine";

interface ViewerProps {
  state: PhysicsState;
  lessonId: LessonId;
}

// Scale factor for arrow visualization (arbitrary for display)
const ARROW_SCALE = 0.08; // 1 Newton = 0.08 units in length

// Camera Tracker - follows drone vertically for lift, roll, and pitch experiments
function CameraTracker({ state, lessonId }: ViewerProps) {
  const controlsRef = useRef<any>(null);
  
  useFrame(() => {
    if (!controlsRef.current) return;
    
    // Follow drone for vertical experiments AND roll/pitch experiments
    const isLiftExperiment = lessonId === "lift" || lessonId === "equilibrium" || lessonId === "battery";
    const isRollExperiment = lessonId === "roll";
    const isPitchExperiment = lessonId === "pitch";
    
    if (isLiftExperiment || isRollExperiment || isPitchExperiment) {
      // Target drone position + offset
      const targetY = state.posY + 0.5;
      // Smoothly move camera target up/down
      controlsRef.current.target.y = THREE.MathUtils.lerp(
        controlsRef.current.target.y, 
        targetY, 
        0.05
      );
      controlsRef.current.update();
    }
  });
  
  return <OrbitControls ref={controlsRef} enablePan={true} minDistance={5} maxDistance={40} target={[0, 1.5, 0]} maxPolarAngle={Math.PI / 2.1} />;
}

function VectorArrow({
  direction,
  length,
  color,
  visible,
  label,
  labelValue,
  position = [0, 0, 0]
}: {
  direction: [number, number, number],
  length: number,
  color: string,
  visible: boolean,
  label?: string,
  labelValue?: string,
  position?: [number, number, number]
}) {
  const meshRef = useRef<THREE.Group>(null);
  const targetScale = Math.max(0.01, length);

  useFrame((_, delta) => {
    if (meshRef.current) {
      const currentScale = meshRef.current.scale.y;
      meshRef.current.scale.y = THREE.MathUtils.lerp(currentScale, targetScale, delta * 12);
    }
  });

  if (!visible) return null;

  const dirVec = new THREE.Vector3(...direction).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirVec);

  return (
    <group position={position as any}>
      <group quaternion={quaternion}>
        <group ref={meshRef} scale={[1, 0.01, 1]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 1, 0]}>
            <coneGeometry args={[0.06, 0.18, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.95} />
          </mesh>
        </group>
        {label && length > 0.05 && (
          <Html position={[0.15, length * 0.5 + 0.2, 0]} center>
            <div className="px-2 py-1 rounded bg-black/90 border border-white/20 backdrop-blur-md shadow-xl">
              <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap block" style={{ color }}>{label}</span>
              {labelValue && <span className="text-[8px] text-white/60 font-mono block mt-0.5">{labelValue}</span>}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

function TorqueIndicator({
  position,
  rpm,
  color,
  label,
  isCW
}: {
  position: number[],
  rpm: number,
  color: string,
  label: string,
  isCW: boolean
}) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Rotate the indicator: RPM affects rotation speed
      const rpmFactor = Math.max(0.25, rpm / 6000);
      meshRef.current.rotation.y += rpmFactor * delta * (isCW ? -1 : 1) * 3;
    }
  });

  const arcLength = (rpm / 9000) * Math.PI * 1.5;

  return (
    <group position={position as any}>
      <group ref={meshRef}>
        {/* Main Torque Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.012, 16, 32, arcLength]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.5}
            transparent
            opacity={0.6 + (rpm / 9000) * 0.4}
          />
        </mesh>

        {/* Arrow Head */}
        <group rotation={[Math.PI / 2, 0, -arcLength]}>
          <mesh position={[0.28, 0, 0]} rotation={[0, 0, 0]}>
            <coneGeometry args={[0.04, 0.1, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
          </mesh>
        </group>
      </group>

      {/* Label */}
      <Html position={[0, 0.15, 0]} center>
        <div className="flex flex-col items-center gap-0.5 pointer-events-none">
          <span className="text-[7px] font-black uppercase tracking-tighter opacity-40 text-white">{label}</span>
          <div className="px-1.5 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm shadow-xl">
            <span className="text-[9px] font-bold" style={{ color }}>{Math.round(rpm)}</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

function WindParticles({ windForce, visible }: { windForce: number, visible: boolean }) {
  const count = 40;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => Array.from({ length: count }, () => ({
    pos: new THREE.Vector3((Math.random() - 0.5) * 15, Math.random() * 5, (Math.random() - 0.5) * 10),
    speed: Math.random() * 2 + 1
  })), []);

  useFrame((_, delta) => {
    if (!meshRef.current || !visible) return;
    particles.forEach((p, i) => {
      p.pos.x += windForce * 0.05 * p.speed * delta;
      if (p.pos.x > 8) p.pos.x = -8;
      dummy.position.copy(p.pos);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.2, 0.01, 0.01]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} />
    </instancedMesh>
  );
}

function DroneModel({ state, lessonId }: ViewerProps) {
  const { scene } = useGLTF("/models/quadcopter.glb");
  const groupRef = useRef<THREE.Group>(null);
  const propsRef = useRef<THREE.Object3D[]>([]);

  // VỊ TRÍ CÁC ĐIỂM LỰC (Dành cho bài Roll, Pitch, Lift) - Giữ nguyên như cũ để không lệch vector
  const SIDE_OFFSETS = {
    center: [-0.5, 0.4, 0.2],
    left: [-1.3, 0.15, 0.3],
    right: [0.3, 0.15, 0.3],
    front: [-0.5, 0.15, -0.6],
    rear: [-0.5, 0.15, 1],
  };

  // VỊ TRÍ 4 ĐẦU MOTOR (Dành riêng cho bài xoay Yaw) - Để vòng torque hiện đúng cánh
  const MOTOR_OFFSETS = {
    FL: [-1.3, 0.15, -0.6],  // Trước Trái
    FR: [0.3, 0.15, -0.6],   // Trước Phải
    RL: [-1.3, 0.15, 1.0],   // Sau Trái
    RR: [0.3, 0.15, 1.0],    // Sau Phải
  };

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  useMemo(() => {
    propsRef.current = [];
    const propsMap: { [key: string]: THREE.Object3D } = {};
    clonedScene.traverse((child) => {
      const name = child.name.toLowerCase();
      // Corrected Mapping: m1=FL, m2=FR, m3=RL, m4=RR
      if (name.includes("polysurface40")) propsMap.m1 = child; // FL
      if (name.includes("polysurface45")) propsMap.m2 = child; // FR
      if (name.includes("polysurface47")) propsMap.m3 = child; // RL
      if (name.includes("polysurface36")) propsMap.m4 = child; // RR
    });
    // Strict order: [m1, m2, m3, m4] => [FL, FR, RL, RR]
    propsRef.current = [propsMap.m1, propsMap.m2, propsMap.m3, propsMap.m4].filter(Boolean);
  }, [clonedScene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    groupRef.current.position.set(state.posX, state.posY + 0.5, state.posZ);
    groupRef.current.rotation.order = "YXZ";
    groupRef.current.rotation.x = (state.pitch * Math.PI) / 180;
    groupRef.current.rotation.z = -(state.roll * Math.PI) / 180;
    groupRef.current.rotation.y = (state.yaw * Math.PI) / 180;

    // Fix hiện tượng Stroboscopic (bánh xe ngựa): Thay đổi baseSpin thành số lẻ (215)
    const baseSpin = state.isRunning ? 215 : 75;
    const batteryScale = state.batteryLevel / 100;

    // motorPowers matched to [m1=FL, m2=FR, m3=RL, m4=RR]
    // For roll experiment, use leftRPM/rightRPM; for pitch, use frontRPM/rearRPM
    let motorPowers: number[];
    if (lessonId === "roll") {
      // Left motors (FL, RL) use leftRPM, Right motors (FR, RR) use rightRPM
      motorPowers = [state.leftRPM, state.rightRPM, state.leftRPM, state.rightRPM];
    } else if (lessonId === "pitch") {
      // Front motors (FL, FR) use frontRPM, Rear motors (RL, RR) use rearRPM
      motorPowers = [state.frontRPM, state.frontRPM, state.rearRPM, state.rearRPM];
    } else {
      motorPowers = [state.motorFL, state.motorFR, state.motorRL, state.motorRR];
    }

    // THEO YÊU CẦU USER: CW là m2(FR), m3(RL); CCW là m1(FL), m4(RR)
    const isCW = [false, true, true, false]; // FL=CCW, FR=CW, RL=CW, RR=CCW

    propsRef.current.forEach((prop, i) => {
      if (!prop) return;
      
      let speed: number;
      if (lessonId === "roll") {
        // For roll, scale RPM to spin speed (RPM / 60 gives approximate spin multiplier)
        const rpmFactor = Math.max(0.33, motorPowers[i] / 6000);
        speed = baseSpin * rpmFactor * batteryScale;
      } else {
        // Thêm mức sàn 0.25 để luôn thấy cánh xoay
        const powerFactor = Math.max(0.25, motorPowers[i] / 50);
        speed = baseSpin * powerFactor * batteryScale;
      }
      const dir = isCW[i] ? 1 : -1;
      prop.rotation.y += speed * delta * dir;
    });
  });

  return (
    <group ref={groupRef}>
      {/* Centering the model mesh correctly */}
      <primitive object={clonedScene} scale={0.07} rotation={[0, Math.PI, 0]} position={[-0.05, 0, 0]} />

      {/* Center of Mass Indicator */}
      {lessonId === "weight" && (
        <mesh position={[state.weightOffset * 0.7, 0.1, 0]}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={2} />
          <Html center position={[0, 0.2, 0]}>
            <span className="text-[8px] font-black text-red-400 uppercase tracking-widest whitespace-nowrap px-2 py-0.5 bg-black/60 rounded border border-red-500/20 backdrop-blur-sm">Trọng tâm</span>
          </Html>
        </mesh>
      )}

      {/* Lift & Gravity - Using Real Physics Values */}
      <VectorArrow
        direction={[0, 1, 0]}
        length={state.liftForce * ARROW_SCALE}
        color="#22c55e"
        label="Lực Nâng"
        labelValue={`${state.liftForce.toFixed(1)} N`}
        visible={lessonId === "lift" || lessonId === "equilibrium" || lessonId === "battery"}
        position={SIDE_OFFSETS.center as any}
      />
      <VectorArrow
        direction={[0, -1, 0]}
        length={WEIGHT_FORCE_N * ARROW_SCALE}
        color="#ef4444"
        label="Trọng Lực"
        labelValue={`${WEIGHT_FORCE_N.toFixed(1)} N`}
        visible={lessonId === "lift" || lessonId === "equilibrium" || lessonId === "battery"}
        position={SIDE_OFFSETS.center as any}
      />

      {/* Wind */}
      {lessonId === "wind" && (
        <VectorArrow
          direction={[1, 0, 0]}
          length={state.windForce / 25}
          color="#38bdf8"
          label="Lực Gió"
          visible={state.windForce > 0}
          position={SIDE_OFFSETS.center as any}
        />
      )}

      {/* Roll - RPM-based with lift arrows on each side */}
      {lessonId === "roll" && (
        <>
          {/* Left Side Lift Arrow */}
          <VectorArrow
            direction={[0, 1, 0]}
            length={state.leftRPM / 3000}
            color="#22c55e"
            label="Lực Nâng Trái"
            labelValue={`${state.leftRPM.toFixed(0)} RPM`}
            visible={true}
            position={SIDE_OFFSETS.left as any}
          />
          {/* Right Side Lift Arrow */}
          <VectorArrow
            direction={[0, 1, 0]}
            length={state.rightRPM / 3000}
            color="#22c55e"
            label="Lực Nâng Phải"
            labelValue={`${state.rightRPM.toFixed(0)} RPM`}
            visible={true}
            position={SIDE_OFFSETS.right as any}
          />
          {/* Horizontal Movement Arrow - shows direction of sideways movement */}
          {Math.abs(state.velX) > 0.01 && (
            <VectorArrow
              direction={[state.velX > 0 ? 1 : -1, 0, 0]}
              length={Math.min(Math.abs(state.velX), 2)}
              color="#fbbf24"
              label="Di chuyển"
              labelValue={state.velX > 0 ? "→ Phải" : "← Trái"}
              visible={true}
              position={SIDE_OFFSETS.center as any}
            />
          )}
        </>
      )}

      {/* Pitch - RPM-based arrows */}
      {lessonId === "pitch" && (
        <>
          <VectorArrow
            direction={[0, 1, 0]}
            length={(state.frontRPM - 3000) / 2000}
            color="#3b82f6"
            label="Lực Trước"
            labelValue={`${Math.round(state.frontRPM)} RPM`}
            visible={true}
            position={SIDE_OFFSETS.front as any}
          />
          <VectorArrow
            direction={[0, 1, 0]}
            length={(state.rearRPM - 3000) / 2000}
            color="#8b5cf6"
            label="Lực Sau"
            labelValue={`${Math.round(state.rearRPM)} RPM`}
            visible={true}
            position={SIDE_OFFSETS.rear as any}
          />
          {/* Forward movement arrow */}
          {state.velZ > 0.01 && (
            <VectorArrow
              direction={[0, 0, 1]}
              length={Math.min(state.velZ, 2)}
              color="#fbbf24"
              label="Di chuyển"
              labelValue="→ Tiến"
              visible={true}
              position={SIDE_OFFSETS.center as any}
            />
          )}
        </>
      )}

      {/* Yaw Torque - CCW=Blue, CW=Orange (RPM-based) */}
      {lessonId === "yaw" && (
        <>
          <TorqueIndicator position={MOTOR_OFFSETS.FL} rpm={state.motorFL_RPM} color="#60a5fa" label="FL CCW" isCW={false} />
          <TorqueIndicator position={MOTOR_OFFSETS.FR} rpm={state.motorFR_RPM} color="#fb923c" label="FR CW" isCW={true} />
          <TorqueIndicator position={MOTOR_OFFSETS.RL} rpm={state.motorRL_RPM} color="#fb923c" label="RL CW" isCW={true} />
          <TorqueIndicator position={MOTOR_OFFSETS.RR} rpm={state.motorRR_RPM} color="#60a5fa" label="RR CCW" isCW={false} />
        </>
      )}
    </group>
  );
}

export function PhysicsBasicsViewer({ state, lessonId }: ViewerProps) {
  return (
    <div className="w-full h-full relative bg-[#020617] rounded-md overflow-hidden border border-white/5 shadow-2xl">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 2.5, 12]} fov={50} />
        
        {/* Camera follows drone vertically when in lift experiment */}
        <CameraTracker state={state} lessonId={lessonId} />

        <color attach="background" args={["#020617"]} />
        <Environment preset="city" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#38bdf8" />
        <spotLight position={[0, 10, 0]} angle={0.4} penumbra={1} intensity={2} castShadow />

        <group position={[0, -0.01, 0]}>
          <gridHelper args={[50, 50, "#1e293b", "#0f172a"]} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[50, 50]} />
            <shadowMaterial transparent opacity={0.5} />
          </mesh>
        </group>

        <Suspense fallback={null}>
          <WindParticles windForce={state.windForce} visible={lessonId === "wind"} />
          <DroneModel state={state} lessonId={lessonId} />
        </Suspense>

        <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={10} blur={2.5} far={4} color="#000000" />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/quadcopter.glb");
