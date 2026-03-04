import React, { useMemo, memo } from "react";
import { BufferGeometry, Float32BufferAttribute, SphereGeometry } from "three";

// Deterministic pseudo-random number generator (LCG)
function createRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function createPerturbedSphere(
  baseRadius: number,
  widthSegments: number,
  heightSegments: number,
  seed: number,
  amplitude = 0.08,
  flattenY = 1
): BufferGeometry {
  const rand = createRng(seed);
  const sphere = new SphereGeometry(baseRadius, widthSegments, heightSegments);
  const pos = sphere.attributes.position.array as Float32Array;
  const vertexCount = pos.length / 3;
  for (let i = 0; i < vertexCount; i++) {
    const ix = i * 3;
    const vx = pos[ix];
    const vy = pos[ix + 1];
    const vz = pos[ix + 2];
    const noise = (rand() - 0.5) * 2 * amplitude;
    pos[ix] = vx + vx * noise;
    pos[ix + 1] = vy + vy * noise * flattenY;
    pos[ix + 2] = vz + vz * noise;
  }
  sphere.computeVertexNormals();
  const geom = new BufferGeometry();
  geom.setAttribute("position", new Float32BufferAttribute(pos as any, 3));
  geom.setAttribute("normal", sphere.attributes.normal.clone());
  geom.setIndex(sphere.index?.clone() as any);
  return geom;
}

const DEFAULT_CANOPY_COLORS = ["#22c55e", "#16a34a", "#15803d"];

function Tree({
  scale = 1,
  trunkHeight = 0.7,
  trunkRadius = 0.12,
  canopyColors = DEFAULT_CANOPY_COLORS,
  castShadow = true,
  receiveShadow = true,
  anchor = "base",
  seed = 42,
}: {
  scale?: number;
  trunkHeight?: number;
  trunkRadius?: number;
  canopyColors?: string[];
  castShadow?: boolean;
  receiveShadow?: boolean;
  anchor?: "base" | "center";
  seed?: number;
}) {
  const trunkCenterY = trunkHeight / 2;
  const canopyBaseY = trunkHeight;

  // All random values computed once via seeded RNG, fully deterministic
  const { leaves, geometries } = useMemo(() => {
    const rand = createRng(seed);
    const out: {
      x: number;
      y: number;
      z: number;
      r: number;
      colIdx: number;
    }[] = [];

    const rings = [
      { radius: 0.48, yOffset: 0.28, count: 8, spread: 0.09 },
      { radius: 0.38, yOffset: 0.65, count: 7, spread: 0.07 },
      { radius: 0.30, yOffset: 0.98, count: 5, spread: 0.06 },
      { radius: 0.18, yOffset: 1.22, count: 3, spread: 0.04 },
    ];

    let idx = 0;
    for (const ring of rings) {
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2 + (rand() - 0.5) * 0.3;
        const jitter = (rand() - 0.5) * ring.spread;
        const r = ring.radius + jitter;
        const x = Math.cos(angle) * r + (rand() - 0.5) * ring.spread;
        const z = Math.sin(angle) * r + (rand() - 0.5) * ring.spread;
        const y = canopyBaseY + ring.yOffset + (rand() - 0.5) * 0.08;
        const size = ring.radius * (0.50 + rand() * 0.45);
        out.push({ x, y, z, r: size, colIdx: idx % canopyColors.length });
        idx++;
      }
    }

    // Inner filler leaves
    for (let i = 0; i < 6; i++) {
      out.push({
        x: (rand() - 0.5) * 0.18,
        y: canopyBaseY + 0.45 + (rand() - 0.5) * 0.25,
        z: (rand() - 0.5) * 0.18,
        r: 0.24 + rand() * 0.16,
        colIdx: (idx + i) % canopyColors.length,
      });
    }

    // Pre-create all geometries deterministically
    const geoms = out.map((l, i) =>
      createPerturbedSphere(
        l.r,
        12,
        10,
        seed * 997 + i * 131 + Math.floor(l.r * 1000),
        0.10,
        0.85
      )
    );

    return { leaves: out, geometries: geoms };
  }, [seed, canopyBaseY, canopyColors]);

  const canopyTop = canopyBaseY + 1.22 + 0.18;
  const centerY = canopyTop / 2;

  const inner = (
    <group scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh
        position={[0, trunkCenterY, 0]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <cylinderGeometry
          args={[trunkRadius, trunkRadius * 0.82, trunkHeight, 16]}
        />
        <meshStandardMaterial
          color="#5c3317"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Canopy */}
      <group>
        {leaves.map((l, i) => (
          <mesh
            key={i}
            geometry={geometries[i]}
            position={[l.x, l.y, l.z]}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
          >
            <meshStandardMaterial
              color={canopyColors[l.colIdx] ?? canopyColors[0]}
              roughness={0.7}
              metalness={0.05}
            />
          </mesh>
        ))}
      </group>
    </group>
  );

  if (anchor === "center") {
    return <group position={[0, -centerY * scale, 0]}>{inner}</group>;
  }
  return inner;
}

export default memo(Tree);
