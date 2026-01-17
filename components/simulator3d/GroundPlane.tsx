"use client";
import { useMemo } from "react";
import { useGLTF, Grid } from "@react-three/drei";
import { Line } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import {
  MAP_COLORS,
  GRID_CONFIG,
  BORDER_CONFIG,
  TERRAIN_MODEL_CONFIG,
} from "@/lib/models3d/mapConfig";

type Props = {
  size: [number, number];
  onPointerMove?: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: () => void;
  colorConfig?: {
    ground?: string;
    grid?: string;
    border?: string;
  };
};

export default function GroundPlane({
  size,
  onPointerMove,
  onPointerOut,
  colorConfig,
}: Props) {
  const [width, height] = size;

  const halfW = width / 2;
  const halfH = height / 2;

  const borderPoints: [number, number, number][] = [
    [-halfW, BORDER_CONFIG.height, -halfH],
    [halfW, BORDER_CONFIG.height, -halfH],
    [halfW, BORDER_CONFIG.height, halfH],
    [-halfW, BORDER_CONFIG.height, halfH],
    [-halfW, BORDER_CONFIG.height, -halfH],
  ];

  const customTerrain =
    TERRAIN_MODEL_CONFIG.useCustomTerrain && TERRAIN_MODEL_CONFIG.terrainPath
      ? useGLTF(TERRAIN_MODEL_CONFIG.terrainPath)
      : null;

  return (
    <group>
      {customTerrain && (
        <primitive
          object={customTerrain.scene}
          scale={TERRAIN_MODEL_CONFIG.scale}
          position={TERRAIN_MODEL_CONFIG.position}
          onPointerMove={onPointerMove}
          onPointerOut={onPointerOut}
          onPointerLeave={onPointerOut}
        />
      )}

      {!customTerrain && (
        <mesh
          rotation-x={-Math.PI / 2}
          onPointerMove={onPointerMove}
          onPointerOut={onPointerOut}
          onPointerLeave={onPointerOut}
        >
          <planeGeometry args={size} />
          <meshBasicMaterial
            color={colorConfig?.ground ?? MAP_COLORS.GROUND.color}
          />
        </mesh>
      )}

      {useMemo(() => {
        const [width, height] = size;
        const halfW = width / 2;
        const halfH = height / 2;
        const cell = GRID_CONFIG.cellSize;
        const section = GRID_CONFIG.sectionSize;

        const vertsCell: number[] = [];
        const vertsSection: number[] = [];

        for (let x = -halfW; x <= halfW; x += cell) {
          const isSection =
            Math.round((x + halfW) / cell) %
              Math.max(1, Math.round(section / cell)) ===
            0;
          const verts = isSection ? vertsSection : vertsCell;
          verts.push(x, GRID_CONFIG.position[1] ?? 0, -halfH);
          verts.push(x, GRID_CONFIG.position[1] ?? 0, halfH);
        }

        for (let z = -halfH; z <= halfH; z += cell) {
          const isSection =
            Math.round((z + halfH) / cell) %
              Math.max(1, Math.round(section / cell)) ===
            0;
          const verts = isSection ? vertsSection : vertsCell;
          verts.push(-halfW, GRID_CONFIG.position[1] ?? 0, z);
          verts.push(halfW, GRID_CONFIG.position[1] ?? 0, z);
        }

        const geomCell = new Float32Array(vertsCell);
        const geomSection = new Float32Array(vertsSection);

        return (
          <group key={`grid-${width}x${height}`}>
            {geomCell.length > 0 && (
              <lineSegments>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    array={geomCell}
                    itemSize={3}
                    count={geomCell.length / 3}
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color={MAP_COLORS.GRID.cellColor}
                  transparent
                  opacity={0.9}
                />
              </lineSegments>
            )}
            {geomSection.length > 0 && (
              <lineSegments>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    array={geomSection}
                    itemSize={3}
                    count={geomSection.length / 3}
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color={colorConfig?.grid ?? MAP_COLORS.GRID.sectionColor}
                  transparent
                  opacity={0.95}
                />
              </lineSegments>
            )}
          </group>
        );
      }, [size[0], size[1], colorConfig])}
      <Line
        points={borderPoints}
        color={colorConfig?.border ?? MAP_COLORS.BORDER.color}
        lineWidth={MAP_COLORS.BORDER.lineWidth}
        opacity={MAP_COLORS.BORDER.opacity}
        transparent={MAP_COLORS.BORDER.transparent}
      />
    </group>
  );
}
