import { LevelFactory } from "./types";
import { LevelObstacleRun } from "./LevelObstacleRun";
import { LevelRingRun } from "./LevelRingRun";
import { LevelBasicFlight } from "./LevelBasicFlight";

export const LevelRegistry: Record<string, LevelFactory> = {
  basic_flight: LevelBasicFlight,
  obstacle_run: LevelObstacleRun,
  ring_run: LevelRingRun,
};

export const LevelEnvironments: Record<string, "DAY" | "NIGHT" | "SPACE" | "INDUSTRIAL"> = {
  basic_flight: "DAY",
  obstacle_run: "INDUSTRIAL",
  ring_run: "SPACE",
};

export interface LabData {
  id: string;
  title: string;
  levelCode: string;
  droneType: string;
  timeLimit: number;
  objective: string;
  environmentType?: "DAY" | "NIGHT" | "SPACE" | "INDUSTRIAL";
}

export const mockLabs: Record<string, LabData> = {
  // BÀI 1: CƠ BẢN
  "550e8400-e29b-41d4-a716-446655440000": {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Bài 1: Tập cất cánh và hạ cánh",
    levelCode: "basic_flight",
    droneType: "quadcopter_basic",
    timeLimit: 120,
    objective: "Cất cánh lên độ cao 5m và bay vào vòng tròn xanh trước mặt",
    environmentType: "DAY"
  },
  // BÀI 2: TRUNG BÌNH
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8": {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    title: "Bài 2: Vượt chướng ngại vật",
    levelCode: "obstacle_run",
    droneType: "quadcopter_basic",
    timeLimit: 180,
    objective: "Vượt qua các cổng Cyber và thanh chắn xoay để tới Portal đích tại độ cao 50m",
    environmentType: "INDUSTRIAL"
  },
  // BÀI 3: NÂNG CAO
  "7c9e6679-7425-40de-944b-e07fc1f90ae7": {
    id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    title: "Bài 3: Hành trình qua các vòng",
    levelCode: "ring_run",
    droneType: "quadcopter_basic",
    timeLimit: 240,
    objective: "Hoàn thành chặng bay phức tạp qua nhiều điểm nút",
    environmentType: "SPACE"
  }
};
