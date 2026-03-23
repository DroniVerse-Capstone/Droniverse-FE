import { MapObject } from "@/components/map-editor/MapEditor";

export interface LabContentData {
  objects: MapObject[];
  mapCells: number;
  timeLimit: number;
  requiredScore: number;
  sequentialCheckpoints: boolean;
  hasSolution: boolean;
  mapTheme?: "default" | "space" | "sunset" | "daylight";
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
  labID: string;
  environment: LabContentData;
}
