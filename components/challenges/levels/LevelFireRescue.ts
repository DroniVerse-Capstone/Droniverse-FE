import * as THREE from "three";
import { LevelInstance, LevelResult } from "./types";

const FIRE_COLOR = "#ff5500";
const WATER_COLOR = "#00d5ff";
const SMOKE_COLOR = "#111111";
const STEAM_COLOR = "#ffffff";
const MAX_WATER = 100;
const MAX_HEAT = 100;

interface FirePoint {
  position: THREE.Vector3;
  intensity: number;
  group: THREE.Group;
  fireParticles: THREE.Points;
  smokeParticles: THREE.Points;
  light: THREE.PointLight;
  glow: THREE.Mesh;
}

export function LevelFireRescue(scene: THREE.Scene, drone: THREE.Group): LevelInstance {
  const objects: THREE.Object3D[] = [];
  const fires: FirePoint[] = [];
  let waterAmount = 0;
  let heatLevel = 0;
  let time = 0;
  let isSpraying = false;
  let isRefilling = false;

  let waterSpray: THREE.Points;
  const sprayCount = 300; // Định nghĩa lại sprayCount
  let aimLine: THREE.Line;
  let impactEffect: THREE.Points;

  const waterStationPos = new THREE.Vector3(0, 1, -40);

  // Tạo tia nước 
  function createSprayAndAim() {
    // 1. Tia ngắm (Aim Line) - Làm đậm hơn một chút
    const aimGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -80)]);
    const aimMat = new THREE.LineBasicMaterial({ color: WATER_COLOR, transparent: true, opacity: 0.4 });
    aimLine = new THREE.Line(aimGeo, aimMat);
    scene.add(aimLine);
    objects.push(aimLine);

    // 2. Tia nước - Tăng số lượng hạt để nhìn dày hơn
    const sprayCount = 300;
    const sprayGeo = new THREE.BufferGeometry();
    const sprayPos = new Float32Array(sprayCount * 3);
    sprayGeo.setAttribute("position", new THREE.BufferAttribute(sprayPos, 3));
    const sprayMat = new THREE.PointsMaterial({
      color: WATER_COLOR,
      size: 0.8,
      transparent: true,
      opacity: 0.8,
      blending: THREE.NormalBlending
    });
    waterSpray = new THREE.Points(sprayGeo, sprayMat);
    waterSpray.visible = false;
    scene.add(waterSpray);
    objects.push(waterSpray);

    // 3. Hiệu ứng va chạm (Steam)
    const steamGeo = new THREE.BufferGeometry();
    const steamPos = new Float32Array(100 * 3);
    steamGeo.setAttribute("position", new THREE.BufferAttribute(steamPos, 3));
    const steamMat = new THREE.PointsMaterial({ color: STEAM_COLOR, size: 2.5, transparent: true, opacity: 0.6 });
    impactEffect = new THREE.Points(steamGeo, steamMat);
    impactEffect.visible = false;
    scene.add(impactEffect);
    objects.push(impactEffect);
  }

  // Tạo hiệu ứng lửa
  function createFireEffect(pos: THREE.Vector3): FirePoint {
    const group = new THREE.Group();
    group.position.copy(pos);

    // 1. LÕI LỬA VÀNG (Dạng khối to, rực rỡ)
    const coreParticles = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({
        color: "#ffff00",
        size: 7,
        transparent: true,
        blending: THREE.AdditiveBlending
      })
    );
    const cPos = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      cPos[i * 3] = (Math.random() - 0.5) * 6;
      cPos[i * 3 + 1] = Math.random() * 15;
      cPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    coreParticles.geometry.setAttribute("position", new THREE.BufferAttribute(cPos, 3));

    // 2. VỎ LỬA CAM (Lớp bao quanh tạo chiều sâu)
    const fireParticles = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({
        color: "#ff4400",
        size: 10,
        transparent: true,
        blending: THREE.AdditiveBlending
      })
    );
    const fPos = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      fPos[i * 3] = (Math.random() - 0.5) * 12;
      fPos[i * 3 + 1] = Math.random() * 25;
      fPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    fireParticles.geometry.setAttribute("position", new THREE.BufferAttribute(fPos, 3));

    // 3. KHÓI ĐEN DÀY
    const smokeParticles = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ color: "#000000", size: 15, transparent: true, opacity: 0.8 })
    );
    const sPos = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      sPos[i * 3] = (Math.random() - 0.5) * 15;
      sPos[i * 3 + 1] = Math.random() * 100;
      sPos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    smokeParticles.geometry.setAttribute("position", new THREE.BufferAttribute(sPos, 3));

    group.add(coreParticles); // Thêm lõi vàng
    group.add(fireParticles); // Thêm vỏ cam
    group.add(smokeParticles);

    const light = new THREE.PointLight("#ffaa00", 500, 300);
    light.position.y = 20;
    group.add(light);

    const markerGeo = new THREE.OctahedronGeometry(6, 0);
    const markerMat = new THREE.MeshBasicMaterial({ color: "#facc15", wireframe: true });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.y = 60;
    marker.name = "marker";
    group.add(marker);

    scene.add(group);
    objects.push(group);

    // Trả về một group rỗng làm glow để không lỗi logic update
    const dummyGlow = new THREE.Group();
    return { position: pos, intensity: 100, group, fireParticles, smokeParticles, light, glow: dummyGlow as any };
  }

  // Tạo khu vực tiếp nước
  function createWaterStation() {
    const group = new THREE.Group();
    group.position.copy(waterStationPos);

    // Bể chứa nước - Làm đẹp hơn
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(32, 4, 32),
      new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.2 })
    );
    group.add(base);

    const waterSurface = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 28),
      new THREE.MeshStandardMaterial({
        color: "#00aaff",
        emissive: "#0066ff",
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9,
        roughness: 0,
        metalness: 0.5
      })
    );
    waterSurface.rotation.x = -Math.PI / 2;
    waterSurface.position.y = 2.2;
    waterSurface.name = "waterSurface";
    group.add(waterSurface);

    const refillCount = 50;
    const refillGeo = new THREE.BufferGeometry();
    refillGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(refillCount * 3), 3));
    const refillMat = new THREE.PointsMaterial({ color: WATER_COLOR, size: 1.2, transparent: true, opacity: 0 });
    const refillParticles = new THREE.Points(refillGeo, refillMat);
    refillParticles.name = "refillParticles";
    group.add(refillParticles);

    scene.add(group);
    objects.push(group);
  }

  function init() {
    createSprayAndAim();
    const firePositions = [
      new THREE.Vector3(-40, 60, -120),  // Tòa 1: Trên nóc (Cao 60)
      new THREE.Vector3(55, 80, -300),   // Tòa 2: Trên nóc (Cao 80)
      new THREE.Vector3(-65, 70, -500),  // Tòa 3: Trên nóc (Cao 70)
    ];
    firePositions.forEach(pos => fires.push(createFireEffect(pos)));
    createWaterStation();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.code === "Space") isSpraying = true;
    if (e.code === "KeyR") isRefilling = true;
  }

  function handleKeyUp(e: KeyboardEvent) {
    if (e.code === "Space") isSpraying = false;
    if (e.code === "KeyR") isRefilling = false;
  }

  function update(delta: number): LevelResult {
    if (!drone) return { status: "PLAYING", objective: "" };
    time += delta;

    const distToWater = drone.position.distanceTo(waterStationPos);
    let isInRefillZone = distToWater < 25 && drone.position.y < 35;

    const stationGroup = objects.find(o => o.position.equals(waterStationPos)) as THREE.Group;
    const refillParticles = stationGroup?.getObjectByName("refillParticles") as THREE.Points;
    const waterSurface = stationGroup?.getObjectByName("waterSurface") as THREE.Mesh;

    if (waterSurface) {
      // Hiệu ứng gợn sóng giả bằng cách scale nhẹ mặt nước
      waterSurface.scale.setScalar(1 + Math.sin(time * 2) * 0.02);
      (waterSurface.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8 + Math.sin(time * 4) * 0.3;
    }

    if (isInRefillZone && isRefilling && waterAmount < 100) {
      waterAmount = Math.min(waterAmount + delta * 120, MAX_WATER); // Nạp nhanh hơn
      if (refillParticles) {
        refillParticles.visible = true;
        (refillParticles.material as THREE.PointsMaterial).opacity = 1;
        const refillArr = refillParticles.geometry.attributes.position.array as Float32Array;
        const droneLocalPos = drone.position.clone().sub(waterStationPos);
        for (let i = 0; i < 50; i++) {
          const t = ((time * 40 + i) % 40) / 40;
          refillArr[i * 3] = (Math.random() - 0.5) * 20 * (1 - t) + droneLocalPos.x * t;
          refillArr[i * 3 + 1] = 2 + (droneLocalPos.y - 2) * t;
          refillArr[i * 3 + 2] = (Math.random() - 0.5) * 20 * (1 - t) + droneLocalPos.z * t;
        }
        refillParticles.geometry.attributes.position.needsUpdate = true;
      }
    } else if (refillParticles) {
      (refillParticles.material as THREE.PointsMaterial).opacity = 0;
    }

    aimLine.position.copy(drone.position);
    aimLine.quaternion.copy(drone.quaternion);
    aimLine.visible = waterAmount > 0;

    impactEffect.visible = false;
    if (isSpraying && waterAmount > 0) {
      waterSpray.visible = true;
      waterAmount = Math.max(waterAmount - delta * 30, 0); // Phun tiết kiệm nước hơn

      const posArr = waterSpray.geometry.attributes.position.array as Float32Array;
      const droneForward = new THREE.Vector3(0, 0, -1).applyQuaternion(drone.quaternion);

      for (let i = 0; i < sprayCount; i++) {
        const t = (time * 80 + i) % 80;
        const offset = t * 0.8;
        // Thêm độ cong (gravity) cho tia nước
        const p = drone.position.clone().add(droneForward.clone().multiplyScalar(offset));
        p.y -= (offset * offset) * 0.005; // Cong xuống

        posArr[i * 3] = p.x + (Math.random() - 0.5) * 2;
        posArr[i * 3 + 1] = p.y + (Math.random() - 0.5) * 2 - 1;
        posArr[i * 3 + 2] = p.z + (Math.random() - 0.5) * 2;
      }
      waterSpray.geometry.attributes.position.needsUpdate = true;

      fires.forEach(f => {
        if (f.intensity <= 0) return;
        const toFire = f.position.clone().sub(drone.position);
        const dist = toFire.length();
        const dot = droneForward.dot(toFire.normalize());

        // DỄ CHƠI HƠN: Tăng dot range (góc bắn rộng hơn) và dist (bắn xa hơn)
        if (dot > 0.94 && dist < 80) {
          f.intensity = Math.max(f.intensity - delta * 120, 0); // Dập nhanh gấp đôi
          f.group.scale.setScalar(0.1 + 0.9 * (f.intensity / 100));
          f.glow.scale.setScalar(0.5 + 0.5 * (f.intensity / 100));

          impactEffect.visible = true;
          impactEffect.position.copy(f.position);
          const steamArr = impactEffect.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < 100; i++) {
            steamArr[i * 3] = (Math.random() - 0.5) * 20;
            steamArr[i * 3 + 1] = Math.random() * 25;
            steamArr[i * 3 + 2] = (Math.random() - 0.5) * 20;
          }
          impactEffect.geometry.attributes.position.needsUpdate = true;
          if (f.intensity <= 0) f.group.visible = false;
        }
      });
    } else {
      waterSpray.visible = false;
    }

    let nearFire = false;
    fires.forEach(f => {
      if (f.intensity <= 0) return;
      const dist = drone.position.distanceTo(f.position);
      if (dist < 40) { nearFire = true; heatLevel = Math.min(heatLevel + delta * 25, MAX_HEAT); }

      const marker = f.group.getObjectByName("marker");
      if (marker) { marker.rotation.y += delta * 2; marker.position.y = 60 + Math.sin(time * 3) * 5; }

      const fPos = f.fireParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 500; i++) {
        fPos[i * 3 + 1] += delta * 30;
        if (fPos[i * 3 + 1] > 20 * (f.intensity / 100)) fPos[i * 3 + 1] = 0;
      }
      f.fireParticles.geometry.attributes.position.needsUpdate = true;
    });

    if (!nearFire) heatLevel = Math.max(heatLevel - delta * 40, 0);

    if (heatLevel >= MAX_HEAT) return { status: "FAIL", message: "DRONE BỊ HỎNG DO QUÁ NHIỆT!" };

    const count = fires.filter(f => f.intensity > 0).length;

    // NẾU DẬP HẾT LỬA -> THẮNG LUÔN, KHÔNG KIỂM TRA GÌ NỮA
    if (count === 0) {
      return {
        status: "WIN",
        message: "CHÚC MỪNG! THÀNH PHỐ ĐÃ AN TOÀN!",
        objective: "NHIỆM VỤ HOÀN THÀNH"
      };
    }

    let instruction = "🔥 TÌM ĐÁM CHÁY (THEO DẤU VÀNG)";
    if (isInRefillZone && waterAmount < 100) instruction = "📢 NHẤN GIỮ [R] ĐỂ NẠP NƯỚC";
    else if (waterAmount <= 0) instruction = "🚨 HẾT NƯỚC! QUAY LẠI HỒ NƯỚC (TRẠM XANH)";
    else if (isSpraying) instruction = "🌊 ĐANG PHUN NƯỚC...";
    else instruction = "🎯 GIỮ [SPACE] ĐỂ PHUN NƯỚC";

    return {
      status: "PLAYING",
      objective: instruction,
      customState: { water: waterAmount, heat: heatLevel, fireCount: count }
    };
  }

  function cleanup() {
    objects.forEach(obj => scene.remove(obj));
    fires.length = 0;
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  }

  return { init, update, cleanup };
}
