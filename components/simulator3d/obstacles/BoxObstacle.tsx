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

export default function BoxObstacle({ ob }: Props) {
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

  return (
    <group key={ob.id} position={[pos[0], groupYBase, pos[2]]} rotation={rotationRad}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={0.45}
          metalness={0.6}
          roughness={0.08}
        />
        <Edges threshold={15} color={edgeColor} />
      </mesh>

      <mesh scale={[1.07, 1.07, 1.07]}>
        <boxGeometry args={size} />
        <meshBasicMaterial color={edgeColor} transparent opacity={0.10} toneMapped={false} />
      </mesh>
    </group>
  );
}


