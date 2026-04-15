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
  objectType?: "obstacle" | "bonus" | "checkpoint" | "pattern";
  scoreValue?: number;
  radius?: number;
  // Flight Pattern specific fields
  shape?: "square" | "rectangle" | "circle" | "zigzag" | "custom";
  width?: number;
  height?: number;
  points?: { x: number; z: number }[];
  tolerance?: number;
  showGuide?: boolean;
  requireClockwise?: boolean;
  hiddenUntilRun?: boolean;
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
  fuelLimit?: number;
}

export interface LabSolution {
  xml: string;
  metrics: {
    timeSpent: number;
    fuelConsumed: number;
    logicalDistance: number;
    blockCount: number;
  };
}

export interface LabContentData {
  objects: MapObject[];
  map: LabMap;
  rule: LabRule;
  hasSolution: boolean;
  solution?: LabSolution;
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
  creator?: {
    userId: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface LabContent {
  id: string;
  environment: LabContentData;
}

export interface StudentLabDetail {
  lab: LabData;
  labContent: LabContent;
  userLab: {
    id: string;
    enrollmentID: string;
    labID: string;
    status: string;
    score: number;
    solution: LabSolution;
    createAt: string;
    updateAt: string;
  } | null;
}

export interface StudentLabResponse {
  data: StudentLabDetail;
  isSuccess: boolean;
  message: string;
}
