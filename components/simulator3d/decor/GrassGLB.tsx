"use client";

import { memo, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody, RigidBodyProps } from "@react-three/rapier";
import { useNormalizedScene } from "../utils/modelUtils";

interface GrassGLBProps extends RigidBodyProps {
    /** Path to the GLB model */
    url?: string;
    /** Scale can be a single number or a 3D vector */
    scale?: number | [number, number, number];
    /** Position in 3D space */
    position?: [number, number, number];
    /** Rotation in radians [x, y, z] */
    rotation?: [number, number, number];
    /** Whether to enable Rapier physics. Defaults to false for grass. */
    physics?: boolean;
    /** Optional Y-offset modifier */
    groundOffset?: number;
    /** Vertical alignment: 'bottom' (on ground) or 'center' */
    anchor?: "bottom" | "center" | "top";
}

/**
 * GrassGLB - A decorative grass component using a GLB model.
 */
function GrassGLB({
    url = "/models/grass.glb",
    scale = 20,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    physics = false,
    groundOffset = 0,
    anchor = "bottom",
    ...rigidBodyProps
}: GrassGLBProps) {
    const normalizedScene = useNormalizedScene(url, { anchor });

    const scaleVector = useMemo(() => {
        if (Array.isArray(scale)) return scale;
        return [scale, scale, scale] as [number, number, number];
    }, [scale]);

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
            colliders="hull"
            position={position}
            rotation={rotation}
            {...rigidBodyProps}
        >
            {visuals}
        </RigidBody>
    );
}

useGLTF.preload("/models/grass.glb");

export default memo(GrassGLB);
