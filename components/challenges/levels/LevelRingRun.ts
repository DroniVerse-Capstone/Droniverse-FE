import * as THREE from "three";
import { LevelInstance, LevelResult } from "./types";

export function LevelRingRun(scene: THREE.Scene, drone: THREE.Group): LevelInstance {
  const rings: THREE.Group[] = [];
  const ringPositions = [
    [0, 5, -15],
    [15, 10, -35],
    [-15, 15, -55],
    [0, 8, -75],
    [0, 5, -95]
  ];
  let nextRingIndex = 0;
  let time = 0;
  // Plane-crossing collision: track previous drone position
  let prevDronePos = new THREE.Vector3();

  function createFancyRing(position: number[], isActive: boolean) {
    const group = new THREE.Group();
    group.position.set(position[0], position[1], position[2]);
    
    const geom = new THREE.TorusGeometry(4, 0.2, 16, 64);
    const mat = new THREE.MeshStandardMaterial({ 
      color: isActive ? "#22d3ee" : "#1e293b", 
      emissive: isActive ? "#22d3ee" : "#000000",
      emissiveIntensity: isActive ? 2 : 0,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8
    });
    const mesh = new THREE.Mesh(geom, mat);
    group.add(mesh);

    const innerGeom = new THREE.TorusGeometry(3.8, 0.05, 16, 64);
    const innerMat = new THREE.MeshBasicMaterial({ 
      color: isActive ? "#38bdf8" : "#0f172a",
      transparent: true,
      opacity: isActive ? 1 : 0.2
    });
    const innerMesh = new THREE.Mesh(innerGeom, innerMat);
    group.add(innerMesh);

    const light = new THREE.PointLight(isActive ? "#22d3ee" : "#000000", isActive ? 10 : 0, 20);
    group.add(light);

    return group;
  }

  function init() {
    ringPositions.forEach((pos, i) => {
      const ringGroup = createFancyRing(pos, i === 0);
      scene.add(ringGroup);
      rings.push(ringGroup);
    });
  }

  function update(delta: number): LevelResult {
    time += delta;
    if (!drone || nextRingIndex >= rings.length) {
      return { status: "WIN", message: "BẠN ĐÃ VƯỢT QUA TẤT CẢ CÁC VÒNG!", objective: "Nhiệm vụ: Hoàn thành chặng bay" };
    }

    rings.forEach((ring, i) => {
      if (i >= nextRingIndex) {
        ring.rotation.y += delta * 0.5;
        if (i === nextRingIndex) {
          const scale = 1 + Math.sin(time * 3) * 0.05;
          ring.scale.setScalar(scale);
        }
      }
    });

    const currentRing = rings[nextRingIndex];

    // --- PLANE-CROSSING COLLISION (giống Unity Trigger) ---
    // Vì ring xoay theo Y, ta dùng forward vector của ring trong world-space
    const ringForward = new THREE.Vector3(0, 0, 1).applyQuaternion(currentRing.quaternion);
    const toRing      = new THREE.Vector3().subVectors(currentRing.position, prevDronePos);
    const toCurrent   = new THREE.Vector3().subVectors(currentRing.position, drone.position);

    const dotPrev = toRing.dot(ringForward);
    const dotCur  = toCurrent.dot(ringForward);

    // Drone đã cắt qua mặt phẳng của ring trong frame này?
    const crossed = (dotPrev >= 0 && dotCur < 0) || (dotPrev <= 0 && dotCur > 0);

    if (crossed) {
      // Nội suy vị trí chính xác tại giao điểm
      const t = Math.abs(dotPrev) / (Math.abs(dotPrev) + Math.abs(dotCur) + 1e-9);
      const crossPoint = new THREE.Vector3().lerpVectors(prevDronePos, drone.position, t);

      // Kiểm tra giao điểm trong lỗ vòng (bán kính = 4)
      const delta = new THREE.Vector3().subVectors(crossPoint, currentRing.position);
      // Loại bỏ thành phần dọc theo forward (đã gần 0, nhưng khử thêm)
      const proj = ringForward.clone().multiplyScalar(delta.dot(ringForward));
      delta.sub(proj);
      const distFromCenter = delta.length();

      if (distFromCenter < 4) {
        const mat = (currentRing.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
        mat.color.set("#1e293b");
        mat.emissive.set("#000000");
        mat.emissiveIntensity = 0;
        (currentRing.children[1] as THREE.Mesh).material = new THREE.MeshBasicMaterial({ color: "#0f172a", transparent: true, opacity: 0.2 });
        (currentRing.children[2] as THREE.PointLight).intensity = 0;

        nextRingIndex++;

        if (nextRingIndex < rings.length) {
          const nextRing = rings[nextRingIndex];
          const nextMat = (nextRing.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
          nextMat.color.set("#22d3ee");
          nextMat.emissive.set("#22d3ee");
          nextMat.emissiveIntensity = 2;
          (nextRing.children[1] as THREE.Mesh).material = new THREE.MeshBasicMaterial({ color: "#38bdf8", transparent: true, opacity: 1 });
          (nextRing.children[2] as THREE.PointLight).intensity = 10;
          (nextRing.children[2] as THREE.PointLight).color.set("#22d3ee");
        }
      }
    }
    // --- end collision ---

    prevDronePos.copy(drone.position);

    if (drone.position.y < 0.1 && drone.position.z < -2) {
      return { status: "FAIL", message: "BẠN ĐÃ RƠI!", objective: "Nhiệm vụ: Bay qua các vòng" };
    }

    return { 
      status: "PLAYING", 
      objective: `Nhiệm vụ: Bay qua vòng ${nextRingIndex + 1}/${rings.length}` 
    };
  }

  function cleanup() {
    rings.forEach(ring => {
      scene.remove(ring);
      ring.traverse((child) => {
        if ((child as any).geometry) (child as any).geometry.dispose();
        if ((child as any).material) {
          if (Array.isArray((child as any).material)) {
            (child as any).material.forEach((m: any) => m.dispose());
          } else {
            (child as any).material.dispose();
          }
        }
      });
    });
    prevDronePos.set(0, 0, 0);
  }

  return { init, update, cleanup };
}
