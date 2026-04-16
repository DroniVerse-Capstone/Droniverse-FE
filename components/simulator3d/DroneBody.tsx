"use client";

import { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  DRONE_COLORS,
  DRONE_SIZES,
  DRONE_MODEL_CONFIG,
  DRONE_ROTOR_CONFIG,
} from "@/lib/models3d/droneConfig";

type Props = {
  state: {
    position: [number, number, number];
    headingRad: number;
    isFlying: boolean;
  };
  colorConfig?: {
    fuselage?: string;
    fuselageEmissive?: string;
    nose?: string;
    noseEmissive?: string;
    canopy?: string;
    wings?: string;
    rotor?: string;
    rotorEmissive?: string;
  };
};

const DRONE_GROUND_CLEARANCE = 0.5; 

type RotorProps = {
  position: [number, number, number];
  isFlying: boolean;
  colorConfig?: {
    rotor?: string;
    rotorEmissive?: string;
  };
};

function Rotor({ position, isFlying, colorConfig }: RotorProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const spinVelocity = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetSpinSpeed = isFlying
      ? DRONE_ROTOR_CONFIG.SPIN_SPEED_FLYING
      : DRONE_ROTOR_CONFIG.SPIN_SPEED_IDLE;
    
    // Smoothly interpolate current spin speed towards target
    spinVelocity.current += (targetSpinSpeed - spinVelocity.current) * delta * 2;
    
    if (spinVelocity.current <= 0.01) return;
    groupRef.current.rotation.y += spinVelocity.current * delta;
  });

  // Strobe effect multiplier for emissive intensity when engines are on
  const isStrobing = isFlying && (Date.now() % 300 < 150);

  return (
    <group ref={groupRef} position={position}>
      {/* Code vòng tròn lớn của cánh quạt - Sử dụng BasicMaterial để tự phát sáng tối đa */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.08, 16, 48]} />
        {isFlying ? (
          <meshBasicMaterial color={isStrobing ? "#22d3ee" : "#0891b2"} />
        ) : (
          <meshStandardMaterial
            color={colorConfig?.rotor ?? DRONE_COLORS.ROTOR.color}
            roughness={0.3}
            metalness={0.7}
          />
        )}
      </mesh>
      {/*  Này code cái cục tròn ở tâm cánh quạt */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.12, 24]} />
        <meshStandardMaterial
          color={colorConfig?.rotor ?? DRONE_COLORS.ROTOR.color}
          emissive={colorConfig?.rotorEmissive ?? DRONE_COLORS.ROTOR.emissive}
          emissiveIntensity={isFlying ? 1.2 : 0.35}
          roughness={DRONE_COLORS.ROTOR.roughness}
          metalness={0.8}
        />
      </mesh>

      {/* Code 6 cái cánh quạt ở bên trong hình tròn */}
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, id) => (
        <mesh key={id} rotation={[0, angle, 0]}>
          <boxGeometry args={[1.4, 0.06, 0.18]} />
          <meshStandardMaterial
            color={colorConfig?.rotor ?? DRONE_COLORS.ROTOR.color}
            emissive={colorConfig?.rotorEmissive ?? DRONE_COLORS.ROTOR.emissive}
            emissiveIntensity={isFlying ? 1.5 : 0.3}
            roughness={0.22}
            metalness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

function DroneBody({ state, colorConfig }: Props) {
  const customModel =
    DRONE_MODEL_CONFIG.useCustomModel && DRONE_MODEL_CONFIG.modelPath
      ? useGLTF(DRONE_MODEL_CONFIG.modelPath)
      : null;

      
  if (customModel) {
    console.log("cc",customModel);
    return (
      <group
        position={state.position}
        rotation={[0, state.headingRad, 0]}
        scale={DRONE_MODEL_CONFIG.scale}
      >
        <primitive
          object={customModel.scene}
          position={DRONE_MODEL_CONFIG.position}
          rotation={DRONE_MODEL_CONFIG.rotation}
        />
      </group>
    );
  }

  return (
    <group
      position={[
        state.position[0],
        state.position[1] + DRONE_GROUND_CLEARANCE,
        state.position[2],
      ]}
      rotation={[0, state.headingRad, 0]}
      scale={1.3} // Visually big but physically accurate position
    >
      <mesh castShadow>
        <boxGeometry args={DRONE_SIZES.FUSELAGE} />
        <meshStandardMaterial
          color={colorConfig?.fuselage ?? DRONE_COLORS.FUSELAGE.color}
          emissive={
            colorConfig?.fuselageEmissive ?? DRONE_COLORS.FUSELAGE.emissive
          }
          metalness={DRONE_COLORS.FUSELAGE.metalness}
          roughness={DRONE_COLORS.FUSELAGE.roughness}
        />
      </mesh>

      {/* Drone Status LED (Mounted on the rear tail for visibility) */}
      <group position={[0, 0.45, -0.7]}>
        {/* Core LED */}
        <mesh>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial color={state.isFlying ? "#10b981" : "#ef4444"} />
        </mesh>
        
        {/* Glowing Aura for High Visibility */}
        <mesh scale={2.5}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial 
            color={state.isFlying ? "#34d399" : "#f87171"} 
            transparent 
            opacity={0.3} 
            depthWrite={false}
          />
        </mesh>

        <pointLight 
          color={state.isFlying ? "#10b981" : "#ef4444"} 
          intensity={state.isFlying ? 15 : 5} 
          distance={10} 
        />
      </group>

      <mesh
        position={DRONE_SIZES.NOSE_POSITION}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <coneGeometry args={DRONE_SIZES.NOSE} />
        <meshStandardMaterial
          color={colorConfig?.nose ?? DRONE_COLORS.NOSE.color}
          emissive={colorConfig?.noseEmissive ?? DRONE_COLORS.NOSE.emissive}
          roughness={DRONE_COLORS.NOSE.roughness}
          metalness={DRONE_COLORS.NOSE.metalness}
        />
      </mesh>

      <mesh position={DRONE_SIZES.CANOPY_POSITION}>
        <sphereGeometry args={DRONE_SIZES.CANOPY} />
        <meshPhysicalMaterial
          transparent={DRONE_COLORS.CANOPY.transparent}
          opacity={DRONE_COLORS.CANOPY.opacity}
          roughness={DRONE_COLORS.CANOPY.roughness}
          metalness={DRONE_COLORS.CANOPY.metalness}
          color={colorConfig?.canopy ?? DRONE_COLORS.CANOPY.color}
        />
      </mesh>

      <mesh position={DRONE_SIZES.WINGS_POSITION}>
        <boxGeometry args={DRONE_SIZES.WINGS} />
        <meshStandardMaterial
          color={colorConfig?.wings ?? DRONE_COLORS.WINGS.color}
          metalness={DRONE_COLORS.WINGS.metalness}
          roughness={DRONE_COLORS.WINGS.roughness}
        />
      </mesh>

      <mesh
        position={DRONE_SIZES.STABILIZER_POSITION}
        rotation={DRONE_SIZES.STABILIZER_ROTATION}
      >
        <boxGeometry args={DRONE_SIZES.STABILIZER} />
        <meshStandardMaterial
          color={colorConfig?.wings ?? DRONE_COLORS.WINGS.color}
        />
      </mesh>

      {DRONE_SIZES.ROTOR_POSITIONS.map((item, id) => (
        <Rotor
          key={id}
          position={item}
          isFlying={state.isFlying}
          colorConfig={{
            rotor: colorConfig?.rotor,
            rotorEmissive: colorConfig?.rotorEmissive,
          }}
        />
      ))}
    </group>
  );
}

export default memo(DroneBody);
