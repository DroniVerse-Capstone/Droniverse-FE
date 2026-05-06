"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, useGLTF, Clone, Box, Cylinder } from "@react-three/drei";
import * as THREE from "three";
import { DroneState } from "@/app/programming/page";

type Drone3DProps = {
  droneState: DroneState;
  onUpdateAltitude?: (altitude: number) => void;
};

function MotorFeedback({ pos, pwr, color }: { pos: [number, number, number], pwr: number, color: string }) {
  const isSpinning = pwr > 0;
  const opacity = (pwr / 100) * 0.4;

  return (
    <group position={pos}>
      {isSpinning && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.7, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      <pointLight
        color={color}
        intensity={isSpinning ? (pwr / 15) : 0}
        distance={4}
        decay={2}
      />
    </group>
  );
}

// --- CAMERA FOLLOW HELPER ---
function DroneScene({ droneState, onUpdateAltitude }: { droneState: DroneState, onUpdateAltitude?: (alt: number) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const { scene } = useGLTF("/models/quadcopter.glb");

  const propsRef = useRef<{ [key: string]: THREE.Object3D }>({});
  const velocityY = useRef(0);

  const clonedScene = React.useMemo(() => {
    const clone = scene.clone(true);

    // Improved auto-centering logic
    const box = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    box.getCenter(center);

    clone.children.forEach(child => {
      child.position.x -= center.x;
      child.position.z -= center.z;
      child.position.y -= center.y;
    });

    const props: { [key: string]: THREE.Object3D } = {};
    clone.traverse((child) => {
      const name = child.name.toLowerCase();
      if (name.includes("polysurface40")) props.m1 = child;
      if (name.includes("polysurface45")) props.m2 = child;
      if (name.includes("polysurface47")) props.m3 = child;
      if (name.includes("polysurface36")) props.m4 = child;
    });
    propsRef.current = props;
    return clone;
  }, [scene]);

  React.useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(0, 0.1, 0);
      groupRef.current.rotation.set(0, 0, 0);
      groupRef.current.rotation.order = 'YXZ';
      velocityY.current = 0;
    }
  }, [droneState.resetFlag]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const targetPitch = (droneState.pitch * Math.PI) / 180;
    const targetRoll = (droneState.roll * Math.PI) / 180;
    const yawVelocity = -(droneState.yaw / 100) * (Math.PI / 2);

    groupRef.current.rotation.x += (targetPitch - groupRef.current.rotation.x) * 0.15;
    groupRef.current.rotation.z += (targetRoll - groupRef.current.rotation.z) * 0.15;
    groupRef.current.rotation.y += yawVelocity * delta;

    // Movement
    if (Math.abs(droneState.pitch) > 0 || Math.abs(droneState.roll) > 0) {
      const currentYaw = groupRef.current.rotation.y;
      if (Math.abs(droneState.pitch) > 0) {
        const moveDir = new THREE.Vector3(Math.sin(currentYaw), 0, Math.cos(currentYaw));
        groupRef.current.position.add(moveDir.multiplyScalar(droneState.pitch * 0.45 * delta));
      }
      if (Math.abs(droneState.roll) > 0) {
        const moveDir = new THREE.Vector3(Math.sin(currentYaw - Math.PI / 2), 0, Math.cos(currentYaw - Math.PI / 2));
        groupRef.current.position.add(moveDir.multiplyScalar(droneState.roll * 0.45 * delta));
      }
    }

    // Vertical
    const lift = droneState.throttle - 55;
    if (droneState.throttle === 0 && groupRef.current.position.y <= 0.15) {
      velocityY.current = 0;
    } else if (droneState.throttle === 0) {
      velocityY.current -= 0.005;
    } else {
      velocityY.current += lift * 0.002;
      velocityY.current *= 0.85;
    }
    groupRef.current.position.y += velocityY.current;
    groupRef.current.position.y = Math.max(0.1, Math.min(100, groupRef.current.position.y));

    // Update Camera Target (Follow Drone)
    state.camera.lookAt(groupRef.current.position);

    // Update Shadow Rings (On Ground)
    if (ringRef.current && ringRef2.current) {
      ringRef.current.position.x = groupRef.current.position.x;
      ringRef.current.position.z = groupRef.current.position.z;
      ringRef2.current.position.x = groupRef.current.position.x;
      ringRef2.current.position.z = groupRef.current.position.z;

      const opacity = Math.max(0, 0.4 - groupRef.current.position.y * 0.05);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
      (ringRef2.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.3;
    }

    if (onUpdateAltitude) {
      onUpdateAltitude(groupRef.current.position.y);
    }

    // Propellers
    Object.entries(propsRef.current).forEach(([key, prop]) => {
      const pwr = (droneState.motors as any)[key] || 0;
      const speed = (pwr / 100) * 80;
      const dir = (key === 'm1' || key === 'm4') ? 1 : -1;
      prop.rotation.y += speed * delta * dir;
    });
  });

  return (
    <>
      <mesh ref={ringRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.7, 64]} />
        <meshBasicMaterial color="#ff007f" transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh ref={ringRef2} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 3.5, 64]} />
        <meshBasicMaterial color="#ff007f" transparent opacity={0.15} depthWrite={false} />
      </mesh>

      <group ref={groupRef}>
        <primitive object={clonedScene} scale={0.4} castShadow />
        <group scale={0.4} position={[0, 0, 0]}>
          <MotorFeedback pos={[-3.1, 1.2, 2.1]} pwr={droneState.motors.m1} color="#00f2ff" />
          <MotorFeedback pos={[3.1, 1.2, 2.1]} pwr={droneState.motors.m2} color="#00f2ff" />
          <MotorFeedback pos={[-3.1, 1.2, -2.1]} pwr={droneState.motors.m3} color="#00f2ff" />
          <MotorFeedback pos={[3.1, 1.2, -2.1]} pwr={droneState.motors.m4} color="#00f2ff" />
        </group>
      </group>
    </>
  );
}

export default function Drone3D({ droneState, onUpdateAltitude }: Drone3DProps) {
  return (
    <div className="w-full h-full relative bg-[#0a0a1a]">
      {/* Dynamic Cyber Gradient Background */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{
        background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, rgba(10, 10, 26, 0.4) 100%)'
      }} />

      <Canvas shadows camera={{ position: [0, 10, -18], fov: 45 }}>
        <fog attach="fog" args={["#0a0a1a", 150, 600]} />

        {/* Neon Ambient & Accent Lighting */}
        <ambientLight intensity={1.4} color="#8b5cf6" />
        <directionalLight
          position={[60, 100, 60]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        {/* Powerful Neon Accents */}
        <pointLight position={[30, 20, 30]} intensity={3} color="#00f2ff" distance={120} />
        <pointLight position={[-30, 20, -30]} intensity={3} color="#ff007f" distance={120} />
        <hemisphereLight intensity={0.7} color="#00f2ff" groundColor="#ff007f" />

        <Environment preset="city" />

        {/* Cyber Floor: Deep Violet */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[2000, 2000]} />
          <meshStandardMaterial
            color="#130f24"
            roughness={0.4}
            metalness={0.5}
          />
        </mesh>

        {/* Vibrant Neon Grid - Scaled Up */}
        <Grid
          infiniteGrid
          fadeDistance={200}
          sectionColor="#00f2ff"
          sectionThickness={2}
          cellColor="#0066cc"
          cellThickness={1}
          cellSize={4}
          sectionSize={20}
          position={[0, 0, 0]}
        />

        {/* Mega Neon Landing Zone: Hot Pink */}
        <group position={[0, 0.05, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[11.5, 12.0, 64]} />
            <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={10} depthWrite={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.2, 32]} />
            <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={20} depthWrite={false} />
          </mesh>
          {/* Broad Pink Ground Glow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0, 15, 64]} />
            <meshBasicMaterial color="#ff007f" transparent opacity={0.15} depthWrite={false} />
          </mesh>
        </group>

        {/* Integrated Scene & Quadcopter */}
        <DroneScene droneState={droneState} onUpdateAltitude={onUpdateAltitude} />

        <OrbitControls
          makeDefault
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={150}
        />
      </Canvas>
    </div>
  );
}
