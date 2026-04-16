"use client";

import { Edges } from "@react-three/drei";
import { memo } from "react";

type Props = {
  color?: string;
  size?: [number, number, number]; // Optional local scale if needed
};

/**
 * Standardized Box Model
 * Pivot: Bottom-Center (y=0)
 * Geometry: Unit cube (1x1x1)
 */
function BoxObstacle({ color, size = [1, 1, 1] }: Props) {
  const baseColor = color ?? "#051820";
  const edgeColor = color ? color : "#00d9ff";
  const emissiveColor = color ? color : "#00d9ff";

  return (
    <group>
      {/* Main Mesh */}
      <mesh scale={size} position={[0, size[1] / 2, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={0.8}
          metalness={0.6}
          roughness={0.08}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>
    </group>
  );
}

export default memo(BoxObstacle);


