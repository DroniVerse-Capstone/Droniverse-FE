"use client";

import { memo, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody, BallCollider, CuboidCollider, RigidBodyProps } from "@react-three/rapier";
import { useNormalizedScene } from "../utils/modelUtils";

interface RockGLBProps extends RigidBodyProps {
    /** Path to the GLB model, defaults to the project rock model */
    url?: string;
    /** Scale can be a single number or a 3D vector. 
     * Because the model is auto-normalized, 1.0 = ~1 unit size. */
    scale?: number | [number, number, number];
    /** Position in 3D space */
    position?: [number, number, number];
    /** Rotation in radians [x, y, z] */
    rotation?: [number, number, number];
    /** Collider type: 'ball' (default) or 'cuboid' */
    colliderType?: "ball" | "cuboid";
    /** Radius for ball collider or half-extents for cuboid collider. */
    colliderSize?: number | [number, number, number];
    /** Whether to enable Rapier physics. Defaults to true. */
    physics?: boolean;
    /** Optional Y-offset modifier for centering on ground. */
    groundOffset?: number;
    /** Vertical alignment: 'bottom' (on ground) or 'center' */
    anchor?: "bottom" | "center" | "top";
}

/**
 * RockGLB - A production-ready Rock component using a GLB model and Rapier physics.
 */
function RockGLB({
    url = "/models/rock.glb",
    scale = 2,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    colliderType = "ball",
    colliderSize,
    physics = true,
    groundOffset,
    anchor = "bottom",
    ...rigidBodyProps
}: RockGLBProps) {
    const normalizedScene = useNormalizedScene(url, { anchor });

    // Handle user scale prop
    const scaleVector = useMemo(() => {
        if (Array.isArray(scale)) return scale;
        return [scale, scale, scale] as [number, number, number];
    }, [scale]);

    // Determine collider dimensions based on scale
    const finalColliderSize = useMemo(() => {
        if (colliderSize !== undefined) return colliderSize;
        const avgScale = (scaleVector[0] + scaleVector[1] + scaleVector[2]) / 3;
        // Since the model is normalized to 1 unit, ~0.45 is a safe default radius
        return colliderType === "ball" ? avgScale * 0.45 : [avgScale * 0.45, avgScale * 0.45, avgScale * 0.45];
    }, [colliderSize, scaleVector, colliderType]);

    const visuals = (
        <group
            scale={scaleVector}
            position={physics ? [0, groundOffset || 0, 0] : [position[0], position[1] + (groundOffset || 0), position[2]]}
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
            {colliderType === "ball" ? (
                <BallCollider args={[finalColliderSize as number]} />
            ) : (
                <CuboidCollider args={finalColliderSize as [number, number, number]} />
            )}
        </RigidBody>
    );
}

useGLTF.preload("/models/rock.glb");

export default memo(RockGLB);
