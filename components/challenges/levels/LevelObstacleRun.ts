import * as THREE from "three";
import { LevelInstance, LevelResult } from "./types";

const GATE_ACTIVE_COLOR = "#22c55e";
const GATE_DONE_COLOR   = "#94a3b8";
const GATE_LOCKED_COLOR = "#7c3aed";
const GOAL_OPEN_COLOR   = "#a855f7";
const GOAL_LOCKED_COLOR = "#1e293b";
const DANGER_COLOR      = "#f97316";

interface GateData {
  position: THREE.Vector3;
  group: THREE.Group;
  ringMat: THREE.MeshBasicMaterial;
  diskMat: THREE.MeshBasicMaterial;
  dotMats: THREE.MeshBasicMaterial[];
  light: THREE.PointLight;
  passed: boolean;
}

export function LevelObstacleRun(scene: THREE.Scene, drone: THREE.Group): LevelInstance {
  const objects: THREE.Object3D[] = [];
  const gates: GateData[] = [];
  const goalPos = new THREE.Vector3(0, 85, -180);

  let time = 0;
  let currentGateIndex = 0;
  let allGatesPassed = false;

  let portalOuterMat: THREE.MeshStandardMaterial | null = null;
  let portalInnerMat: THREE.MeshStandardMaterial | null = null;
  let portalLight: THREE.PointLight | null = null;

  function createGate(position: THREE.Vector3, color: string): GateData {
    const group = new THREE.Group();
    const W = 14; const H = 11; const T = 0.6;

    const frameMat = new THREE.MeshStandardMaterial({
      color: "#0f172a", metalness: 0.9, roughness: 0.15,
    });

    const topM = new THREE.Mesh(new THREE.BoxGeometry(W * 2, T, T), frameMat);
    topM.position.y = H; group.add(topM);

    const botM = new THREE.Mesh(new THREE.BoxGeometry(W * 2, T, T), frameMat);
    botM.position.y = -H; group.add(botM);

    const leftM = new THREE.Mesh(new THREE.BoxGeometry(T, H * 2, T), frameMat);
    leftM.position.x = -W; group.add(leftM);

    const rightM = new THREE.Mesh(new THREE.BoxGeometry(T, H * 2, T), frameMat);
    rightM.position.x = W; group.add(rightM);

    const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
    group.add(new THREE.Mesh(new THREE.TorusGeometry(8, 0.3, 12, 80), ringMat));

    const diskMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.06, side: THREE.DoubleSide });
    group.add(new THREE.Mesh(new THREE.CircleGeometry(8, 64), diskMat));

    const dotMats: THREE.MeshBasicMaterial[] = [];
    const dotGeo = new THREE.SphereGeometry(0.4, 8, 8);
    [[-W, H], [W, H], [-W, -H], [W, -H]].forEach(([x, y]) => {
      const mat = new THREE.MeshBasicMaterial({ color });
      dotMats.push(mat);
      const d = new THREE.Mesh(dotGeo, mat);
      d.position.set(x, y, 0);
      group.add(d);
    });

    const light = new THREE.PointLight(color, 14, 50);
    group.add(light);

    group.position.copy(position);
    return { position, group, ringMat, diskMat, dotMats, light, passed: false };
  }

  function setGateColor(gate: GateData, color: string) {
    gate.ringMat.color.set(color);
    gate.diskMat.color.set(color);
    gate.light.color.set(color);
    gate.dotMats.forEach(m => m.color.set(color));
  }

  function createSpinningBeam(position: THREE.Vector3, index: number) {
    const group = new THREE.Group();
    group.name = `beam_${index}`;

    const mat = new THREE.MeshStandardMaterial({
      color: "#1c0a00", emissive: DANGER_COLOR,
      emissiveIntensity: 3, metalness: 0.8, roughness: 0.2,
    });
    group.add(new THREE.Mesh(new THREE.BoxGeometry(20, 1.0, 1.0), mat));

    const capMat = new THREE.MeshBasicMaterial({ color: DANGER_COLOR });
    [-10, 10].forEach(x => {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 10), capMat);
      cap.position.x = x; group.add(cap);
      const pl = new THREE.PointLight(DANGER_COLOR, 10, 25);
      pl.position.x = x; group.add(pl);
    });

    group.position.copy(position);
    return group;
  }

  function createPortal(position: THREE.Vector3) {
    const group = new THREE.Group();
    group.name = "portal";

    const outerMat = new THREE.MeshStandardMaterial({
      color: GOAL_LOCKED_COLOR, emissive: GOAL_LOCKED_COLOR, emissiveIntensity: 0.5,
    });
    group.add(new THREE.Mesh(new THREE.TorusGeometry(13, 1.0, 16, 100), outerMat));

    const innerMat = new THREE.MeshStandardMaterial({
      color: GOAL_LOCKED_COLOR, emissive: GOAL_LOCKED_COLOR,
      emissiveIntensity: 0.3, transparent: true, opacity: 0.5,
    });
    const inner = new THREE.Mesh(new THREE.TorusGeometry(9, 0.4, 12, 80), innerMat);
    inner.name = "inner"; group.add(inner);

    group.add(new THREE.Mesh(
      new THREE.CircleGeometry(8.5, 64),
      new THREE.MeshBasicMaterial({ color: GOAL_LOCKED_COLOR, transparent: true, opacity: 0.05, side: THREE.DoubleSide })
    ));

    const light = new THREE.PointLight(GOAL_LOCKED_COLOR, 5, 50);
    group.add(light);

    portalOuterMat = outerMat;
    portalInnerMat = innerMat;
    portalLight = light;
    group.position.copy(position);
    return group;
  }

  function unlockPortal() {
    if (portalOuterMat) {
      portalOuterMat.color.set(GOAL_OPEN_COLOR);
      portalOuterMat.emissive.set(GOAL_OPEN_COLOR);
      portalOuterMat.emissiveIntensity = 8;
    }
    if (portalInnerMat) {
      portalInnerMat.color.set("#e2e8f0");
      portalInnerMat.emissive.set("#e2e8f0");
      portalInnerMat.emissiveIntensity = 5;
    }
    if (portalLight) {
      portalLight.color.set(GOAL_OPEN_COLOR);
      portalLight.intensity = 50;
      portalLight.distance = 150;
    }
  }

  function init() {
    const gatePositions = [
      new THREE.Vector3(0,   45,  -50),
      new THREE.Vector3(20,  62, -100),
      new THREE.Vector3(-10, 76, -145),
    ];
    gatePositions.forEach((pos, i) => {
      const color = i === 0 ? GATE_ACTIVE_COLOR : GATE_LOCKED_COLOR;
      const gate = createGate(pos, color);
      scene.add(gate.group);
      objects.push(gate.group);
      gates.push(gate);
    });

    const portal = createPortal(goalPos);
    scene.add(portal);
    objects.push(portal);
  }

  function checkGatePass() {
    if (currentGateIndex >= gates.length) return;
    const gate = gates[currentGateIndex];
    if (gate.passed) return;

    const dx = Math.abs(drone.position.x - gate.position.x);
    const dy = Math.abs(drone.position.y - gate.position.y);
    const dz = Math.abs(drone.position.z - gate.position.z);

    if (dx < 14 && dy < 11 && dz < 4) {
      gate.passed = true;
      setGateColor(gate, GATE_DONE_COLOR);
      currentGateIndex++;

      if (currentGateIndex < gates.length) {
        setGateColor(gates[currentGateIndex], GATE_ACTIVE_COLOR);
      } else {
        allGatesPassed = true;
        unlockPortal();
      }
    }
  }

  function update(delta: number): LevelResult {
    if (!drone) return { status: "PLAYING" };
    time += delta;

    objects.forEach(obj => {
      if (obj.name === "portal" && allGatesPassed) {
        obj.rotation.y += delta * 0.35;
        const inner = obj.getObjectByName("inner");
        if (inner) inner.rotation.x += delta * 1.0;
      }
    });

    checkGatePass();

    if (allGatesPassed && drone.position.distanceTo(goalPos) < 20) {
      return { status: "WIN", message: "XUẤT SẮC! NHIỆM VỤ HOÀN TẤT!", objective: "Nhiệm vụ hoàn tất" };
    }

    if (drone.position.y < 0.1 && drone.position.z < -5) {
      return { status: "FAIL", message: "DRONE ĐÃ RƠI!", objective: "Giữ ga để không rơi" };
    }

    if (!allGatesPassed) {
      const remaining = gates.length - currentGateIndex;
      return {
        status: "PLAYING",
        objective: `Bay qua cổng XANH LÁ → cổng tiếp theo mở (còn ${remaining} cổng)`,
      };
    }

    const dist = Math.floor(drone.position.distanceTo(goalPos));
    return {
      status: "PLAYING",
      objective: `Portal TÍM đã mở! Bay tới đích (còn ${dist}m)`,
    };
  }

  function cleanup() {
    objects.forEach(obj => {
      scene.remove(obj);
      obj.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    objects.length = 0;
    gates.length = 0;
    currentGateIndex = 0;
    allGatesPassed = false;
    portalOuterMat = null;
    portalInnerMat = null;
    portalLight = null;
  }

  return { init, update, cleanup };
}
