import { LabData } from "@/types/lab";

export interface LabValidation {
  hasDrone: boolean;
  hasObjects: boolean;
  hasRules: boolean;
  hasSolution: boolean;
  isValid: boolean;
}

export const getLabValidation = (lab: LabData): LabValidation => {
  const content = lab.labContent || (lab as any).mapData;
  if (!content) return { hasDrone: false, hasObjects: false, hasRules: false, hasSolution: false, isValid: false };

  const objects = content.environment.objects || [];
  const rule = content.environment.rule || {};

  const hasDrone = objects.some((o: any) => o.modelUrl === "primitive:drone");
  const hasObjects = objects.length > (hasDrone ? 1 : 0);

  const hasGoals = (rule.requiredScore > 0) || objects.some((o: any) => o.objectType === 'checkpoint');

  const hasRules = (rule.timeLimit > 0) || (rule.maxBlocks > 0) || hasGoals;
  const hasSolution = (content.environment.hasSolution === true) || (rule as any)?.hasSolution === true;

  return {
    hasDrone,
    hasObjects,
    hasRules,
    hasSolution,
    isValid: hasDrone && hasGoals && hasSolution
  };
};
