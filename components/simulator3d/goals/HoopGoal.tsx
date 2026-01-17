 "use client";

import { Edges } from "@react-three/drei";

type Props = {
  radius?: number;
};

export default function HoopGoal({ radius }: Props) {
  return (
    <group>
      <group position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <torusGeometry args={[radius ?? 1, Math.max(0.5, (radius ?? 1) * 0.08), 32, 256]} />
          <meshStandardMaterial
            color={"#00d9ff"}
            emissive={"#00d9ff"}
            emissiveIntensity={0.7}
            metalness={0.25}
            roughness={0.08}
            transparent
            opacity={0.96}
          />
          <Edges threshold={15} color={"#00d9ff"} />
        </mesh>
        <mesh scale={[1.02, 1.02, 1.02]}>
          <torusGeometry args={[radius ?? 1, Math.max(0.5, (radius ?? 1) * 0.09), 32, 256]} />
          <meshBasicMaterial color={"#00d9ff"} transparent opacity={0.08} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}


