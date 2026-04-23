"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";

import AppPagination from "@/components/common/AppPagination";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useGetUserEnrollments } from "@/hooks/enrollment/useUserEnrollment";
import { useTranslations } from "@/providers/i18n-provider";
import { CourseLevel, EnrollmentStatus } from "@/validations/enrollment/user-enrollment";
import InlineFilterRow, {
  InlineFilterOption,
} from "@/components/common/InlineFilterRow";
import { IoFilterSharp } from "react-icons/io5";
import UserEnrollmentCard from "@/components/member/UserEnrollmentCard";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function MemberMyCourse() {
  const t = useTranslations("ManagerCourse");
  const router = useRouter();
  const params = useParams<{ clubSlug?: string }>();
  const clubSlug = params?.clubSlug;

  const clubId = React.useMemo(() => {
    if (!clubSlug) return undefined;

    const uuidMatch = clubSlug.match(UUID_SUFFIX_REGEX);
    return uuidMatch?.[0];
  }, [clubSlug]);

  const [selectedLevel, setSelectedLevel] = React.useState<CourseLevel | null>(null);
  const [selectedStatus, setSelectedStatus] =
    React.useState<EnrollmentStatus | null>(null);
  const [searchInput, setSearchInput] = React.useState("");
  const [searchKeyword, setSearchKeyword] = React.useState<string | undefined>(
    undefined,
  );
  const [currentPage, setCurrentPage] = React.useState(1);

  const statusOptions: InlineFilterOption<EnrollmentStatus>[] = [
    { value: "ACTIVE", label: "Đang học" },
    { value: "COMPLETED", label: "Hoàn thành" },
  ];

  const { data, isLoading, isError, error, isFetching } = useGetUserEnrollments(
    clubId,
    {
      level: selectedLevel,
      courseSearchName: searchKeyword,
      enrollmentStatus: selectedStatus,
      currentPage,
      pageSize: 12,
    },
  );

  const courses = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleSearch = React.useCallback(() => {
    const normalized = searchInput.trim();
    setCurrentPage(1);
    setSearchKeyword(normalized.length > 0 ? normalized : undefined);
  }, [searchInput]);

  const clearSearch = React.useCallback(() => {
    setSearchInput("");
    setSearchKeyword(undefined);
    setCurrentPage(1);
  }, []);

  const updateLevel = React.useCallback((value: CourseLevel | null) => {
    setSelectedLevel(value);
    setCurrentPage(1);
  }, []);

  const updateStatus = React.useCallback((value: EnrollmentStatus | null) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  }, []);

  if (!clubId) {
    return (
      <div className="px-6 py-4">
        <EmptyState title={t("errors.resolveClub")} />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 py-4">
      <div>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-greyscale-0">
              <IoFilterSharp />
              <p className="text-sm font-semibold">{t("filter")}</p>
            </div>
            
            <InlineFilterRow
              label="Trạng thái"
              selectedValue={selectedStatus}
              options={statusOptions}
              onChange={updateStatus}
              allLabel={t("level.all")}
            />
          </div>

          <div className="flex w-full gap-2 xl:max-w-md">
            <div className="relative flex-1">
              <Input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder={t("searchPlaceholder")}
              />
            </div>
            {searchKeyword ? (
              <Button
                type="button"
                variant="outline"
                className="h-10 border-greyscale-700 bg-greyscale-850 text-greyscale-100 hover:bg-greyscale-800"
                onClick={clearSearch}
              >
                {t("clearSearch")}
              </Button>
            ) : null}
            <Button type="button" className="h-10 px-4" onClick={handleSearch}>
              {t("search")}
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-72 items-center justify-center rounded-xl border border-greyscale-800 bg-greyscale-900/60">
          <Spinner className="h-6 w-6" />
        </div>
      ) : null}

      {!isLoading && isError ? (
        <div className="rounded-xl border border-greyscale-800 bg-greyscale-900/60 p-8">
          <EmptyState
            title={
              error.response?.data?.message ||
              error.message ||
              t("errors.loadCourses")
            }
          />
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <>
          {courses.length === 0 ? (
            <div className="rounded-xl border border-greyscale-800 bg-greyscale-900/60 p-8">
              <EmptyState title={t("empty")} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course) => (
                <UserEnrollmentCard
                  key={course.enrollmentId}
                  enrollment={course}
                  onClick={() => {
                    if (!clubSlug) return;
                    router.push(
                      `/learn/${clubSlug}/${course.enrollmentId}`,
                    );
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-end">
            <AppPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              disabled={isFetching}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
