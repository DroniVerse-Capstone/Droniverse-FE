"use client";

import Image from "next/image";

import CourseLevelBadge from "@/components/course/CourseLevelBadge";
import CourseStatusBadge from "@/components/course/CourseStatusBadge";
import { formatDateTime } from "@/lib/utils/format-date";
import { Course } from "@/validations/course/course";

type AdminCourseCardProps = {
  course: Course;
};

export default function AdminCourseCard({ course }: AdminCourseCardProps) {
  const version = course.currentVersion;
  const title = version?.titleVN || version?.titleEN || "Chưa có phiên bản";
  const imageUrl = version?.imageUrl || "/images/club-placeholder.jpg";
  const description =
    version?.descriptionVN ||
    version?.descriptionEN ||
    "Khóa học đang ở bản nháp, chưa có nội dung phiên bản hiện tại.";

  return (
    <article className="rounded border border-greyscale-700 bg-greyscale-900 p-4 shadow-sm">
      <div className="relative mb-3 h-42 overflow-hidden rounded border border-greyscale-700">
        <Image src={imageUrl} alt={title} fill className="object-cover" />
      </div>

      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {version?.level ? (
            <CourseLevelBadge level={version.level} />
          ) : (
            <CourseLevelBadge level="Chưa xác định" />
          )}
          <div className="inline-flex rounded px-2 py-1 text-xs font-medium bg-tertiary/15 text-tertiary border-2 border-tertiary/40">
            {version?.estimatedDuration ?? "Chưa xác định"} giờ
          </div>
        </div>
        <CourseStatusBadge status={course.status} />
      </div>

      <h3 className="mb-1 line-clamp-2 text-base font-semibold text-greyscale-0">
        {title}
      </h3>

      <p className="mb-4 line-clamp-3 text-sm text-greyscale-100">{description}</p>

      <div className="space-y-1 text-xs text-greyscale-100">
        <p>Cập nhật: {formatDateTime(version?.updateAt ?? null)}</p>
      </div>
    </article>
  );
}

export type { AdminCourseCardProps };