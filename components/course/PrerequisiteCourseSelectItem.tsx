"use client";

import Image from "next/image";

import CourseLevelBadge from "@/components/course/CourseLevelBadge";
import { Course } from "@/validations/course/course";

type PrerequisiteCourseSelectItemProps = {
  course: Course;
  title: string;
  selected: boolean;
  disabled?: boolean;
  onToggle: (courseId: string) => void;
};

export default function PrerequisiteCourseSelectItem({
  course,
  title,
  selected,
  disabled,
  onToggle,
}: PrerequisiteCourseSelectItemProps) {
  const imageUrl = course.currentVersion?.imageUrl || "/images/club-placeholder.jpg";

  return (
    <button
      type="button"
      className={`w-full rounded border px-3 py-2 text-left text-sm transition-colors ${
        selected
          ? "border-secondary-300 bg-secondary/10 text-greyscale-0"
          : "border-greyscale-700 bg-greyscale-900 text-greyscale-100 hover:bg-greyscale-800"
      }`}
      onClick={() => onToggle(course.courseID)}
      disabled={disabled}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded border border-greyscale-700">
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="line-clamp-1 font-medium">{title}</span>
            <span className="text-xs text-greyscale-300">{selected ? "✓" : ""}</span>
          </div>

          <div className="flex items-center gap-2">
            {course.level ? <CourseLevelBadge level={course.level} /> : null}
          </div>
        </div>
      </div>
    </button>
  );
}
