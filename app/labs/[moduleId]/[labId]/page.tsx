import { notFound } from "next/navigation";
import DronePlayground from "@/components/DronePlayground";
import { findLabInModule, getModuleById } from "@/lib/labModules";

type LabDetailPageProps = {
  params: { moduleId: string; labId: string };
};

export default function LabDetailPage({ params }: LabDetailPageProps) {
  const module = getModuleById(params.moduleId);
  if (!module) {
    notFound();
  }
  const result = findLabInModule(module, params.labId);
  if (!result) {
    notFound();
  }
  const { lab } = result;

  return (
    <div className="min-h-svh bg-slate-950 text-slate-50">
      <DronePlayground
        allowedModes={["lab"]}
        lockedLevelId={lab.levelId}
        showLevelSelector={false}
        autoStartLab
        title={lab.title}
        backLink={{ href: `/labs/${module.id}`, label: "Quay lại module" }}
      />
    </div>
  );
}

