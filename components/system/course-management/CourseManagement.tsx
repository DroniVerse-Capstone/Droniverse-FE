"use client";

import React, { useEffect, useState } from "react";

import AppPagination from "@/components/common/AppPagination";
import CommonDropdown from "@/components/common/CommonDropdown";
import DroneDropdown from "@/components/common/DroneDropdown";
import AdminCourseCard from "@/components/course/AdminCourseCard";
import CreateCourseDialog from "@/components/system/course-management/CreateCourseDialog";
import { Empty } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useGetCourses } from "@/hooks/course/useCourse";
import { useGetLevelsByDrone } from "@/hooks/level/useLevel";
import { cn } from "@/lib/utils";
import { COURSE_STATUS } from "@/lib/constants/course";
import EmptyState from "@/components/common/EmptyState";
import { useLocale, useTranslations } from "@/providers/i18n-provider";

const PAGE_SIZE = 12;

type CourseStatus = "DRAFT" | "PUBLISH" | "UNPUBLISH" | "ARCHIVED" | null;

export default function CourseManagement() {
  const t = useTranslations("CourseManagement");
  const locale = useLocale();
  const [selectedStatus, setSelectedStatus] = useState<CourseStatus>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [selectedDroneId, setSelectedDroneId] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");

  const { data: levels = [], isLoading: isLevelsLoading } = useGetLevelsByDrone(
    selectedDroneId || undefined,
  );

  const levelOptions = levels.map((level) => {
    const levelNameMapVi: Record<number, string> = {
      1: "Cơ bản",
      2: "Trung cấp",
      3: "Nâng cao",
      4: "Master",
    };

    const levelNameMapEn: Record<number, string> = {
      1: "Beginner",
      2: "Intermediate",
      3: "Advanced",
      4: "Master",
    };

    return {
      value: level.levelID,
      label:
        locale === "en"
          ? levelNameMapEn[level.levelNumber] || level.name
          : levelNameMapVi[level.levelNumber] || level.name,
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPageIndex(1);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, error } = useGetCourses({
    pageIndex,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    status: selectedStatus || undefined,
    droneId: selectedDroneId || undefined,
    levelId: selectedLevelId || undefined,
  });

  const courses = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalRecords = data?.totalRecords ?? 0;

  return (
    <section className="space-y-5">
      <header className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-sm text-greyscale-100">
            {t("management.total")}: {totalRecords}
          </p>
          <div className="md:shrink-0">
            <CreateCourseDialog />
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {COURSE_STATUS.map((status) => (
              <button
                key={status.value}
                type="button"
                onClick={() => {
                  setSelectedStatus(status.value as CourseStatus);
                  setPageIndex(1);
                }}
                className={cn(
                  "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  selectedStatus === status.value
                    ? "bg-primary text-greyscale-0"
                    : "bg-greyscale-700 text-greyscale-100 hover:bg-greyscale-600",
                )}
              >
                {t(status.label)}
              </button>
            ))}
          </div>

          <div className="w-full md:max-w-md">
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t("management.search")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
          <div>
            Lọc theo:
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-greyscale-50">
              {locale === "en" ? "Drone" : "Drone"}
            </label>
            <DroneDropdown
              haslabel={false}
              value={selectedDroneId}
              onChange={(value) => {
                setSelectedDroneId(value);
                setSelectedLevelId("");
                setPageIndex(1);
              }}
              placeholder={locale === "en" ? "Filter by drone" : "Lọc theo drone"}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-greyscale-50">
              {locale === "en" ? "Level" : "Cấp độ"}
            </label>
            <CommonDropdown
              value={selectedLevelId}
              onChange={(value) => {
                setSelectedLevelId(value);
                setPageIndex(1);
              }}
              options={levelOptions}
              placeholder={
                selectedDroneId
                  ? locale === "en"
                    ? "Filter by level"
                    : "Lọc theo cấp độ"
                  : locale === "en"
                    ? "Select drone first"
                    : "Chọn drone trước"
              }
              menuLabel={locale === "en" ? "Level" : "Cấp độ"}
              emptyMessage={
                locale === "en"
                  ? "No levels found for this drone"
                  : "Không có level cho drone này"
              }
              disabled={!selectedDroneId || isLevelsLoading}
              isLoading={isLevelsLoading}
            />
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner className="h-6 w-6" />
        </div>
      ) : isError ? (
        <Empty>
          <p className="text-sm text-muted-foreground">
            {error.response?.data?.message ||
              error.message ||
              "Không thể tải danh sách khóa học."}
          </p>
        </Empty>
      ) : courses.length === 0 ? (
        <EmptyState title={t("management.empty")} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <AdminCourseCard key={course.courseID} course={course} />
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-3 border-t border-greyscale-700 pt-4 sm:flex-row">
            <AppPagination
              currentPage={pageIndex}
              totalPages={totalPages}
              disabled={isFetching}
              onPageChange={setPageIndex}
            />
          </div>
        </>
      )}
    </section>
  );
}
