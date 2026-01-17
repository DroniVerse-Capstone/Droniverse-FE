 "use client";

import { Edges } from "@react-three/drei";
type Props = {
  ob: {
    id: string;
    position: [number, number, number];
    size: [number, number, number];
    color?: string;
    rotation?: [number, number, number];
  };
};

export default function CylinderObstacle({ ob }: Props) {
  const pos = ob.position;
  const size = ob.size || [50, 50, 50];
  const rot = ob.rotation || [0, 0, 0];
  const baseColor = ob.color ?? "#051820";
  const edgeColor = ob.color ? ob.color : "#00d9ff";
  const emissiveColor = ob.color ? ob.color : "#00d9ff";

  const groupYBase = pos[1] + size[1] / 2;
  const rotationRad: [number, number, number] = [
    (rot[0] * Math.PI) / 180,
    (rot[1] * Math.PI) / 180,
    (rot[2] * Math.PI) / 180,
  ];
  const radius = Math.max(0.001, size[0] / 2);
  const height = Math.max(0.001, size[1]);

  return (
    <group key={ob.id} position={[pos[0], groupYBase, pos[2]]} rotation={rotationRad}>
      <mesh>
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


