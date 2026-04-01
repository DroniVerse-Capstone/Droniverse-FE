"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import CourseLevelBadge from "@/components/course/CourseLevelBadge";
import CourseStatusBadge from "@/components/course/CourseStatusBadge";
import { formatDateTime } from "@/lib/utils/format-date";
import { slugify } from "@/lib/utils/slugify";
import { Course } from "@/validations/course/course";
import { useLocale, useTranslations } from "@/providers/i18n-provider";

type AdminCourseCardProps = {
  course: Course;
};

export default function AdminCourseCard({ course }: AdminCourseCardProps) {
  const t = useTranslations("CourseManagement.AdminCourseCard");
  const locale = useLocale();
  const router = useRouter();
  const version = course.currentVersion;
  const title = locale === "en" ? version?.titleEN || version?.titleVN || t("title") : version?.titleVN || version?.titleEN || t("title");
  const titleVN = version?.titleVN || "";
  const titleEN = version?.titleEN || "";
  const courseSlug = `${slugify(title)}-${course.courseID}`;
  const imageUrl = version?.imageUrl || "/images/club-placeholder.jpg";
  const description = locale === "en" ? version?.descriptionEN || version?.descriptionVN || t("description") : version?.descriptionVN || version?.descriptionEN || t("description");
  const creatorDisplay = course.creator?.fullName
    ? `${course.creator.fullName}${course.creator.email ? ` (${course.creator.email})` : ""}`
    : course.creator?.email || "—";
  const updaterDisplay = version?.updater?.fullName
    ? `${version.updater.fullName}${version.updater.email ? ` (${version.updater.email})` : ""}`
    : version?.updater?.email || "—";

  return (
    <article
      className="cursor-pointer rounded border border-greyscale-700 bg-greyscale-900 p-4 shadow-sm hover:bg-greyscale-800 transition-colors"
      onClick={() =>
        router.push(
          `/course-management/${courseSlug}?titleVN=${encodeURIComponent(titleVN)}&titleEN=${encodeURIComponent(titleEN)}`,
        )
      }
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(
            `/course-management/${courseSlug}?titleVN=${encodeURIComponent(titleVN)}&titleEN=${encodeURIComponent(titleEN)}`,
          );
        }
      }}
    >
      <div className="relative mb-3 h-42 overflow-hidden rounded border border-greyscale-700">
        <Image src={imageUrl} alt={title} fill className="object-cover" />
      </div>

      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {version?.level ? (
            <CourseLevelBadge level={version.level} />
          ) : null}
          <div className="inline-flex rounded px-2 py-1 text-xs font-medium bg-tertiary/15 text-tertiary border-2 border-tertiary/40">
            {version?.estimatedDuration ?? t("unknown")} {t("min")}
          </div>
        </div>
        <CourseStatusBadge status={course.status} />
      </div>

      <h3 className="mb-1 line-clamp-2 text-base font-semibold text-greyscale-0">
        {title}
      </h3>

      <p className="mb-4 line-clamp-3 text-sm text-greyscale-100">{description}</p>

      <div className="mt-3 space-y-1.5 border-t border-greyscale-700 pt-2 text-xs">
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 line-clamp-1 text-greyscale-100">
            <span className="text-greyscale-300">{t("creator")}:</span> {creatorDisplay}
          </span>
          <span className="shrink-0 text-greyscale-300">{formatDateTime(course.createAt ?? null)}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 line-clamp-1 text-greyscale-100">
            <span className="text-greyscale-300">{t("updater")}:</span> {updaterDisplay}
          </span>
          <span className="shrink-0 text-greyscale-300">
            {formatDateTime(version?.updateAt ?? null)}
          </span>
        </div>
      </div>
    </article>
  );
}

export type { AdminCourseCardProps };