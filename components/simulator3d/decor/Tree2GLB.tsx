"use client";

import { memo, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody, CylinderCollider, RigidBodyProps } from "@react-three/rapier";
import { useNormalizedScene } from "../utils/modelUtils";

interface Tree2GLBProps extends RigidBodyProps {
    /** Path to the GLB model */
    url?: string;
    /** Scale can be a single number or a 3D vector */
    scale?: number | [number, number, number];
    /** Position in 3D space */
    position?: [number, number, number];
    /** Rotation in radians [x, y, z] */
    rotation?: [number, number, number];
    /** Whether to enable Rapier physics. Defaults to true. */
    physics?: boolean;
    /** Optional Y-offset modifier */
    groundOffset?: number;
    /** Vertical alignment: 'bottom' (on ground) or 'center' */
    anchor?: "bottom" | "center" | "top";
}

/**
 * Tree2GLB - A decorative tree component using a GLB model with cylinder physics for the trunk.
 */
function Tree2GLB({
    url = "/models/tree2.glb",
    scale = 1,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    physics = true,
    groundOffset = 0,
    anchor = "bottom",
    ...rigidBodyProps
}: Tree2GLBProps) {
    const normalizedScene = useNormalizedScene(url, {
        targetSize: 2,
        anchor,
        fixNormals: true,
        enableShadows: true,
        materialScale: { roughness: 1, metalness: 1 }
    });

    const scaleVector = useMemo(() => {
        if (Array.isArray(scale)) return scale;
        return [scale, scale, scale] as [number, number, number];
    }, [scale]);

    const avgScale = (scaleVector[0] + scaleVector[1] + scaleVector[2]) / 3;

    const visuals = (
        <group
            scale={scaleVector}
            position={physics ? [0, groundOffset, 0] : [position[0], position[1] + groundOffset, position[2]]}
            rotation={physics ? [0, 0, 0] : rotation}
        >
            <primitive object={normalizedScene} />
        </group>
    );

    if (!physics) return visuals;

    return (
        <RigidBody
            type="fixed"
            colliders={false}
            position={position}
            rotation={rotation}
            {...rigidBodyProps}
        >
            {visuals}
            {/* Trunk collider approximation */}
            <CylinderCollider args={[0.4 * avgScale, 0.15 * avgScale]} position={[0, 0.4 * avgScale, 0]} />
        </RigidBody>
    );
}

useGLTF.preload("/models/tree2.glb");

export default memo(Tree2GLB);
