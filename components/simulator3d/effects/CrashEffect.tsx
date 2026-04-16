"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  position: [number, number, number];
  color?: string;
  count?: number;
};

export default function CrashEffect({ position, color = "#ff4d00", count = 80 }: Props) {
  const pointsRef = useRef<THREE.Points>(null!);
  const opacityRef = useRef(1.0);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
        // Position at impact
        positions[i * 3] = position[0];
        positions[i * 3 + 1] = position[1];
        positions[i * 3 + 2] = position[2];
        
        // Random velocity burst - much faster for "Wow"
        const speed = Math.random() * 3 + 1.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        velocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
        velocities[i * 3 + 1] = speed * Math.cos(phi) + 1.0; // Bias upwards
        velocities[i * 3 + 2] = speed * Math.sin(phi) * Math.sin(theta);
    }
    return { positions, velocities };
  }, [position, count]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(particles.positions, 3));
    return g;
  }, [particles]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const posAttr = pointsRef.current.geometry.getAttribute("position");
    const posArray = posAttr.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
        // Apply velocity
        posArray[i * 3] += particles.velocities[i * 3] * delta * 5;
        posArray[i * 3 + 1] += particles.velocities[i * 3 + 1] * delta * 5;
        posArray[i * 3 + 2] += particles.velocities[i * 3 + 2] * delta * 5;
        
        // Gravity
        particles.velocities[i * 3 + 1] -= delta * 12.0;
        
        // Air resistance
        particles.velocities[i * 3] *= 0.98;
        particles.velocities[i * 3 + 2] *= 0.98;
    }
    
    posAttr.needsUpdate = true;
    
    // Fade out smoothly
    opacityRef.current -= delta * 0.45;
    if (pointsRef.current.material instanceof THREE.PointsMaterial) {
        pointsRef.current.material.opacity = Math.max(0, opacityRef.current);
    }
  });

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial
        size={1.5} // Super visible sparks
        color={color}
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
}
