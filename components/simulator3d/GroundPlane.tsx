import { useMemo } from "react";
import { useGLTF, Grid, useTexture } from "@react-three/drei";
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
  bgOpacity?: number;
};

const LOGO_OFFSET_X = 13;
const LOGO_OFFSET_Z = 2;

export default function GroundPlane({
  size,
  onPointerMove,
  onPointerOut,
  colorConfig,
  bgOpacity = 1,
}: Props) {
  console.log("size", size);
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
                  opacity={0.65}
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

      {/* <GroundLogo size={size} /> */}
    </group>
  );
}

function GroundLogo({ size }: { size: [number, number] }) {
  const texture = useTexture("/logo_ground.png");

  const offsetTexture = useMemo(() => {
    const t = texture.clone();
    const [width, height] = size;

    t.offset.set(-LOGO_OFFSET_X / width, -LOGO_OFFSET_Z / height);

    t.needsUpdate = true;
    return t;
  }, [texture, size]);

  return (
    <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={offsetTexture} transparent opacity={0.15} depthWrite={false} />
    </mesh>
  );
}
