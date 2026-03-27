"use client";

import React from "react";

import CourseLevelBadge from "@/components/course/CourseLevelBadge";
import CourseVersionStatusBadge from "@/components/course/CourseVersionStatusBadge";
import UpdateCourseVersionDialog from "@/components/system/course-edit/UpdateCourseVersionDialog";
import { Empty } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/utils/format-date";
import { useLocale } from "@/providers/i18n-provider";
import { CourseVersion } from "@/validations/course-version/course-version";
import Image from "next/image";

type CourseInfoTabProps = {
  selectedVersionId?: string;
  isVersionFetching: boolean;
  courseId: string;
  courseCreateAt: string;
  courseCreator?: {
    fullName: string;
    email: string;
  } | null;
  version?: CourseVersion;
};

export default function CourseInfoTab({
  selectedVersionId,
  isVersionFetching,
  courseId,
  courseCreateAt,
  courseCreator,
  version,
}: CourseInfoTabProps) {
  const locale = useLocale();

  if (!selectedVersionId || (isVersionFetching && !version)) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded border border-greyscale-700 bg-greyscale-900 p-4">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  if (!version) {
    return (
      <Empty>
        <p className="text-sm text-muted-foreground">
          Không có dữ liệu phiên bản khóa học.
        </p>
      </Empty>
    );
  }

  const title =
    locale === "en"
      ? version.titleEN || version.titleVN || "Untitled course"
      : version.titleVN || version.titleEN || "Khóa học chưa có tiêu đề";
  const description =
    locale === "en"
      ? version.descriptionEN || version.descriptionVN || "No description"
      : version.descriptionVN || version.descriptionEN || "Chưa có mô tả";
  const contextLabel = locale === "en" ? "Context" : "Nội dung";
  const localizedContext =
    locale === "en"
      ? version.contextEN || version.contextVN || "<p>—</p>"
      : version.contextVN || version.contextEN || "<p>—</p>";
  const hasChangeLog = Boolean(version.changeLog?.trim());
  const canUpdateVersion = version.status === "DRAFT" || version.status === "INACTIVE";

  return (
    <div className="space-y-5">
      <header className="space-y-3 border-b border-greyscale-700 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-greyscale-0">{title}</h1>
              {isVersionFetching ? <Spinner className="h-4 w-4" /> : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <CourseLevelBadge level={version.level || "Chưa xác định"} />
              <span className="inline-flex rounded px-2 py-1 text-xs font-medium bg-tertiary/15 text-tertiary border-2 border-tertiary/40">
                {version.estimatedDuration ?? "Chưa xác định"} phút
              </span>
              <span className="inline-flex rounded px-2 py-1 text-xs font-medium bg-greyscale-700 text-greyscale-100 border border-greyscale-600">
                Phiên bản {version.version}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <CourseVersionStatusBadge status={version.status} />
            {canUpdateVersion ? (
              <UpdateCourseVersionDialog courseId={courseId} version={version} />
            ) : null}
          </div>
        </div>
      </header>

      <div
        className={hasChangeLog ? "grid grid-cols-1 gap-4 lg:grid-cols-2" : ""}
      >
        <div className="space-y-2 rounded border border-greyscale-700 bg-greyscale-900 p-4">
          <h3 className="text-sm font-semibold text-greyscale-0">Mô tả</h3>
          <p className="text-sm text-greyscale-100">{description}</p>
        </div>

        {hasChangeLog ? (
          <div className="space-y-2 rounded border border-greyscale-700 bg-greyscale-900 p-4">
            <h3 className="text-sm font-semibold text-greyscale-0">Thay đổi</h3>
            <p className="text-sm text-greyscale-100">{version.changeLog}</p>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-2 rounded border border-greyscale-700 bg-greyscale-900 p-4">
          <h3 className="text-sm font-semibold text-greyscale-0">Danh mục</h3>
          {version.categories.length === 0 ? (
            <p className="text-sm text-greyscale-300">Không có danh mục</p>
          ) : (
            <pre className="overflow-auto whitespace-pre-wrap text-xs text-greyscale-100">
              {JSON.stringify(version.categories, null, 2)}
            </pre>
          )}
        </div>
        <div className="space-y-2 rounded border border-greyscale-700 bg-greyscale-900 p-4">
          <h3 className="text-sm font-semibold text-greyscale-0">
            Drone yêu cầu
          </h3>
          {version.requiredDrones.length === 0 ? (
            <p className="text-sm text-greyscale-300">Không có drone yêu cầu</p>
          ) : (
            <pre className="overflow-auto whitespace-pre-wrap text-xs text-greyscale-100">
              {JSON.stringify(version.requiredDrones, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {version.imageUrl ? (
          <div className="relative overflow-hidden rounded border border-greyscale-700">
            <Image
              src={version.imageUrl}
              alt={title}
              fill
              className="object-cover"
            />
            <div className="h-56" />
          </div>
        ) : (
          <div className="flex h-56 items-center justify-center rounded border border-greyscale-700 bg-greyscale-900 text-sm text-greyscale-300">
            Không có hình ảnh
          </div>
        )}

        <div className="space-y-2 rounded border border-greyscale-700 bg-greyscale-900 p-4">
          <h3 className="text-sm font-semibold text-greyscale-0">
            {contextLabel}
          </h3>
          <div
            className="text-sm text-greyscale-100 [&_p]:mb-2"
            dangerouslySetInnerHTML={{ __html: localizedContext }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm text-greyscale-100 md:grid-cols-2">
        <p>
          <span className="text-greyscale-300">Người tạo:</span>{" "}
          {(courseCreator?.fullName || "") +
            (courseCreator?.email ? ` (${courseCreator.email})` : "") || "—"}
        </p>
        <p>
          <span className="text-greyscale-300">Ngày tạo:</span>{" "}
          {formatDateTime(courseCreateAt || null)}
        </p>
        <p>
          <span className="text-greyscale-300">Cập nhật bởi:</span>{" "}
          {(version.updater?.fullName || "") +
            (version.updater?.email ? ` (${version.updater.email})` : "") ||
            "—"}
        </p>
        <p>
          <span className="text-greyscale-300">Cập nhật:</span>{" "}
          {formatDateTime(version.updateAt || null)}
        </p>
      </div>
    </div>
  );
}

export type { CourseInfoTabProps };
