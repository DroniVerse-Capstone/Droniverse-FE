"use client";
import { useGLTF } from "@react-three/drei";
import HoopGoal from "./goals/HoopGoal";
import SquareGoal from "./goals/SquareGoal";
import {
  MARKER_MODEL_CONFIG,
} from "@/lib/models3d/markersConfig";

type GoalProps = {
  goal: {
    position: { x: number; y: number; z: number };
    shape?: "circle" | "square" | "zigzag";
    radius?: number;
    size?: [number, number];
    rotation?: [number, number, number];
    coords?: { x: number; y: number; altitude: number };
  };
};

function CustomGoalModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <primitive
      object={scene}
      scale={MARKER_MODEL_CONFIG.goal.scale}
      position={MARKER_MODEL_CONFIG.goal.position}
    />
  );
}

export default function GoalMarker({ goal }: GoalProps) {
  const { position, shape, radius, size, coords, rotation } = goal;
  const baseY = Math.max(position.y, 0);

  const useCustomModel = MARKER_MODEL_CONFIG.goal.useCustomModel && MARKER_MODEL_CONFIG.goal.modelPath;

  const rotationRad: [number, number, number] = rotation
    ? [(rotation[0] * Math.PI) / 180, (rotation[1] * Math.PI) / 180, (rotation[2] * Math.PI) / 180]
    : [0, Math.PI, 0];

  return (
    <group position={[position.x, baseY, position.z]} rotation={rotationRad}>
      {useCustomModel ? (
        <CustomGoalModel url={MARKER_MODEL_CONFIG.goal.modelPath} />
      ) : (
        <>
          {shape === "square" && size ? (
            <SquareGoal size={size} />
          ) : (
            <HoopGoal radius={radius} />
          )}
        </>
      )}
    </group>
  );
}
