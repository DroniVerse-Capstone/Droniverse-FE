import { create } from 'zustand';

export type DroneConnectionStatus = 'offline' | 'online' | 'running';

export type DiscoveredDrone = {
  droneId: string;
  online: boolean;
  armed: boolean;
  lastSeen: number;
};

interface DroneStore {
  droneId: string | null;
  status: DroneConnectionStatus;
  lastSeen: number;
  discoveredDrones: DiscoveredDrone[]; // [Bổ sung] Danh sách drone đã tìm thấy
  telemetry: {
    thr: number;
    pit: number;
    rol: number;
    yaw: number;
    alt: number;
  };
  setDroneId: (id: string | null) => void;
  setStatus: (status: DroneConnectionStatus) => void;
  updateTelemetry: (data: Partial<DroneStore['telemetry']>) => void;
  checkConnection: () => void;
  addDiscoveredDrone: (drone: Omit<DiscoveredDrone, 'lastSeen'>) => void; // [Bổ sung]
}

export const useDroneStore = create<DroneStore>((set, get) => ({
  droneId: null,
  status: 'offline',
  lastSeen: 0,
  discoveredDrones: [],
  telemetry: {
    thr: 0,
    pit: 0,
    rol: 0,
    yaw: 0,
    alt: 0,
  },
  setDroneId: (id) => set({ droneId: id }),
  setStatus: (status) => set({ status }),
  updateTelemetry: (data) => set((state) => ({
    telemetry: { ...state.telemetry, ...data },
    lastSeen: Date.now(),
    status: state.status === 'offline' ? 'online' : state.status
  })),
  checkConnection: () => {
    const { droneId, discoveredDrones, status, setStatus } = get();
    // [Fix] Chỉ timeout nếu đã chọn drone
    if (!droneId || status === 'offline') return;
    // Check lastSeen của drone đã chọn trong danh sách
    const selected = discoveredDrones.find(d => d.droneId === droneId);
    const lastSeen = selected?.lastSeen ?? 0;
    if (Date.now() - lastSeen > 10000) {
      console.log('[Store] Drone timeout - setting offline');
      setStatus('offline');
    }
  },
  // [Bổ sung] Upsert drone vào danh sách
  addDiscoveredDrone: (drone) => set((state) => {
    const exists = state.discoveredDrones.findIndex(d => d.droneId === drone.droneId);
    const updated = { ...drone, lastSeen: Date.now() };
    // Nếu drone này đang được chọn → cập nhật store-level lastSeen luôn
    const isSelected = state.droneId === drone.droneId;
    if (exists >= 0) {
      const list = [...state.discoveredDrones];
      list[exists] = updated;
      return { discoveredDrones: list, ...(isSelected ? { lastSeen: Date.now() } : {}) };
    }
    return { discoveredDrones: [...state.discoveredDrones, updated], ...(isSelected ? { lastSeen: Date.now() } : {}) };
  }),
}));
