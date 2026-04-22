import * as THREE from "three";

export type LevelStatus = "PLAYING" | "WIN" | "FAIL";

export interface LevelResult {
  status: LevelStatus;
  message?: string;
  objective?: string;
}

export interface LevelInstance {
  init: () => void;
  update: (delta: number) => LevelResult;
  cleanup: () => void;
}

export type LevelFactory = (scene: THREE.Scene, drone: THREE.Group) => LevelInstance;
