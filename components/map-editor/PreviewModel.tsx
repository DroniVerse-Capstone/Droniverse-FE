import { Suspense } from "react";
import { useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
// @ts-ignore - FBXLoader
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import DroneBody from "../simulator3d/DroneBody";
import BoxObstacle from "../simulator3d/obstacles/BoxObstacle";
import Tree from "../simulator3d/decor/Tree";

export default function PreviewModel({ model }: { model: any }) {
  if (!model?.url) return null;
  if (model.url.startsWith("primitive:")) {
    const t = model.url.split(":")[1];
    const previewScale = model.previewScale ?? model.defaultScale ?? 1;
    if (t === "drone") {
      return (
        <group scale={[previewScale, previewScale, previewScale]}>
          <DroneBody
            state={{
              position: [0, 0, 0],
              headingRad: 0,
              isFlying: false,
            }}
          />
        </group>
      );
    }
    if (t === "box") {
      const size = [
        model.defaultScale * 2,
        model.defaultScale * 2,
        model.defaultScale * 2,
      ];
      const ob = {
        id: "preview-box",
        position: [0, 0, 0],
        size,
        color: "#00d9ff",
      };
      return (
        <group scale={[previewScale, previewScale, previewScale]}>
          <BoxObstacle ob={ob as any} />
        </group>
      );
    }
    if (t === "tree") {
      return <Tree scale={1.6} anchor="center" />;
    }
    return null;
  }

  const ext = model.url.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  if (ext === "fbx") {
    const fbx = useLoader(FBXLoader, model.url) as any;
    return (
      <primitive
        object={fbx}
        scale={[model.defaultScale, model.defaultScale, model.defaultScale]}
      />
    );
  }
  const gltf = useGLTF(model.url) as any;
  return (
    <primitive
      object={gltf.scene}
      scale={[model.defaultScale, model.defaultScale, model.defaultScale]}
    />
  );
}
