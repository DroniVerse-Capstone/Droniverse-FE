"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * Interface for model normalization options.
 */
export interface NormalizeOptions {
    /** Target size in world units (default: 1) */
    targetSize?: number;
    /** Vertical alignment: 'bottom' (on ground), 'center', or 'top' */
    anchor?: "bottom" | "center" | "top";
    /** Whether to recompute vertex normals for smooth shading */
    fixNormals?: boolean;
    /** Whether to enable shadow casting/receiving */
    enableShadows?: boolean;
    /** Multiply all material roughness/metalness for consistent look */
    materialScale?: { roughness?: number; metalness?: number };
}

// Global cache for "Master" optimized models to prevent redundant processing (Shadows, Normals, Traversal)
const optimizedModelCache: Record<string, THREE.Group> = {};

/**
 * Internal utility to process and optimize the source scene.
 * This should ONLY be called once per unique model & options.
 */
function processModel(
    scene: THREE.Group | THREE.Object3D,
    options: NormalizeOptions
): THREE.Group {
    const {
        targetSize = 1,
        anchor = "bottom",
        fixNormals = true,
        enableShadows = true,
        materialScale = { roughness: 1, metalness: 1 }
    } = options;

    // 1. Calculate bounding box once
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // 2. Determine scale factor
    const maxDim = Math.max(size.x, size.y, size.z);
    const normScale = maxDim > 0 ? targetSize / maxDim : 1;

    // 3. Process the entire source scene graph ONCE
    scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;

            if (enableShadows) {
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                // Optimization: Don't cast shadows for very tiny meshes to save draw calls
                if (mesh.geometry.boundingSphere) {
                    if (mesh.geometry.boundingSphere.radius < 0.05) {
                        mesh.castShadow = false;
                    }
                }
            }

            if (fixNormals && mesh.geometry) {
                mesh.geometry.computeVertexNormals();
            }

            if (mesh.material) {
                const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                materials.forEach((mat: any) => {
                    if (mat.roughness !== undefined) mat.roughness *= (materialScale.roughness || 1);
                    if (mat.metalness !== undefined) mat.metalness *= (materialScale.metalness || 1);
                });
            }
        }
    });

    // 4. Wrap and position
    const masterGroup = new THREE.Group();
    masterGroup.name = "MasterNormalizedModel";

    // Create a sub-group that holds the actual scene at normalized scale and position
    const layoutGroup = new THREE.Group();
    layoutGroup.add(scene);

    let yOffset = 0;
    if (anchor === "bottom") {
        yOffset = -box.min.y;
    } else if (anchor === "center") {
        yOffset = -center.y;
    } else if (anchor === "top") {
        yOffset = -box.max.y;
    }

    layoutGroup.position.set(-center.x * normScale, yOffset * normScale, -center.z * normScale);
    layoutGroup.scale.setScalar(normScale);
    masterGroup.add(layoutGroup);

    return masterGroup;
}

/**
 * Senior Hook: Optimized for high performance.
 * Uses a global cache and efficient cloning to support hundreds of instances.
 */
export function useNormalizedScene(url: string, options: NormalizeOptions = {}) {
    const { scene } = useGLTF(url);
    const optionsKey = JSON.stringify(options);
    const cacheId = `${url}_${optionsKey}`;

    return useMemo(() => {
        // 1. Check if we already have an optimized "Master" for this model/config
        if (!optimizedModelCache[cacheId]) {
            // We clone the first time to avoid polluting other caches if the same GLTF is used with different options
            const initialClone = scene.clone();
            optimizedModelCache[cacheId] = processModel(initialClone, options);
        }

        // 2. Return a lightweight clone of the Master
        // THREE.Object3D.clone() is efficient for instances as it shares Geometries and Materials
        return optimizedModelCache[cacheId].clone();
    }, [scene, cacheId]);
}

