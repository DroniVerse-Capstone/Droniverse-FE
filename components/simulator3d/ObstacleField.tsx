"use client";

import { Text, useGLTF } from "@react-three/drei";
import BoxObstacle from "./obstacles/BoxObstacle";
import CylinderObstacle from "./obstacles/CylinderObstacle";
import {
  MARKER_MODEL_CONFIG,
} from "@/lib/models3d/markersConfig";

type BaseObstacle = {
  id: string;
  type: string;
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
  rotation?: [number, number, number];
  coords?: { x: number; y: number; z: number };
};

type Props = {
  obstacles: BaseObstacle[];
};

export default function ObstacleField({ obstacles }: Props) {
  const customModel =
    MARKER_MODEL_CONFIG.obstacle.useCustomModel &&
    MARKER_MODEL_CONFIG.obstacle.modelPath
      ? useGLTF(MARKER_MODEL_CONFIG.obstacle.modelPath)
      : null;

  return (
    <group>
      {obstacles.map((ob) => {
        switch ((ob.type || "box").toLowerCase()) {
          case "cylinder":
            return <CylinderObstacle key={ob.id} ob={ob} />;
          case "box":
          default:
            return <BoxObstacle key={ob.id} ob={ob} />;
        }
      })}
    </group>
  );
}
