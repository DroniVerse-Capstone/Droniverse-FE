import { Battery, Camera, Cpu, Crosshair, Fan, Settings, ShieldAlert, Zap } from "lucide-react";

export type DronePartId = 'motor' | 'propeller' | 'battery' | 'frame' | 'camera' | 'flight_controller';

export interface DronePartData {
  id: DronePartId;
  name: string;
  function: string;
  importance: string;
  icon: any;
}

export const DRONE_PARTS: DronePartData[] = [
  {
    id: "frame",
    name: "Khung máy bay (Frame)",
    function: "Đóng vai trò như bộ xương, giữ và cố định tất cả các linh kiện khác.",
    importance: "Khung carbon cứng cáp giúp giảm rung lắc, chịu lực tốt khi va đập và đảm bảo drone bay ổn định.",
    icon: Crosshair
  },
  {
    id: "motor",
    name: "Động cơ không chổi than (Motor)",
    function: "Chuyển hóa điện năng thành chuyển động xoay để quay cánh quạt.",
    importance: "Động cơ KV cao cho phép thay đổi vòng quay cực nhanh, tạo lực đẩy mạnh mẽ để nhào lộn và giữ thăng bằng.",
    icon: Settings
  },
  {
    id: "propeller",
    name: "Cánh quạt (Propellers)",
    function: "Đẩy không khí xuống dưới khi quay, tạo ra lực nâng (Thrust) cho drone.",
    importance: "Độ nghiêng (pitch) và chiều dài cánh quyết định hiệu suất bay, tốc độ và lực nâng tối đa.",
    icon: Fan
  },
  {
    id: "flight_controller",
    name: "Mạch cân bằng (FC)",
    function: "Là 'bộ não' của drone. Đọc dữ liệu từ cảm biến góc nghiêng (Gyro) để tự động cân bằng.",
    importance: "Tính toán và gửi lệnh cho 4 động cơ hàng ngàn lần mỗi giây để giữ drone không bị lật.",
    icon: Cpu
  },
  {
    id: "battery",
    name: "Pin LiPo",
    function: "Cung cấp dòng điện xả cực cao cho động cơ và toàn bộ hệ thống.",
    importance: "Quyết định thời gian bay và sức mạnh của drone. Cần cân bằng giữa dung lượng (thời gian bay) và trọng lượng.",
    icon: Battery
  },
  {
    id: "camera",
    name: "Camera FPV",
    function: "Quay video góc rộng và truyền hình ảnh trực tiếp về kính của phi công.",
    importance: "Độ trễ hình ảnh cực thấp, giúp người lái quan sát và điều khiển chính xác khi bay tốc độ cao.",
    icon: Camera
  }
];
