"use client";

import { WebSimulator } from "@/types/simulator";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import { MdOutlineTimer } from "react-icons/md";

type SelectSimulatorCardProps = {
  simulator: any;
  isSelected: boolean;
  disabled?: boolean;
  onSelect: (simulatorId: string) => void;
};

export default function SelectSimulatorCard({
  simulator,
  isSelected,
  disabled = false,
  onSelect,
}: SelectSimulatorCardProps) {
  const locale = useLocale();
  const t = useTranslations("CourseManagement.CourseSettings.CreateLessonDialog");

  const title =
    locale === "en" ? simulator.titleEN || simulator.titleVN : simulator.titleVN || simulator.titleEN || "-";

  const objectives =
    locale === "en"
      ? simulator.objectivesEN || simulator.objectivesVN
      : simulator.objectivesVN || simulator.objectivesEN || "";

  const simulatorId = simulator.webSimulatorID || simulator.vrSimulatorID;
  const simType = simulator.type || "VR";

  return (
    <button
      type="button"
      onClick={() => onSelect(simulatorId)}
      className={`text-left rounded border p-3 transition-colors ${isSelected
        ? "border-primary bg-primary/10"
        : "border-greyscale-700 bg-greyscale-900 hover:bg-greyscale-800"
        }`}
      disabled={disabled}
    >
      <div className="flex items-start gap-2">
        <p className="line-clamp-2 text-sm font-semibold text-greyscale-0">{title}</p>
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-greyscale-200">
        {objectives || t("fields.labNoDescription")}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded bg-secondary/15 px-2 py-1 text-xs font-medium text-secondary border border-secondary/40 uppercase">
          {t(`lessonTypes.${simType.toLowerCase()}`)}
        </span>

        <span className="inline-flex items-center gap-1 text-xs font-medium text-greyscale-300">
          <MdOutlineTimer size={14} />
          {simulator.estimatedTime || 0} {locale === "en" ? "min" : "phút"}
        </span>
      </div>
    </button>
  );
}

export type { SelectSimulatorCardProps };
