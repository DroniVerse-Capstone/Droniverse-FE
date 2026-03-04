"use client";

import { Edges } from "@react-three/drei";

const COLOR = "#00eeff";
const EMISSIVE = "#00ccff";
const EDGE_COLOR = "#00eeff";

/**
 * DiamondBonus – a large dual-octahedron gem following the BoxObstacle visual pattern.
 * Animation (rotation, float, pulse) is handled by the parent BonusItem wrapper.
 */
export default function DiamondBonus() {
    const R = 2.2; // match box visual footprint (~4 units diameter)

    return (
        <group>
            {/* ── Main gem body ─────────────────────────────────────────────── */}
            <mesh castShadow receiveShadow>
                <octahedronGeometry args={[R, 0]} />
                <meshStandardMaterial
                    color="#051820"
                    emissive={EMISSIVE}
                    emissiveIntensity={0.9}
                    metalness={0.85}
                    roughness={0.05}
                />
                <Edges threshold={5} color={EDGE_COLOR} />
            </mesh>

            {/* ── Outer glow shell (BoxObstacle pattern: scale 1.07, low opacity) */}
            <mesh scale={[1.10, 1.10, 1.10]}>
                <octahedronGeometry args={[R, 0]} />
                <meshBasicMaterial
                    color={COLOR}
                    transparent
                    opacity={0.18}
                    toneMapped={false}
                    depthWrite={false}
                />
            </mesh>

            {/* ── Inner bright core ─────────────────────────────────────────── */}
            <mesh>
                <octahedronGeometry args={[R * 0.42, 0]} />
                <meshBasicMaterial color={EMISSIVE} transparent opacity={0.75} toneMapped={false} />
            </mesh>
        </group>
    );
}
