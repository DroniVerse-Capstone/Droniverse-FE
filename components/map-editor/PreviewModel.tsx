import { useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
// @ts-ignore - FBXLoader
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import DroneBody from "../simulator3d/DroneBody";
import BoxObstacle from "../simulator3d/obstacles/BoxObstacle";
import Tree from "../simulator3d/decor/Tree";
import DiamondBonus from "../simulator3d/bonus/DiamondBonus";
import StarBonus from "../simulator3d/bonus/StarBonus";
import HeartBonus from "../simulator3d/bonus/HeartBonus";
import CheckpointBeacon from "../simulator3d/checkpoint/CheckpointBeacon";
import RockGLB from "../simulator3d/obstacles/RockGLB";
import GrassGLB from "../simulator3d/decor/GrassGLB";
import Tree2GLB from "../simulator3d/decor/Tree2GLB";

import * as THREE from "three";
import { Line } from "@react-three/drei";

export default function PreviewModel({ model }: { model: any }) {
  if (!model?.url) return null;

  if (model.url.startsWith("primitive:")) {
    const t = model.url.split(":")[1];
    const previewScale = model.previewScale ?? model.defaultScale ?? 1;

    // Handle Pattern Previews
    if (t.startsWith("pattern_")) {
      const shape = t.replace("pattern_", "");
      const map: Record<string, string> = {
        square: "#00ffff",
        circle: "#39ff14",
        zigzag: "#ffea00",
      };
      const shapeColor = map[shape] ?? "#00ffff";

      // Scale specifically for the sidebar camera
      const scaleBase = previewScale * 35;
      let points: THREE.Vector3[] = [];

      if (shape === "circle") {
        const steps = 32;
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          points.push(new THREE.Vector3(Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5));
        }
      } else if (shape === "square") {
        const hw = 0.5, hd = 0.5;
        points = [
          new THREE.Vector3(-hw, 0, -hd),
          new THREE.Vector3(hw, 0, -hd),
          new THREE.Vector3(hw, 0, hd),
          new THREE.Vector3(-hw, 0, hd),
          new THREE.Vector3(-hw, 0, -hd),
        ];
      } else if (shape === "zigzag") {
        points = [
          new THREE.Vector3(-0.5, 0, -0.5),
          new THREE.Vector3(-0.25, 0, 0.5),
          new THREE.Vector3(0, 0, -0.5),
          new THREE.Vector3(0.25, 0, 0.5),
          new THREE.Vector3(0.5, 0, -0.5),
        ];
      }

      const flatPts = points.map((p) => [p.x, p.y, p.z] as [number, number, number]);

      return (
        <group scale={[scaleBase, scaleBase, scaleBase]} position={[0, -0.4, 0]} rotation={[0, 0, 0]}>
          <Line points={flatPts} color={shapeColor} lineWidth={4} />
          {/* Subtle glow for the sidebar preview */}
          <Line points={flatPts} color={shapeColor} lineWidth={8} transparent opacity={0.3} />
        </group>
      );
    }

    if (t === "drone") {
      return (
        <group scale={[previewScale, previewScale, previewScale]}>
          <DroneBody state={{ position: [0, 0, 0], headingRad: 0, isFlying: false }} />
        </group>
      );
    }
    if (t === "box") {
      const size: [number, number, number] = [model.defaultScale * 2, model.defaultScale * 2, model.defaultScale * 2];
      return (
        <group scale={[previewScale, previewScale, previewScale]}>
          <BoxObstacle size={size} color="#00d9ff" />
        </group>
      );
    }
    if (t === "tree") return <Tree scale={previewScale} anchor="center" />;
    if (t === "tree2") return <Tree2GLB scale={previewScale} physics={false} groundOffset={0} anchor="center" />;
    if (t === "grass") return <GrassGLB scale={previewScale} physics={false} groundOffset={0} anchor="center" />;
    if (t === "rock") return <RockGLB scale={previewScale} physics={false} groundOffset={0} anchor="center" />;
    if (t === "diamond") {
      return (
        <group scale={[previewScale * 0.45, previewScale * 0.45, previewScale * 0.45]}>
          <DiamondBonus />
        </group>
      );
    }
    if (t === "star") {
      return (
        <group scale={[previewScale * 0.45, previewScale * 0.45, previewScale * 0.45]}>
          <StarBonus />
        </group>
      );
    }
    if (t === "heart") {
      return (
        <group scale={[previewScale * 0.45, previewScale * 0.45, previewScale * 0.45]}>
          <HeartBonus />
        </group>
      );
    }
    if (t === "checkpoint") {
      return (
        <group scale={[previewScale * 0.18, previewScale * 0.18, previewScale * 0.18]} position={[0, -0.7, 0]}>
          <CheckpointBeacon radius={4} order={0} showText={false} />
        </group>
      );
    }
    return null;
  }

  const isPath = model.url.startsWith("/") || model.url.startsWith("http");
  if (!isPath) return null;

  const ext = model.url.split(".").pop()?.toLowerCase();
  if (ext === "fbx") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const fbx = useLoader(FBXLoader, model.url) as any;
    return (
      <primitive
        object={fbx}
        scale={[model.defaultScale, model.defaultScale, model.defaultScale]}
      />
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const gltf = useGLTF(model.url) as any;
  return (
    <primitive
      object={gltf.scene}
      scale={[model.defaultScale, model.defaultScale, model.defaultScale]}
    />
  );
}
