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
      const length = (value / 100) * 0.8;
      arrowRef.current.scale.y = Math.max(0.001, length);
      arrowRef.current.visible = value > 2;
    }
  });

  return (
    <group position={position} ref={arrowRef}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.7, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} depthTest={false} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <coneGeometry args={[0.03, 0.1, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} depthTest={false} />
      </mesh>
    </group>
  );
}

export function GravityVector() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.5, 8]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.5} depthTest={false} />
      </mesh>
      <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.04, 0.12, 8]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.7} depthTest={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.03]} />
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
