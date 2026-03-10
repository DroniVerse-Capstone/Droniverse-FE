"use client";

import { Edges } from "@react-three/drei";

const COLOR = "#ffe234";
const EMISSIVE = "#ffcc00";
const EDGE_COLOR = "#ffe234";

/**
 * StarBonus – a large icosahedron star following the BoxObstacle visual pattern.
 * Animation (rotation, float, pulse) is handled by the parent BonusItem wrapper.
 */
export default function StarBonus() {
    const R = 2.2; // match box visual footprint

    return (
        <group>
            {/* ── Main star body ────────────────────────────────────────────── */}
            <mesh castShadow receiveShadow>
                <icosahedronGeometry args={[R, 0]} />
                <meshStandardMaterial
                    color="#1a1200"
                    emissive={EMISSIVE}
                    emissiveIntensity={0.9}
                    metalness={0.8}
                    roughness={0.05}
                />
                <Edges threshold={5} color={EDGE_COLOR} />
            </mesh>

            {/* ── Outer glow shell */}
            <mesh scale={[1.10, 1.10, 1.10]}>
                <icosahedronGeometry args={[R, 0]} />
                <meshBasicMaterial
                    color={COLOR}
                    transparent
                    opacity={0.18}
                    toneMapped={false}
                    depthWrite={false}
                />
            </mesh>

            {/* ── Inner bright core */}
            <mesh>
                <icosahedronGeometry args={[R * 0.42, 0]} />
                <meshBasicMaterial color={EMISSIVE} transparent opacity={0.75} toneMapped={false} />
            </mesh>
        </group>
    );
}
