"use client";

import { Edges } from "@react-three/drei";

const COLOR = "#ff2d55";
const EMISSIVE = "#ff0044";
const EDGE_COLOR = "#ff2d55";

export default function HeartBonus() {
    const R = 2.0;

    return (
        <group>
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[R, 24, 18]} />
                <meshStandardMaterial
                    color="#200008"
                    emissive={EMISSIVE}
                    emissiveIntensity={0.85}
                    metalness={0.4}
                    roughness={0.15}
                />
                <Edges threshold={30} color={EDGE_COLOR} />
            </mesh>

            <mesh scale={[1.10, 1.10, 1.10]}>
                <sphereGeometry args={[R, 24, 18]} />
                <meshBasicMaterial
                    color={COLOR}
                    transparent
                    opacity={0.18}
                    toneMapped={false}
                    depthWrite={false}
                />
            </mesh>

            <mesh>
                <sphereGeometry args={[R * 0.42, 14, 10]} />
                <meshBasicMaterial color={EMISSIVE} transparent opacity={0.75} toneMapped={false} />
            </mesh>
        </group>
    );
}
