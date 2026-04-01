import { LabData } from "@/types/lab";

export interface LabValidation {
  hasDrone: boolean;
  hasObjects: boolean;
  hasRules: boolean;
  hasSolution: boolean;
  isValid: boolean;
}

export const getLabValidation = (lab: LabData): LabValidation => {
  const content = lab.labContent || (lab as any).mapData; // Fallback for transition
  if (!content) return { hasDrone: false, hasObjects: false, hasRules: false, hasSolution: false, isValid: false };
  console.log(content)
  const hasDrone = content.environment.objects?.some((o: any) => o.modelUrl === "primitive:drone") || false;
  const hasObjects = (content.environment.objects?.length || 0) > (hasDrone ? 1 : 0);
  const hasRules = (content.environment.rule?.requiredScore > 0 || content.environment.objects?.some((o: any) => o.objectType === 'checkpoint')) && (content.environment.rule?.timeLimit ?? 0) > 0;
  const hasSolution = (content.environment.hasSolution === true) || (content.environment.rule as any)?.hasSolution === true;
  console.log(getLabValidation)
  return {
    hasDrone,
    hasObjects,
    hasRules,
    hasSolution,
    isValid: hasDrone && hasObjects && hasRules && hasSolution
  };
};
