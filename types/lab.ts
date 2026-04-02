export type MapObject = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  modelUrl: string;
  scaleLimits?: { min: number; max: number };
  scalable?: boolean;
  rotatable?: boolean;
  collisionRadius?: number;
  isClamped?: boolean;
  color?: string;
  objectType?: "obstacle" | "bonus" | "checkpoint";
  scoreValue?: number;
  radius?: number;
};

export interface LabMap {
  cells: number;
  theme?: "default" | "space" | "sunset" | "daylight";
}

export interface LabRule {
  timeLimit: number;
  requiredScore: number;
  sequentialCheckpoints: boolean;
  maxBlocks?: number;
}

export interface LabContentData {
  objects: MapObject[];
  map: LabMap;
  rule: LabRule;
  hasSolution: boolean;
}

export type LabLevel = "EASY" | "MEDIUM" | "HARD";
export type LabType = "LEARNING" | "COMPETITION";
export type LabStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

export interface LabData {
  labID: string;
  nameVN: string;
  nameEN?: string;
  descriptionVN: string;
  descriptionEN?: string;
  estimatedTime?: number;
  level: LabLevel;
  type: LabType;
  status: LabStatus;
  labContent?: {
    environment: LabContentData;
  };
  createdAt?: string;
  updatedAt?: string;
  thumbnail?: string;
  isActive?: boolean;
}

export interface LabContent {
  id: string;
  environment: LabContentData;
}
