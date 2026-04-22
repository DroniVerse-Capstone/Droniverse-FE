import React from "react";
import { BsQuestionCircle, BsHeadsetVr } from "react-icons/bs";
import { GoBook } from "react-icons/go";

import { LessonType } from "@/validations/lesson/lesson";
import { TbAtom, TbDrone, TbEngine } from "react-icons/tb";

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
};

export default function LessonTypeIcon({ type, className }: LessonTypeIconProps) {
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-greyscale-900 border border-greyscale-700 text-primary ${className || ""}`}
      title={type}
      aria-label={`Lesson type: ${type}`}
    >
      {iconByType[type]}
    </span>
  );
}

export type { LessonTypeIconProps };
