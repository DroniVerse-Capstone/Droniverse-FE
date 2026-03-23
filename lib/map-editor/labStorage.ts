// import { MapObject, MissionSettings } from "@/components/map-editor/MapEditor";
// import { LabData, LabContentData } from "@/types/lab";

// const LABS_STORAGE_KEY = "droniverse_labs";

// export const labStorage = {
//   getLabs: (): LabData[] => {
//     if (typeof window === "undefined") return [];
//     try {
//       const stored = localStorage.getItem(LABS_STORAGE_KEY);
//       if (!stored) return [];

//       const parsed = JSON.parse(stored);

//       // Migration & Validation Logic
//       return parsed.map((lab: any): LabData => {
//         // If it's old format (has missionSettings), migrate it
//         if (lab.missionSettings) {
//           const rawDiff = (lab.missionSettings.difficulty || "easy").toUpperCase() as "EASY" | "MEDIUM" | "HARD";
//           const rawCat = (lab.missionSettings.category || "LEARNING") === "COMPETING" ? "COMPETITION" : "LEARNING";
//           const rawStatus = lab.isActive ? "ACTIVE" : "DRAFT";
//           const migrated: LabData = {
//             id: lab.id,
//             nameVN: lab.missionSettings.labName || "New Lab",
//             nameEN: lab.missionSettings.labNameEN || "",
//             descriptionVN: lab.missionSettings.description || "",
//             descriptionEN: lab.missionSettings.descriptionEN || "",
//             level: rawDiff,
//             type: rawCat,
//             status: rawStatus,
//             labContent: {
//               objects: lab.objects || [],
//               mapCells: lab.mapCells || 20,
//               timeLimit: lab.missionSettings.timeLimit || 0,
//               requiredScore: lab.missionSettings.requiredScore || 0,
//               sequentialCheckpoints: lab.missionSettings.sequentialCheckpoints || false,
//               hasSolution: lab.hasSolution || false,
//             },
//             createdAt: lab.createdAt || new Date().toISOString(),
//             updatedAt: lab.updatedAt || new Date().toISOString(),
//             thumbnail: lab.thumbnail,
//             isActive: lab.isActive,
//           };
//           return migrated;
//         }
//         return {
//           ...lab,
//           nameVN: lab.nameVN ?? lab.nameVT ?? "New Lab",
//           descriptionVN: lab.descriptionVN ?? lab.descriptionVT ?? "",
//           level: (lab.level ?? (lab.difficulty ? lab.difficulty.toUpperCase() : "EASY")) as "EASY" | "MEDIUM" | "HARD",
//           type: (lab.type ?? (lab.category === "COMPETING" ? "COMPETITION" : lab.category ?? "LEARNING")) as "LEARNING" | "COMPETITION",
//           status: (lab.status ? lab.status.toUpperCase() : "DRAFT") as "DRAFT" | "ACTIVE" | "INACTIVE",
//         };
//       });
//     } catch (e) {
//       console.error("Failed to parse labs from localStorage", e);
//       return [];
//     }
//   },

//   getLabById: (id: string): LabData | null => {
//     const labs = labStorage.getLabs();
//     return labs.find((l) => l.id === id) || null;
//   },

//   saveLab: (lab: Omit<LabData, "createdAt" | "updatedAt">): LabData => {
//     const labs = labStorage.getLabs();
//     const existingIndex = labs.findIndex((l) => l.id === lab.id);

//     const now = new Date().toISOString();
//     let updatedLab: LabData;

//     if (existingIndex > -1) {
//       updatedLab = {
//         ...labs[existingIndex],
//         ...lab,
//         updatedAt: now,
//       };
//       labs[existingIndex] = updatedLab;
//     } else {
//       updatedLab = {
//         ...lab,
//         createdAt: now,
//         updatedAt: now,
//       };
//       labs.push(updatedLab);
//     }

//     localStorage.setItem(LABS_STORAGE_KEY, JSON.stringify(labs));
//     return updatedLab;
//   },

//   deleteLab: (id: string): void => {
//     const labs = labStorage.getLabs();
//     const filtered = labs.filter((l) => l.id !== id);
//     localStorage.setItem(LABS_STORAGE_KEY, JSON.stringify(filtered));
//   },
// };
