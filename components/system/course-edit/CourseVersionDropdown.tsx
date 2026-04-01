"use client";

import React from "react";

import CommonDropdown, {
  CommonDropdownOption,
} from "@/components/common/CommonDropdown";
import { useGetCourseVersions } from "@/hooks/course-version/useCourseVersion";
import { useLocale } from "@/providers/i18n-provider";

type CourseVersionDropdownProps = {
  courseId?: string;
  value?: string;
  onChange: (versionId: string) => void;
  disabled?: boolean;
  className?: string;
};

const PAGE_SIZE = 50;

export default function CourseVersionDropdown({
  courseId,
  value,
  onChange,
  disabled = false,
  className,
}: CourseVersionDropdownProps) {
  const locale = useLocale();

  const { data, isLoading, isError, error } = useGetCourseVersions({
    courseId,
    pageIndex: 1,
    pageSize: PAGE_SIZE,
  });

  const options = React.useMemo<CommonDropdownOption[]>(() => {
    const versions = data?.data ?? [];

    return [...versions]
      .sort((left, right) => right.version - left.version)
      .map((version) => ({
        value: version.courseVersionID,
        label:
          locale === "en"
            ? `v${version.version} - ${version.titleEN || version.titleVN}`
            : `v${version.version} - ${version.titleVN || version.titleEN}`,
        leadingDotClassName: version.status === "ACTIVE" ? "bg-success" : undefined,
      }));
  }, [data?.data, locale]);

  return (
    <CommonDropdown
      className={className}
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Chọn phiên bản khóa học"
      disabled={disabled || !courseId}
      isLoading={isLoading}
      errorMessage={
        isError
          ? error.response?.data?.message || error.message || "Không tải được phiên bản"
          : undefined
      }
      emptyMessage="Khóa học chưa có phiên bản"
    />
  );
}

export type { CourseVersionDropdownProps };