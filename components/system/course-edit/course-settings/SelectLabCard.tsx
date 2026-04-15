"use client";

import { LabData } from "@/types/lab";
import { useLocale, useTranslations } from "@/providers/i18n-provider";

type SelectLabCardProps = {
  lab: LabData;
  isSelected: boolean;
  disabled?: boolean;
  onSelect: (labId: string) => void;
};

export default function SelectLabCard({
  lab,
  isSelected,
  disabled = false,
  onSelect,
}: SelectLabCardProps) {
  const locale = useLocale();
  const t = useTranslations("CourseManagement.CourseSettings.CreateLessonDialog");

  const labName =
    locale === "en" ? lab.nameEN || lab.nameVN : lab.nameVN || lab.nameEN || "-";

  const labDescription =
    locale === "en"
      ? lab.descriptionEN || lab.descriptionVN
      : lab.descriptionVN || lab.descriptionEN || "";

  const levelLabelMap = {
    EASY: { vi: "Cơ bản", en: "Easy" },
    MEDIUM: { vi: "Trung bình", en: "Medium" },
    HARD: { vi: "Nâng cao", en: "Hard" },
  } as const;

  const levelBadgeClassMap = {
    EASY: "bg-tertiary/15 text-tertiary border border-tertiary/40",
    MEDIUM: "bg-warning/15 text-warning border border-warning/40",
    HARD: "bg-primary/15 text-primary border border-primary/40",
  } as const;

  const levelLabel =
    locale === "en"
      ? levelLabelMap[lab.level]?.en || lab.level
      : levelLabelMap[lab.level]?.vi || lab.level;

  return (
    <button
      type="button"
      onClick={() => onSelect(lab.labID)}
      className={`text-left rounded border p-3 transition-colors ${
        isSelected
          ? "border-primary bg-primary/10"
          : "border-greyscale-700 bg-greyscale-900 hover:bg-greyscale-800"
      }`}
      disabled={disabled}
    >
      <div className="flex items-start gap-2">
        <p className="line-clamp-2 text-sm font-semibold text-greyscale-0">{labName}</p>
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-greyscale-200">
        {labDescription || t("fields.labNoDescription")}
      </p>

      <div className="mt-3 flex items-center justify-start">
        <span
          className={`inline-flex rounded px-2 py-1 text-xs font-medium ${levelBadgeClassMap[lab.level]}`}
        >
          {levelLabel}
        </span>
      </div>
    </button>
  );
}

export type { SelectLabCardProps };
