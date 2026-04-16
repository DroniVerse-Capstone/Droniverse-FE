"use client";

import { Edges } from "@react-three/drei";
import { memo } from "react";

type Props = {
  color?: string;
  size?: [number, number, number];
};

/**
 * Standardized Cylinder Model
 * Pivot: Bottom-Center (y=0)
 * Logic: Radius=0.5, Height=1 (Unit Cylinder) scaled by size
 */
function CylinderObstacle({ color, size = [1, 1, 1] }: Props) {
  const baseColor = color ?? "#051820";
  const edgeColor = color ? color : "#00d9ff";
  const emissiveColor = color ? color : "#00d9ff";

  // Using unit dimensions [radiusTop, radiusBottom, height, segments]
  // Then scaling by size results in the desired dimensions.
  const radius = 0.5;
  const height = 1;

  return (
    <group>
      <mesh scale={size} position={[0, size[1] / 2, 0]}>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={0.35}
          metalness={0.5}
          roughness={0.12}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>
    </group>
  );
}

export default memo(CylinderObstacle);


