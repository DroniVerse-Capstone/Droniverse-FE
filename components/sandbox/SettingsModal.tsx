"use client";

import { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import type { SandboxColorConfig } from "@/hooks/useSandboxColors";
import { DEFAULT_DISPLAY_CONFIG, DisplayConfig } from "@/lib/config3D/displayDefaults";
import { DRONE_COLORS } from "@/lib/models3d/droneConfig";
import { MAP_COLORS, AMBIENT_COLOR } from "@/lib/models3d/mapConfig";
import DroneBody from "../simulator3d/DroneBody";
import GroundPlane from "../simulator3d/GroundPlane";
import { CAMERA_CONFIG, ORBIT_CONTROLS_CONFIG } from "@/lib/config3D/cameraConfig";
import { SIM_CANVAS, WORLD_SCALE_VALUE } from "@/lib/config3D/simConfig";

const DEFAULT_CONFIG: SandboxColorConfig = {
  drone: {
    fuselage: DRONE_COLORS.FUSELAGE.color,
    fuselageEmissive: DRONE_COLORS.FUSELAGE.emissive,
    nose: DRONE_COLORS.NOSE.color,
    noseEmissive: DRONE_COLORS.NOSE.emissive,
    canopy: DRONE_COLORS.CANOPY.color,
    wings: DRONE_COLORS.WINGS.color,
    rotor: DRONE_COLORS.ROTOR.color,
    rotorEmissive: DRONE_COLORS.ROTOR.emissive,
  },
  map: {
    ground: MAP_COLORS.GROUND.color,
    grid: MAP_COLORS.GRID.sectionColor,
    border: MAP_COLORS.BORDER.color,
  },
  ambient: AMBIENT_COLOR,
};

type TabId = "general" | "colors" | "simulation" | "display" | "camera";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  config: SandboxColorConfig;
  onSave: (config: SandboxColorConfig) => void;
  onReset: () => void;
  displayConfig?: DisplayConfig;
  onSaveDisplay?: (cfg: any) => void;
  onResetDisplay?: () => void;
};

export default function SettingsModal({
  isOpen,
  onClose,
  config,
  onSave,
  onReset,
  displayConfig,
  onSaveDisplay,
  onResetDisplay,
}: Props) {
  const [localConfig, setLocalConfig] = useState<SandboxColorConfig>(config);
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [localDisplayConfig, setLocalDisplayConfig] = useState<DisplayConfig>(
    () => displayConfig ?? { ...DEFAULT_DISPLAY_CONFIG }
  );

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
      setActiveTab("general");
      setLocalDisplayConfig(displayConfig ?? localDisplayConfig);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localConfig);
    if (onSaveDisplay) onSaveDisplay(localDisplayConfig);
    onClose();
  };

  const handleReset = () => {
    if (activeTab === "colors") {
      setLocalConfig(DEFAULT_CONFIG);
      onReset();
    } else if (activeTab === "display") {
      setLocalDisplayConfig({ ...DEFAULT_DISPLAY_CONFIG });
      if (onResetDisplay) onResetDisplay();
    } else {
      setLocalConfig(DEFAULT_CONFIG);
      onReset();
    }
  };

  const darkenColor = (hex: string, factor: number = 0.7): string => {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(
      0,
      Math.min(255, Math.floor(((num >> 16) & 0xff) * factor))
    );
    const g = Math.max(
      0,
      Math.min(255, Math.floor(((num >> 8) & 0xff) * factor))
    );
    const b = Math.max(0, Math.min(255, Math.floor((num & 0xff) * factor)));
    return `#${((1 << 24) | (r << 16) | (g << 8) | b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  };

  const updateDroneColor = (
    part: keyof SandboxColorConfig["drone"],
    value: string
  ) => {
    setLocalConfig((prev) => {
      const newDrone = { ...prev.drone, [part]: value };

      if (part === "fuselage") {
        newDrone.fuselageEmissive = darkenColor(value);
      } else if (part === "nose") {
        newDrone.noseEmissive = darkenColor(value);
      } else if (part === "rotor") {
        newDrone.rotorEmissive = darkenColor(value);
      }

      return {
        ...prev,
        drone: newDrone,
      };
    });
  };

  const updateMapColor = (
    part: keyof SandboxColorConfig["map"],
    value: string
  ) => {
    setLocalConfig((prev) => ({
      ...prev,
      map: { ...prev.map, [part]: value },
    }));
  };

  const updateAmbientColor = (value: string) => {
    setLocalConfig((prev) => ({ ...prev, ambient: value }));
  };

  const planeSize: [number, number] = [
    SIM_CANVAS.width * WORLD_SCALE_VALUE,
    SIM_CANVAS.height * WORLD_SCALE_VALUE,
  ];

  const previewDroneState = {
    position: [0, 2, 0] as [number, number, number],
    headingRad: 0,
    isFlying: true,
  };

  const tabs: Array<{ id: TabId; label: string; icon?: string }> = [
    { id: "general", label: "Tổng quan" },
    { id: "colors", label: "Màu sắc" },
    { id: "simulation", label: "Mô phỏng" },
    { id: "display", label: "Hiển thị" },
    { id: "camera", label: "Camera" },
  ];

  const isColorsTab = activeTab === "colors";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}
      style={{ zIndex: 9999 }}
    >
      <div
        className="w-[95vw] h-[90vh] max-w-7xl rounded-xl border border-slate-700/60 bg-slate-900 shadow-2xl overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 10000 }}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-700/40 bg-slate-800/95 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <span className="text-lg">⚙️</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white leading-tight">
                Cài đặt
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sandbox customization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors flex items-center justify-center text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5  py-2 border-b border-slate-700/40 bg-slate-800/50 flex items-center gap-1 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === tab.id
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/30"
                }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 flex overflow-hidden min-h-0 ${isColorsTab ? "flex-col md:flex-row" : "flex-col"
            }`}
        >
          <div
            className={`w-full ${isColorsTab ? "md:w-1/2 border-r border-slate-700/40" : ""
              } overflow-y-auto settings-scrollbar bg-slate-900/40`}
          >
            <div className="p-2.5 md:p-5">
              {activeTab === "general" && <GeneralTab />}
              {activeTab === "colors" && (
                <ColorsTab
                  localConfig={localConfig}
                  updateDroneColor={updateDroneColor}
                  updateMapColor={updateMapColor}
                  updateAmbientColor={updateAmbientColor}
                />
              )}
              {activeTab === "simulation" && <SimulationTab />}
              {activeTab === "display" && (
                <DisplayTab
                  localDisplayConfig={localDisplayConfig}
                  setLocalDisplayConfig={setLocalDisplayConfig}
                />
              )}
              {activeTab === "camera" && <CameraTab />}
            </div>
          </div>

          {activeTab === "colors" && (
            <div className="mt-2 md:mt-0 w-full md:w-1/2 bg-slate-950 relative border-t md:border-t-0 md:border-l border-slate-700/40 flex min-h-[220px]">
              <div className="absolute top-3 left-3 z-10 bg-slate-900/90 px-2.5 py-1.5 rounded-md border border-slate-700/40">
                <p className="text-[11px] text-cyan-400 font-medium">
                  Preview 3D
                </p>
              </div>
              <Canvas
                shadows
                camera={{
                  position: CAMERA_CONFIG.INITIAL_POSITION,
                  fov: CAMERA_CONFIG.FOV,
                  near: CAMERA_CONFIG.NEAR,
                  far: CAMERA_CONFIG.FAR,
                }}
                className="w-full h-full"
              >
                <color attach="background" args={[localConfig.ambient]} />
                <Suspense fallback={null}>
                  <GroundPlane
                    size={planeSize}
                    colorConfig={{
                      ground: localConfig.map.ground,
                      grid: localConfig.map.grid,
                      border: localConfig.map.border,
                    }}
                  />
                  <DroneBody
                    state={previewDroneState}
                    colorConfig={{
                      fuselage: localConfig.drone.fuselage,
                      fuselageEmissive: localConfig.drone.fuselageEmissive,
                      nose: localConfig.drone.nose,
                      noseEmissive: localConfig.drone.noseEmissive,
                      canopy: localConfig.drone.canopy,
                      wings: localConfig.drone.wings,
                      rotor: localConfig.drone.rotor,
                      rotorEmissive: localConfig.drone.rotorEmissive,
                    }}
                  />
                  <Environment preset="sunset" />
                </Suspense>
                <OrbitControls
                  enablePan={ORBIT_CONTROLS_CONFIG.ENABLE_PAN}
                  maxPolarAngle={ORBIT_CONTROLS_CONFIG.MAX_POLAR_ANGLE}
                  minDistance={ORBIT_CONTROLS_CONFIG.MIN_DISTANCE}
                  maxDistance={ORBIT_CONTROLS_CONFIG.MAX_DISTANCE}
                />
              </Canvas>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-700/40 bg-slate-800/95 flex items-center justify-between shrink-0">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-xs font-medium rounded-md bg-slate-700/60 text-slate-200 hover:bg-slate-700 transition-colors border border-slate-600/40"
          >
            Reset
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-md bg-slate-700/60 text-slate-200 hover:bg-slate-700 transition-colors border border-slate-600/40"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-medium rounded-md bg-cyan-600 text-white hover:bg-cyan-500 transition-colors shadow-sm shadow-cyan-500/20"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type ColorsTabProps = {
  localConfig: SandboxColorConfig;
  updateDroneColor: (
    part: keyof SandboxColorConfig["drone"],
    value: string
  ) => void;
  updateMapColor: (
    part: keyof SandboxColorConfig["map"],
    value: string
  ) => void;
  updateAmbientColor: (value: string) => void;
};

function ColorsTab({
  localConfig,
  updateDroneColor,
  updateMapColor,
  updateAmbientColor,
}: ColorsTabProps) {
  return (
    <div className="space-y-5">
      <section className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
        <div className="flex items-center gap-2 mb-3.5">
          <span className="text-base">🚁</span>
          <h3 className="text-base font-medium text-cyan-300">
            Màu sắc máy bay
          </h3>
        </div>
        <div className="space-y-2.5">
          <ColorPicker
            label="Thân chính"
            value={localConfig.drone.fuselage}
            onChange={(v) => updateDroneColor("fuselage", v)}
          />
          <ColorPicker
            label="Mũi"
            value={localConfig.drone.nose}
            onChange={(v) => updateDroneColor("nose", v)}
          />
          <ColorPicker
            label="Kính"
            value={localConfig.drone.canopy}
            onChange={(v) => updateDroneColor("canopy", v)}
          />
          <ColorPicker
            label="Cánh"
            value={localConfig.drone.wings}
            onChange={(v) => updateDroneColor("wings", v)}
          />
          <ColorPicker
            label="Cánh quạt"
            value={localConfig.drone.rotor}
            onChange={(v) => updateDroneColor("rotor", v)}
          />
        </div>
      </section>

      {/* Map Colors */}
      <section className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
        <div className="flex items-center gap-2 mb-3.5">
          <span className="text-base">🗺️</span>
          <h3 className="text-base font-medium text-cyan-300">
            Màu sắc bản đồ
          </h3>
        </div>
        <div className="space-y-2.5">
          <ColorPicker
            label="Mặt phẳng"
            value={localConfig.map.ground}
            onChange={(v) => updateMapColor("ground", v)}
          />
          <ColorPicker
            label="Lưới"
            value={localConfig.map.grid}
            onChange={(v) => updateMapColor("grid", v)}
          />
          <ColorPicker
            label="Viền"
            value={localConfig.map.border}
            onChange={(v) => updateMapColor("border", v)}
          />
        </div>
      </section>

      <section className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
        <div className="flex items-center gap-2 mb-3.5">
          <span className="text-base">🌌</span>
          <h3 className="text-base font-medium text-cyan-300">Màu nền</h3>
        </div>
        <ColorPicker
          label="Nền"
          value={localConfig.ambient}
          onChange={updateAmbientColor}
        />
      </section>
    </div>
  );
}

function GeneralTab() {
  return (
    <div className="space-y-5">
      <section className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
        <h3 className="text-base font-medium text-cyan-300 mb-3">
          Cài đặt chung
        </h3>
        <div className="space-y-3 text-sm text-slate-300">
          <p>Chào mừng đến với Settings!</p>
          <p className="text-xs text-slate-400">
            Chọn tab bên trên để cấu hình các tùy chọn khác nhau.
          </p>
        </div>
      </section>

      <section className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
        <h3 className="text-base font-medium text-cyan-300 mb-3">Thông tin</h3>
        <div className="space-y-2 text-xs text-slate-400">
          <p>• Màu sắc: Tùy chỉnh màu sắc cho mô phỏng Sandbox</p>
          <p>• Mô phỏng: Điều chỉnh tốc độ và hiệu ứng</p>
          <p>• Hiển thị: Bật/tắt grid, HUD, shadows</p>
          <p>• Camera: Cấu hình góc nhìn và zoom</p>
        </div>
      </section>
    </div>
  );
}

// Component cho tab Mô phỏng
function SimulationTab() {
  return (
    <div className="space-y-5">
      <section className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
        <h3 className="text-base font-medium text-cyan-300 mb-3.5">
          Tốc độ mô phỏng
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-400">Tốc độ di chuyển</label>
            <span className="text-xs text-slate-300">140 px/s</span>
          </div>
          <input
            type="range"
            min="50"
            max="300"
            defaultValue="140"
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Chậm</span>
            <span>Nhanh</span>
          </div>
        </div>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-400">Tốc độ xoay</label>
            <span className="text-xs text-slate-300">180°/s</span>
          </div>
          <input
            type="range"
            min="90"
            max="360"
            defaultValue="180"
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Tính năng đang phát triển...
        </p>
      </section>

      <section className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
        <h3 className="text-base font-medium text-cyan-300 mb-3.5">
          Hiệu ứng drone
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 p-2 rounded border border-slate-700/30 hover:bg-slate-700/20 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="text-cyan-500 rounded"
            />
            <span className="text-xs text-slate-300">Hiệu ứng bay lơ lửng</span>
          </label>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Tính năng đang phát triển...
        </p>
      </section>
    </div>
  );
}

function DisplayTab({
  localDisplayConfig,
  setLocalDisplayConfig,
}: {
  localDisplayConfig: any;
  setLocalDisplayConfig: (v: any) => void;
}) {
  return (
    <div className="space-y-5">
      <section className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
        <h3 className="text-base font-medium text-cyan-300 mb-3.5">Hiển thị</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 p-2 rounded border border-slate-700/30 hover:bg-slate-700/20 cursor-pointer">
            <input
              type="checkbox"
              checked={!!localDisplayConfig?.trailEnabled}
              onChange={(e) =>
                setLocalDisplayConfig((prev: any) => ({
                  ...prev,
                  trailEnabled: e.target.checked,
                }))
              }
              className="text-cyan-500 rounded"
            />
            <span className="text-xs text-slate-300">Hiển thị đường đi (Trail)</span>
          </label>

          {localDisplayConfig?.trailEnabled && (
            <div className="pl-6 space-y-2 mt-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 w-28">Màu đường</label>
                <input
                  type="color"
                  value={localDisplayConfig.trailColor}
                  onChange={(e) =>
                    setLocalDisplayConfig((prev: any) => ({
                      ...prev,
                      trailColor: e.target.value,
                    }))
                  }
                  className="w-10 h-8 rounded border border-slate-600/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 w-28">Độ dài</label>
                <input
                  type="range"
                  min={50}
                  max={300}
                  value={localDisplayConfig.trailMaxLength ?? 500}
                  onChange={(e) =>
                    setLocalDisplayConfig((prev: any) => ({
                      ...prev,
                      trailMaxLength: Number(e.target.value),
                    }))
                  }
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-xs text-slate-300 w-12 text-right">
                  {localDisplayConfig.trailMaxLength ?? 500}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 w-28">Độ mượt</label>
                <input
                  type="checkbox"
                  checked={!!localDisplayConfig.smoothing}
                  onChange={(e) =>
                    setLocalDisplayConfig((prev: any) => ({
                      ...prev,
                      smoothing: e.target.checked,
                    }))
                  }
                  className="text-cyan-500 rounded"
                />
                <span className="text-xs text-slate-400">Làm mượt quỹ đạo</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 w-28">Fade</label>
                <input
                  type="checkbox"
                  checked={!!localDisplayConfig.fade}
                  onChange={(e) =>
                    setLocalDisplayConfig((prev: any) => ({
                      ...prev,
                      fade: e.target.checked,
                    }))
                  }
                  className="text-cyan-500 rounded"
                />
                <span className="text-xs text-slate-400">Mờ dần theo thời gian</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 w-28">Độ lấy mẫu</label>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={Math.round((localDisplayConfig.sampleDistance ?? 0.15) * 100)}
                  onChange={(e) =>
                    setLocalDisplayConfig((prev: any) => ({
                      ...prev,
                      sampleDistance: Number(e.target.value) / 100,
                    }))
                  }
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-xs text-slate-300 w-12 text-right">
                  {(localDisplayConfig.sampleDistance ?? 0.15).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 w-28">Độ dày</label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={localDisplayConfig.lineWidth}
                  onChange={(e) =>
                    setLocalDisplayConfig((prev: any) => ({
                      ...prev,
                      lineWidth: Number(e.target.value),
                    }))
                  }
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-xs text-slate-300 w-12 text-right">
                  {localDisplayConfig.lineWidth}
                </span>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Tùy chỉnh đường đi của drone (trail).
        </p>
      </section>
    </div>
  );
}

// Component cho tab Camera
function CameraTab() {
  return (
    <div className="space-y-5">
      <section className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
        <h3 className="text-base font-medium text-cyan-300 mb-3.5">
          Điều khiển camera
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 p-2 rounded border border-slate-700/30 hover:bg-slate-700/20 cursor-pointer">
            <input type="checkbox" className="text-cyan-500 rounded" />
            <span className="text-xs text-slate-300">
              Cho phép pan (di chuyển camera)
            </span>
          </label>
        </div>
      </section>

      <section className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
        <h3 className="text-base font-medium text-cyan-300 mb-3.5">
          Giới hạn zoom
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-400">Zoom tối thiểu</label>
            <span className="text-xs text-slate-300">18</span>
          </div>
          <input
            type="range"
            min="10"
            max="30"
            defaultValue="18"
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-400">Zoom tối đa</label>
            <span className="text-xs text-slate-300">150</span>
          </div>
          <input
            type="range"
            min="100"
            max="200"
            defaultValue="150"
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Tính năng đang phát triển...
        </p>
      </section>
    </div>
  );
}

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2.5">
      <label className="text-xs text-slate-400 w-20 shrink-0 font-normal">
        {label}
      </label>
      <div className="flex items-center gap-2 flex-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-8 rounded border border-slate-600/50 cursor-pointer hover:border-cyan-400/60 transition-colors"
        />
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 w-full px-2.5 py-1.5 rounded border border-slate-700/50 bg-slate-800/50 text-white text-xs font-mono focus:outline-none focus:border-cyan-400/60 focus:bg-slate-800 transition-colors"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
