import React, { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute, SphereGeometry } from "three";

export default function Tree({
  scale = 1,
  trunkHeight = 0.7,
  trunkRadius = 0.12,
  canopyColors = ["#1fbf6b", "#16a56c", "#0fa35a"],
  castShadow = true,
  receiveShadow = true,
  anchor = "base",
}: {
  scale?: number;
  trunkHeight?: number;
  trunkRadius?: number;
  canopyColors?: string[];
  castShadow?: boolean;
  receiveShadow?: boolean;
  anchor?: "base" | "center";
}) {
  const trunkCenterY = trunkHeight / 2;
  const canopyBaseY = trunkHeight;

  const leaves = useMemo(() => {
    const out: {
      x: number;
      y: number;
      z: number;
      r: number;
      colIdx: number;
    }[] = [];
    const rings = [
      { radius: 0.45, yOffset: 0.32, count: 8, spread: 0.08 },
      { radius: 0.36, yOffset: 0.7, count: 7, spread: 0.07 },
      { radius: 0.28, yOffset: 1.02, count: 5, spread: 0.06 },
    ];
    let idx = 0;
    for (const ring of rings) {
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2;
        const jitter = (Math.random() - 0.5) * ring.spread;
        const r = ring.radius + jitter;
        const x = Math.cos(angle) * r + (Math.random() - 0.5) * ring.spread;
        const z = Math.sin(angle) * r + (Math.random() - 0.5) * ring.spread;
        const y = canopyBaseY + ring.yOffset + (Math.random() - 0.5) * 0.08;
        const size = ring.radius * (0.55 + Math.random() * 0.4);
        out.push({ x, y, z, r: size, colIdx: idx % canopyColors.length });
        idx++;
      }
    }
    for (let i = 0; i < 5; i++) {
      out.push({
        x: (Math.random() - 0.5) * 0.16,
        y: canopyBaseY + 0.5 + (Math.random() - 0.5) * 0.2,
        z: (Math.random() - 0.5) * 0.16,
        r: 0.22 + Math.random() * 0.18,
        colIdx: (idx + i) % canopyColors.length,
      });
    }
    return out;
  }, [canopyBaseY, canopyColors]);

  const createPerturbedSphere = (
    baseRadius: number,
    widthSegments: number,
    heightSegments: number,
    seed: number,
    amplitude = 0.08,
    flattenY = 1
  ): BufferGeometry => {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };

    const sphere = new SphereGeometry(
      baseRadius,
      widthSegments,
      heightSegments
    );
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
  };

  const canopyTop = canopyBaseY + 1.02 + 0.28;
  const totalHeight = canopyTop;
  const centerY = totalHeight / 2;

  const inner = (
    <group scale={[scale, scale, scale]}>
      <mesh
        position={[0, trunkCenterY, 0]}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <cylinderGeometry
          args={[trunkRadius, trunkRadius * 0.85, trunkHeight, 16]}
        />
        <meshStandardMaterial color={"#6b3f2a"} />
      </mesh>

      <group>
        {leaves.map((l, i) => {
          const geom = createPerturbedSphere(
            l.r,
            12,
            10,
            i * 997 + Math.floor(l.r * 1000),
            0.12,
            0.9
          );
          return (
            <mesh
              key={i}
              geometry={geom}
              position={[l.x, l.y, l.z]}
              castShadow={castShadow}
              receiveShadow={receiveShadow}
            >
              <meshStandardMaterial
                color={canopyColors[l.colIdx] ?? canopyColors[0]}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );

  if (anchor === "center") {
    return <group position={[0, -centerY * scale, 0]}>{inner}</group>;
  }
  return inner;
}
