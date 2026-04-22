import * as THREE from "three";
import { LevelInstance, LevelResult } from "./types";

/**
 * Màn chơi Bài 1: Chế độ luyện tập cơ bản (Premium Sci-Fi Arena)
 */
export function LevelBasicFlight(scene: THREE.Scene, drone: THREE.Group): LevelInstance {
  const objects: THREE.Object3D[] = [];
  const targetPos = new THREE.Vector3(0, 8, -30);
  let time = 0;

  function createTechPillar(position: THREE.Vector3) {
    const group = new THREE.Group();
    const bodyGeom = new THREE.CylinderGeometry(1.2, 2.2, 18, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: "#0f172a", metalness: 1, roughness: 0.1 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    group.add(body);

    const ringGeom = new THREE.TorusGeometry(2.5, 0.05, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: "#38bdf8", transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 5;
    ring.name = "energy_ring";
    group.add(ring);

    const light = new THREE.PointLight("#38bdf8", 8, 20);
    light.position.y = 9.5;
    group.add(light);

    group.position.copy(position);
    return group;
  }

  function init() {
    // 1. Landing Zone
    const padGroup = new THREE.Group();

    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 16, 0.2, 32),
      new THREE.MeshStandardMaterial({ color: "#1e293b", metalness: 0.9, roughness: 0.2 })
    );
    padGroup.position.set(0, -0.09, 0);
    padGroup.add(disc);

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(14, 0.1, 16, 100),
      new THREE.MeshBasicMaterial({ color: "#38bdf8", transparent: true, opacity: 0.4 })
    );
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.11;
    padGroup.add(innerRing);

    scene.add(padGroup);
    objects.push(padGroup);

    // 2. Trụ bảo vệ
    [[-30, -30], [30, -30], [-30, 30], [30, 30]].forEach(([x, z]) => {
      const pillar = createTechPillar(new THREE.Vector3(x, 0, z));
      scene.add(pillar);
      objects.push(pillar);
    });

    // 3. Đích đến - Portal
    const portalGroup = new THREE.Group();

    const mainRingGeom = new THREE.TorusGeometry(7, 0.15, 16, 100);
    const mainRingMat = new THREE.MeshBasicMaterial({
      color: "#22d3ee",
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const mainRing = new THREE.Mesh(mainRingGeom, mainRingMat);
    portalGroup.add(mainRing);

    for (let i = 0; i < 3; i++) {
      const segmentGeom = new THREE.TorusGeometry(8 + i * 1, 0.04, 8, 40, Math.PI / 1.5);
      const segmentMat = new THREE.MeshBasicMaterial({ color: "#22d3ee", transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
      const segment = new THREE.Mesh(segmentGeom, segmentMat);
      segment.name = `segment_${i}`;
      portalGroup.add(segment);
    }

    const coreGeom = new THREE.SphereGeometry(2, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: "#22d3ee",
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.name = "core";
    portalGroup.add(core);

    const lineGeom = new THREE.BoxGeometry(0.1, 3, 0.05);
    const lineMat = new THREE.MeshBasicMaterial({ color: "#ffffff", blending: THREE.AdditiveBlending });
    const line1 = new THREE.Mesh(lineGeom, lineMat);
    const line2 = new THREE.Mesh(lineGeom, lineMat);
    line2.rotation.z = Math.PI / 2;
    portalGroup.add(line1);
    portalGroup.add(line2);

    portalGroup.position.copy(targetPos);
    scene.add(portalGroup);
    objects.push(portalGroup);

    // 4. Guide Beam
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 60, 8),
      new THREE.MeshBasicMaterial({ color: "#22d3ee", transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending })
    );
    beam.rotation.x = Math.PI / 2;
    beam.position.set(0, 0, -5);
    scene.add(beam);
    objects.push(beam);
  }

  function update(delta: number): LevelResult {
    if (!drone) return { status: "PLAYING" };
    time += delta;

    objects.forEach(obj => {
      if (obj instanceof THREE.Group) {
        const ring = obj.getObjectByName("energy_ring");
        if (ring) {
          ring.rotation.z += delta * 2;
        }

        if (obj.position.equals(targetPos)) {
          const core = obj.getObjectByName("core");
          if (core) {
            core.scale.setScalar(1 + Math.sin(time * 3) * 0.1);
          }
          for (let i = 0; i < 3; i++) {
            const s = obj.getObjectByName(`segment_${i}`);
            if (s) {
              s.rotation.z += delta * (i + 1) * 0.5;
            }
          }
        }
      }
    });

    if (drone.position.distanceTo(targetPos) < 8) {
      return { status: "WIN", message: "BẠN ĐÃ HOÀN THÀNH BÀI 1!", objective: "Nhiệm vụ: Bay vào cổng năng lượng" };
    }

    if (drone.position.y < 0.1 && drone.position.z < -2) {
      return { status: "FAIL", message: "HÃY THỬ LẠI!", objective: "Mục tiêu: Bay vào cổng năng lượng" };
    }

    return { status: "PLAYING", objective: "Nhiệm vụ: Cất cánh và tiến thẳng vào tâm cổng Portal" };
  }

  function cleanup() {
    objects.forEach(obj => {
      scene.remove(obj);
      obj.traverse((child) => {
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
  }

  return { init, update, cleanup };
}
