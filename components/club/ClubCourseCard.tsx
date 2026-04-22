"use client";

import Image from "next/image";
import { Star } from "lucide-react";

import CourseLevelBadge from "@/components/course/CourseLevelBadge";
import { useAuthStore } from "@/stores/auth-store";
import { ClubCourse } from "@/validations/club/club-course";
import { IoMdPeople } from "react-icons/io";
import { useLocale, useTranslations } from "@/providers/i18n-provider";

type ClubCourseCardProps = {
  course: ClubCourse;
  onClick?: () => void;
};

const formatVnd = (value: number) => `${value.toLocaleString("vi-VN")} VND`;

export default function ClubCourseCard({
  course,
  onClick,
}: ClubCourseCardProps) {
  const t = useTranslations("ClubCourseCard");
  // const roleName = useAuthStore((state) => state.user?.roleName);
  const locale = useLocale();

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded border border-greyscale-700 bg-greyscale-900 p-4 shadow-sm transition-colors hover:bg-greyscale-800"
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="relative mb-3 h-42 overflow-hidden rounded border border-greyscale-700">
        <Image
          src={course.imageUrl || "/images/club-placeholder.jpg"}
          alt={locale === "vi" ? course.titleVN : course.titleEN}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <CourseLevelBadge level={course.level} />
          <span className="inline-flex rounded px-2 py-1 text-xs font-medium bg-tertiary/15 text-tertiary border-2 border-tertiary">
            {course.estimatedDuration} {t("minutes")}
          </span>
        </div>

        <h3 className="min-h-12 line-clamp-2 text-base leading-6 font-semibold text-greyscale-0">
          {locale === "vi" ? course.titleVN : course.titleEN}
        </h3>

        <div className="flex items-end justify-between gap-3">
          <p className="text-lg font-bold leading-none text-primary">
            {formatVnd(course.price)}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-greyscale-700 pt-2 text-sm text-greyscale-25">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{course.rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-2">
            <IoMdPeople size={20} className="text-primary" />
            <span className="font-medium">
              {course.numberOfParticipants} {t("learners")}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export type { ClubCourseCardProps };
