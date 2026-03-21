"use client";

import React, { useEffect, useState } from "react";

import AppPagination from "@/components/common/AppPagination";
import AdminCourseCard from "@/components/course/AdminCourseCard";
import { Empty } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useGetCourses } from "@/hooks/course/useCourse";
import { cn } from "@/lib/utils";
import { COURSE_STATUS } from "@/lib/constants/course";
import EmptyState from "@/components/common/EmptyState";

const PAGE_SIZE = 9;

type CourseStatus = "DRAFT" | "PUBLISH" | "UNPUBLISH" | "ARCHIVED" | null;

export default function CourseManagement() {
  const [selectedStatus, setSelectedStatus] = useState<CourseStatus>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(1);

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
  });

  const courses = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalRecords = data?.totalRecords ?? 0;

  return (
    <section className="space-y-5">
      <header className="space-y-3">
        <p className="text-sm text-greyscale-100">
          Tổng số khóa học: {totalRecords}
        </p>

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
                {status.label}
              </button>
            ))}
          </div>
          <div className="w-full md:max-w-md">
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm kiếm theo tiêu đề khóa học"
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
        <EmptyState title="Không tìm thấy khóa học phù hợp" />
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
