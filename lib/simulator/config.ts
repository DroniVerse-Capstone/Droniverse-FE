/**
 * Cấu hình TẬP TRUNG cho Drone Simulator.
 * TOÀN BỘ hằng số quan trọng (Tốc độ, Ảnh sáng, Drone, Bản đồ) đều nằm ở đây.
 * Dễ dàng quản lý, thay đổi và bảo trì.
 */
export const SIMULATOR_CONFIG = {
  // --- 1. CÀI ĐẶT DEBUG ---
  debug: {
    showBounds: true, // Để true để hiện khung va chạm (wireframes)
    logCollisions: true, // Ghi log "CRASH!" ra console khi va chạm
    showHUDExtras: false, // Hiện thêm thông số kỹ thuật trên HUD
  },

  // --- 2. VẬT LÝ & VA CHẠM ---
  physics: {
    droneRadius: 1.0, // Bán kính vùng va chạm của drone
    groundSafeHeight: 0.1, // Độ cao tối thiểu để cho phép bay ngang
    collisionPrecision: 20, // Độ chính xác: Càng nhỏ càng chuẩn nhưng tốn CPU (bước pixel)
    batteryConsumptionMultiplier: {
      linear: 0.05, // Tiêu thụ pin khi di chuyển thẳng
      angular: 0.02, // Tiêu thụ pin khi xoay
    },
  },

  // --- 3. TỐC ĐỘ BAY (Drone Speed) ---
  speed: {
    linear: 180, // Tốc độ bay thẳng (pixel/giây)
    angular: 150, // Tốc độ xoay (độ/giây)
  },

  // --- 4. THỜI GIAN & HIỆU ỨNG (Animation) ---
  animation: {
    minMs: 120, // Thời gian tối thiểu cho một bước di chuyển (milli giây)
    defaultMs: 300, // Thời gian mặc định
  },

  // --- 5. KHÔNG GIAN BẢN ĐỒ (World Setup) ---
  world: {
    canvas: {
      width: 4000, // Chiều rộng vùng bay
      height: 4000, // Chiều dài vùng bay
      padding: 50, // Lề an toàn
    },
    scale: {
      position: 0.1, // Tỉ lệ tọa độ X, Z (10 đơn vị simulator = 1 đơn vị Three.js)
      altitude: 0.1, // Tỉ lệ độ cao Y
    },
    initialState: {
      x: 2000,
      y: 2000,
      heading: 0,
      altitude: 0,
    }
  },

  // --- 6. HÌNH ẢNH DRONE (Visuals - Drone) ---
  droneVisuals: {
    colors: {
      fuselage: { color: "#38bdf8", emissive: "#0ea5e9", metalness: 0.4, roughness: 0.25 },
      nose: { color: "#67e8f9", emissive: "#06b6d4", roughness: 0.2, metalness: 0.6 },
      canopy: { color: "#e0f2fe", transparent: true, opacity: 0.8, roughness: 0.1, metalness: 0.8 },
      wings: { color: "#0f172a", metalness: 0.5, roughness: 0.4 },
      rotor: { color: "#bae6fd", emissive: "#67e8f9", roughness: 0.3 },
    },
    sizes: {
      fuselage: [1, 0.8, 2.5] as [number, number, number],
      nose: [0.5, 1.1, 30] as [number, number, number],
      nosePos: [0, 0, 1.65] as [number, number, number],
      canopy: [0.55, 16, 16] as [number, number, number],
      canopyPos: [0, 0.35, 0] as [number, number, number],
      wings: [3, 0.3, 1] as [number, number, number],
      wingsPos: [0, 0.05, 0] as [number, number, number],
      stabilizer: [1.2, 0.05, 0.4] as [number, number, number],
      stabilizerPos: [0, 0.3, -1.03] as [number, number, number],
      stabilizerRot: [0, 0, Math.PI / 2] as [number, number, number],
      rotor: [0.35, 0.35, 0.15, 16] as [number, number, number, number],
      rotorPos: [[-1.4, 0.45, -0.9], [-1.4, 0.45, 0.9], [1.4, 0.45, -0.9], [1.4, 0.45, 0.9]] as [number, number, number][],
    },
    float: {
      speed: 3,
      range: [-0.4, 0.6] as [number, number],
      rotationIntensity: 0.3,
      floatIntensity: 0.4,
    },
    rotorSpin: {
      flying: 10,
      idle: 0,
    },
    model: {
      useCustom: false,
      path: "/models/drone2.glb",
      scale: 3,
      pos: [0, 0, 0] as [number, number, number],
      rot: [0, 0, 0] as [number, number, number],
    }
  },

  // --- 7. HÌNH ẢNH MÔI TRƯỜNG (Visuals - Map) ---
  mapVisuals: {
    ambientColor: "#030712",
    colors: {
      ground: { color: "#030712", roughness: 0.9, metalness: 1 },
      grid: { sectionColor: "#0170A7", cellColor: "#86134dff" },
      border: { color: "#38bdf8", lineWidth: 4, opacity: 0.9, transparent: true },
    },
    grid: {
      cellSize: 10,
      cellThickness: 0.6,
      sectionThickness: 1.2,
      sectionSize: 20,
      infinite: false,
      fadeStrength: 0,
      pos: [0, 0.15, 0] as [number, number, number],
    },
    border: { height: 0.02 },
    terrain: { useCustom: false, path: "", scale: 1, pos: [0, 0, 0] as [number, number, number] }
  },

  // --- 8. ÁNH SÁNG (Lighting) ---
  lighting: {
    hemisphere: { sky: "#ffffff", ground: "#444444", intensity: 1.0, pos: [0, 1, 0] as [number, number, number] },
    ambient: { color: "#ffffff", intensity: 0.5, show: false },
    directional: {
      pos: [10, 10, 5] as [number, number, number],
      intensity: 1.0,
      color: "#ffffff",
      castShadow: true,
      shadowBias: -0.001
    },
    point: { intensity: 1.2, color: "#38bdf8", show: true },
    contactShadow: { pos: [0, 0, 0] as [number, number, number], opacity: 0.4, blur: 2.5, far: 1.5, show: true }
  },

  // --- 9. HIỆU NĂNG (Performance) ---
  performance: {
    dpr: [1, 1.5] as [number, number], // Giới hạn mật độ điểm ảnh (Retina/4K)
    antialiasing: true, // Tắt khử răng cưa nếu muốn FPS cao nhất
    powerPreference: "high-performance" as "high-performance" | "low-power" | "default",

    useSimpleTrail: false, // Dùng nét vẽ đơn giản (tắt CatmullRom) để tăng FPS
    trailMaxLength: 500, // Độ dài tối đa của đường bay
    sampleDistance: 0.15, // Khoảng cách giữa các điểm lấy mẫu đường bay
    lineWidth: 2, // Độ dày nét vẽ đường bay

    highQualityShadows: false, // Tắt để tăng FPS đáng kể khi xoay camera
    shadowRes: 1024, // Độ phân giải bóng (512, 1024, 2048)
  }
};
