import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MotorValues } from "./physics";

interface ForceVectorsProps {
  motors: MotorValues;
  visible: boolean;
  motorPositions: Record<string, { pos: [number, number, number] }>;
}

export function ThrustVector({ position, value, color }: { position: [number, number, number], value: number, color: string }) {
  const arrowRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (arrowRef.current) {
      // Scale length based on motor power (0-100%)
      const length = (value / 100) * 1.5;
      arrowRef.current.scale.y = Math.max(0.001, length);
      arrowRef.current.visible = value > 1;
    }
  });

  return (
    <group position={position} ref={arrowRef}>
      {/* Shaft */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} depthTest={false} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.05, 0]}>
        <coneGeometry args={[0.06, 0.15, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} depthTest={false} />
      </mesh>
    </group>
  );
}

export function GravityVector() {
  return (
    <group position={[0, 0, 0]}>
      {/* Gravity always points down from center */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.6} depthTest={false} />
      </mesh>
      <mesh position={[0, -0.85, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.07, 0.2, 8]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.8} depthTest={false} />
      </mesh>
      {/* Label/Center point */}
      <mesh>
        <sphereGeometry args={[0.04]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

export function ForceVectors({ motors, visible, motorPositions }: ForceVectorsProps) {
  if (!visible) return null;

  return (
    <group>
      <ThrustVector position={motorPositions.m1.pos} value={motors.m1} color="#10b981" />
      <ThrustVector position={motorPositions.m2.pos} value={motors.m2} color="#f59e0b" />
      <ThrustVector position={motorPositions.m3.pos} value={motors.m3} color="#f59e0b" />
      <ThrustVector position={motorPositions.m4.pos} value={motors.m4} color="#10b981" />
      <GravityVector />
    </group>
  );
}
