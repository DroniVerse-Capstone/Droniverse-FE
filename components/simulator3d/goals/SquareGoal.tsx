 "use client";

import { Edges } from "@react-three/drei";
import { useRef } from "react";

type Props = {
  size?: [number, number];
};

export default function SquareGoal({ size }: Props) {
  const padRef = useRef<any>(null);
  const rimRef = useRef<any>(null);
  const width = size?.[0] ?? 1;
  const depth = size?.[1] ?? 1;
  const height = 0.18;
  const sink = 0.01;
  const padY = height / 2 - sink;

  return (
    <group>
      <mesh ref={padRef} position={[0, padY, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={"#00d9ff"}
          emissive={"#00d9ff"}
          emissiveIntensity={0.35}
          roughness={0.18}
          metalness={0.35}
        />
        <Edges threshold={15} color={"#00d9ff"} />
      </mesh>

      <group ref={rimRef} rotation={[0, 0, 0]}>
        <mesh position={[0, height + 0.01 - sink, 0]}>
          <boxGeometry args={[width + 0.6, 0.02, depth + 0.6]} />
          <meshBasicMaterial color={"#00e6ff"} transparent opacity={0.22} toneMapped={false} />
        </mesh>
        <mesh position={[0, height + 0.03 - sink, 0]}>
          <boxGeometry args={[width + 0.12, 0.02, depth + 0.12]} />
          <meshBasicMaterial color={"#6ff7ff"} transparent opacity={0.12} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}


