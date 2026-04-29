import React from "react";
import { BsQuestionCircle, BsHeadsetVr } from "react-icons/bs";
import { GoBook } from "react-icons/go";

import { LessonType } from "@/validations/lesson/lesson";
import { TbAtom, TbDrone, TbEngine } from "react-icons/tb";
import { cn } from "@/lib/utils";
import { MdAssignment } from "react-icons/md";

type LessonTypeIconProps = {
  type: LessonType;
  className?: string;
};

const iconByType: Record<LessonType, React.ReactNode> = {
  THEORY: <GoBook size={18} />,
  QUIZ: <BsQuestionCircle size={18} />,
  LAB: <TbDrone size={18} />,
  PHYSIC: <TbEngine size={18} />,
  LAB_PHYSIC: <TbAtom size={18} />,
  VR: <BsHeadsetVr size={18} />,
  ASSIGNMENT: <MdAssignment size={18} />
};

const colorByType: Record<LessonType, { bg: string; text: string; border: string }> = {
  THEORY: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  QUIZ: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  LAB: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  PHYSIC: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  LAB_PHYSIC: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  VR: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  ASSIGNMENT: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
};

export default function LessonTypeIcon({ type, className }: LessonTypeIconProps) {
  const colors = colorByType[type] || { bg: "bg-greyscale-900", text: "text-primary", border: "border-greyscale-700" };

  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all",
        colors.bg,
        colors.text,
        colors.border,
        className
      )}
      title={type}
      aria-label={`Lesson type: ${type}`}
    >
      {iconByType[type]}
    </span>
  );
}

export type { LessonTypeIconProps };
