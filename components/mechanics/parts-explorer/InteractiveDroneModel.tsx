"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DronePartId } from "./data";
import { useGLTF } from "@react-three/drei";

interface Props {
  selectedPart: DronePartId | null;
}

export function InteractiveDroneModel({ selectedPart }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  // Load the user's quadcopter model
  const { scene } = useGLTF("/models/quadcopter.glb");

  // Clone scene and materials once to allow independent highlighting
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(m => m.clone());
        } else if (mesh.material) {
          mesh.material = (mesh.material as THREE.Material).clone();
        }
      }
    });
    return clone;
  }, [scene]);

  // Apply highlights based on node names
  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const name = mesh.name.toLowerCase();
          let isHighlighted = false;

          switch (selectedPart) {
            case 'camera':
              isHighlighted = ['polysurface38', 'polysurface42', 'polysurface43', 'polysurface44', 'pcylinder36'].some(p => name.includes(p)) ||
                ((name.includes('camera') || name.includes('lens') || name.includes('glass')) && !name.includes('camera_plate'));
              break;
            case 'battery':
              isHighlighted = name.includes('battery') || name.includes('lipo') || name.includes('latch');
              break;
            case 'motor':
              isHighlighted = name.includes('motor') || name.includes('coil') || name.includes('stator');
              break;
            case 'frame':
              isHighlighted = name.includes('body') || name.includes('frame') || name.includes('leg');
              break;
            case 'propeller':
              // Cánh quạt thực chất là các polySurface có độ dài lớn (36, 40, 45, 47)
              isHighlighted = ['polysurface36', 'polysurface40', 'polysurface45', 'polysurface47'].some(p => name.includes(p));
              break;
            case 'flight_controller':
              // Cụm mạch cân bằng (FC Stack) bị đặt tên nhầm thành camera_plate trong file gốc
              isHighlighted = name.includes('camera_plate') || name.includes('fc') || name.includes('board');
              break;
          }

          const applyHighlight = (m: THREE.MeshStandardMaterial) => {
            if (selectedPart === null) {
              m.emissive = new THREE.Color("#000000");
              m.emissiveIntensity = 0;
              m.opacity = 1;
              m.transparent = false;
            } else if (isHighlighted) {
              m.emissive = new THREE.Color("#db4139");
              m.emissiveIntensity = 2; // Strong glow
              m.opacity = 1;
              m.transparent = false;
            } else {
              m.emissive = new THREE.Color("#000000");
              m.emissiveIntensity = 0;
              m.opacity = 0.15; // Dim out non-selected parts
              m.transparent = true;
            }
          };

          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => applyHighlight(mat as THREE.MeshStandardMaterial));
          } else {
            applyHighlight(mesh.material as THREE.MeshStandardMaterial);
          }
        }
      });
    }
  }, [clonedScene, selectedPart]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (!selectedPart) {
      // Idle flight: gentle hover up/down + slow roll + slight pitch
      groupRef.current.position.y = -0.5 + Math.sin(t * 0.9) * 0.12;
      groupRef.current.rotation.z = Math.sin(t * 0.6) * 0.07;  // roll: tilt left-right
      groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.04;  // pitch: tilt fwd-back
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.02);
    } else {
      // When part is selected: hold still, gently lock position
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -0.5, 0.06);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.06);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.06);
    }
  });

  return (
    <group ref={groupRef} scale={1.5} position={[0, -0.5, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload("/models/quadcopter.glb");
