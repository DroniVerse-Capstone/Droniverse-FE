"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

// ── Colour palette (one colour per checkpoint order, cycles) ─────────────────
const ORDER_COLORS = [
    "#00cfff", // 0 – cyan
    "#a855f7", // 1 – purple
    "#22c55e", // 2 – green
    "#f97316", // 3 – orange
    "#ec4899", // 4 – pink
    "#facc15", // 5 – yellow
    "#38bdf8", // 6 – sky
    "#fb923c", // 7 – amber
];

const COMPLETED_COLOR = "#22c55e";

interface CheckpointBeaconProps {
    radius?: number;
    order?: number;
    completed?: boolean;
    showText?: boolean;
}

export default function CheckpointBeacon({
    radius = 4,
    order = 0,
    completed = false,
    showText = true,
}: CheckpointBeaconProps) {
    const groupRef = useRef<THREE.Group>(null!);
    const baseRef = useRef<THREE.Group>(null!);
    const scanningRingsRef = useRef<THREE.Group>(null!);
    const labelRef = useRef<THREE.Group>(null!);

    const BEAM_HEIGHT = 12;
    const activeColor = ORDER_COLORS[order % ORDER_COLORS.length];
    const displayColor = completed ? COMPLETED_COLOR : activeColor;

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        if (baseRef.current) {
            baseRef.current.rotation.y = t * 0.8;
        }

        if (scanningRingsRef.current) {
            scanningRingsRef.current.children.forEach((child, i) => {
                if (!(child instanceof THREE.Mesh)) return;
                const ring = child;
                const offset = (i * 0.5) % 1;
                const progress = (t * 1.2 + offset) % 1;
                ring.position.y = progress * BEAM_HEIGHT;

                if (ring.material && ring.material instanceof THREE.MeshStandardMaterial) {
                    ring.material.opacity = Math.sin(progress * Math.PI) * 0.6;
                }
            });
        }

        if (labelRef.current) {
            labelRef.current.position.y = BEAM_HEIGHT + 1.5 + Math.sin(t * 2.5) * 0.4;
            // Force orientation to match camera exactly for "snappy" feel
            labelRef.current.quaternion.copy(state.camera.quaternion);
        }
    });

    return (
        <group ref={groupRef}>
            {/* ── GROUND FOOTPRINT (RADIUS INDICATOR) ───────────────────── */}
            <group ref={baseRef} position={[0, 0.05, 0]}>
                {/* Thin outer ring */}
                <mesh rotation-x={-Math.PI / 2}>
                    <ringGeometry args={[radius * 0.95, radius, 64]} />
                    <meshBasicMaterial color={displayColor} transparent opacity={0.4} />
                </mesh>
                {/* Thick inner glow ring */}
                <mesh rotation-x={-Math.PI / 2}>
                    <ringGeometry args={[radius * 0.15, radius * 0.18, 32]} />
                    <meshBasicMaterial color={displayColor} />
                </mesh>
                {/* Radial marker dots */}
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                    <mesh
                        key={deg}
                        position={[
                            Math.cos(THREE.MathUtils.degToRad(deg)) * radius * 0.8,
                            0.02,
                            Math.sin(THREE.MathUtils.degToRad(deg)) * radius * 0.8
                        ]}
                    >
                        <boxGeometry args={[0.2, 0.02, 0.6]} />
                        <meshBasicMaterial color={displayColor} transparent opacity={0.6} />
                    </mesh>
                ))}
            </group>

            {/* ── CORE POWER PILLAR ─────────────────────────────────────── */}
            <group position={[0, BEAM_HEIGHT / 2, 0]}>
                {/* Outer Holographic Sheath */}
                <mesh>
                    <cylinderGeometry args={[radius * 0.12, radius * 0.12, BEAM_HEIGHT, 32, 1, true]} />
                    <meshStandardMaterial
                        color={displayColor}
                        emissive={displayColor}
                        emissiveIntensity={0.2}
                        transparent
                        opacity={0.15}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>
                {/* Inner Bright Thread */}
                <mesh>
                    <cylinderGeometry args={[radius * 0.02, radius * 0.02, BEAM_HEIGHT, 8, 1, true]} />
                    <meshBasicMaterial color={displayColor} />
                </mesh>
                {/* Scanning Rings Moving Up */}
                <group ref={scanningRingsRef} position={[0, -BEAM_HEIGHT / 2, 0]}>
                    <mesh rotation-x={-Math.PI / 2}>
                        <ringGeometry args={[radius * 0.1, radius * 0.15, 32]} />
                        <meshStandardMaterial color={displayColor} emissive={displayColor} transparent opacity={0} depthWrite={false} />
                    </mesh>
                    <mesh rotation-x={-Math.PI / 2}>
                        <ringGeometry args={[radius * 0.1, radius * 0.15, 32]} />
                        <meshStandardMaterial color={displayColor} emissive={displayColor} transparent opacity={0} depthWrite={false} />
                    </mesh>
                </group>
            </group>

            {/* ── FLOATING HUD HEADER (NUMBER + FRAME) ──────────────────── */}
            {showText && (
                <group ref={labelRef} position={[0, BEAM_HEIGHT + 1.5, 0]}>
                    {/* Left Bracket */}
                    <group position={[-1.2, 0, 0]}>
                        <mesh position={[0, 0.6, 0]}>
                            <boxGeometry args={[0.4, 0.1, 0.05]} />
                            <meshBasicMaterial color={displayColor} />
                        </mesh>
                        <mesh position={[-0.2, 0, 0]}>
                            <boxGeometry args={[0.1, 1.2, 0.05]} />
                            <meshBasicMaterial color={displayColor} />
                        </mesh>
                        <mesh position={[0, -0.6, 0]}>
                            <boxGeometry args={[0.4, 0.1, 0.05]} />
                            <meshBasicMaterial color={displayColor} />
                        </mesh>
                    </group>
                    {/* Right Bracket */}
                    <group position={[1.2, 0, 0]}>
                        <mesh position={[0, 0.6, 0]}>
                            <boxGeometry args={[0.4, 0.1, 0.05]} />
                            <meshBasicMaterial color={displayColor} />
                        </mesh>
                        <mesh position={[0.2, 0, 0]}>
                            <boxGeometry args={[0.1, 1.2, 0.05]} />
                            <meshBasicMaterial color={displayColor} />
                        </mesh>
                        <mesh position={[0, -0.6, 0]}>
                            <boxGeometry args={[0.4, 0.1, 0.05]} />
                            <meshBasicMaterial color={displayColor} />
                        </mesh>
                    </group>

                    {/* The Number */}
                    <Text
                        fontSize={1.5}
                        color={displayColor}
                        anchorX="center"
                        anchorY="middle"
                        outlineColor="#000000"
                        outlineWidth={0.05}
                    >
                        {String(order + 1)}
                    </Text>

                    {/* Subtle backlight glow for number */}
                    <mesh position={[0, 0, -0.05]}>
                        <planeGeometry args={[2, 1.5]} />
                        <meshBasicMaterial color={displayColor} transparent opacity={0.15} />
                    </mesh>
                </group>
            )}

            {/* ── LIGHTING ──────────────────────────────────────────────── */}
            <pointLight
                position={[0, 2, 0]}
                color={displayColor}
                intensity={completed ? 5 : 8}
                distance={radius * 4}
                decay={2}
            />
            <pointLight
                position={[0, BEAM_HEIGHT, 0]}
                color={displayColor}
                intensity={3}
                distance={6}
                decay={1}
            />
        </group>
    );
}
