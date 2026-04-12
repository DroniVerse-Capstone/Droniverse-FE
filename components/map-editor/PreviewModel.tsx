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

export default function PreviewModel({ model }: { model: any }) {
  if (!model?.url) return null;

  if (model.url.startsWith("primitive:")) {
    const t = model.url.split(":")[1];
    const previewScale = model.previewScale ?? model.defaultScale ?? 1;

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

  const ext = model.url.split(".").pop()?.toLowerCase();
  if (!ext) return null;
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
