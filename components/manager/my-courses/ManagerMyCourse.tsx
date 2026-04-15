"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { IoFilterSharp } from "react-icons/io5";

import AppPagination from "@/components/common/AppPagination";
import EmptyState from "@/components/common/EmptyState";
import InlineFilterRow, {
  InlineFilterOption,
} from "@/components/common/InlineFilterRow";
import ManagerMyCourseCard from "@/components/manager/my-courses/ManagerMyCourseCard";
import { Spinner } from "@/components/ui/spinner";
import { useGetClubCourseManagement } from "@/hooks/club/useClubCourseManagement";
import { COURSE_LEVELS } from "@/lib/constants/course";
import { useTranslations } from "@/providers/i18n-provider";
import {
  ClubCourseManagementLevel,
  ClubCourseManagementProfitType,
  ClubCourseManagementSortBy,
  ClubCourseManagementSortDirection,
} from "@/validations/club/club-course-management";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function ManagerMyCourse() {
  const t = useTranslations("ManagerMyCourse");
  const router = useRouter();
  const params = useParams<{ clubSlug?: string }>();
  const clubSlug = params?.clubSlug;

  const clubId = React.useMemo(() => {
    if (!clubSlug) return undefined;

    const uuidMatch = clubSlug.match(UUID_SUFFIX_REGEX);
    return uuidMatch?.[0];
  }, [clubSlug]);

  const [selectedLevel, setSelectedLevel] =
    React.useState<ClubCourseManagementLevel | null>(null);
  const [selectedProfitType, setSelectedProfitType] =
    React.useState<ClubCourseManagementProfitType | null>(null);
  const [selectedSortBy, setSelectedSortBy] =
    React.useState<ClubCourseManagementSortBy | null>(null);
  const [selectedSortDirection, setSelectedSortDirection] =
    React.useState<ClubCourseManagementSortDirection | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  const levelOptions = React.useMemo<
    InlineFilterOption<ClubCourseManagementLevel>[]
  >(
    () =>
      COURSE_LEVELS.filter((level) => level.value !== null).map((level) => ({
        value: level.value as ClubCourseManagementLevel,
        label: t(`${level.label}`),
      })),
    [t]
  );

  const profitTypeOptions: InlineFilterOption<ClubCourseManagementProfitType>[] =
    [
      { value: "PROFIT", label: t("profitType.profit") },
      { value: "NONPROFIT", label: t("profitType.nonprofit") },
    ];

  const sortByOptions: InlineFilterOption<ClubCourseManagementSortBy>[] = [
    {
      value: "Total_Codes_Quantity",
      label: t("sortBy.totalCodes"),
    },
    {
      value: "Remaining_Codes_Quantity",
      label: t("sortBy.remainingCodes"),
    },
    {
      value: "Participants_Quantity",
      label: t("sortBy.participants"),
    },
  ];

  const sortDirectionOptions: InlineFilterOption<ClubCourseManagementSortDirection>[]
    = [
      { value: "Asc", label: t("sortDirection.asc") },
      { value: "Desc", label: t("sortDirection.desc") },
    ];

  const { data, isLoading, isError, error, isFetching } =
    useGetClubCourseManagement(clubId, {
      level: selectedLevel,
      profitType: selectedProfitType,
      courseSortBy: selectedSortBy,
      courseSortDirection: selectedSortDirection,
      currentPage,
      pageSize: 12,
    });

  const courses = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const updateLevel = React.useCallback(
    (value: ClubCourseManagementLevel | null) => {
      setSelectedLevel(value);
      setCurrentPage(1);
    },
    []
  );

  const updateProfitType = React.useCallback(
    (value: ClubCourseManagementProfitType | null) => {
      setSelectedProfitType(value);
      setCurrentPage(1);
    },
    []
  );

  const updateSortBy = React.useCallback(
    (value: ClubCourseManagementSortBy | null) => {
      setSelectedSortBy(value);
      setCurrentPage(1);
    },
    []
  );

  const updateSortDirection = React.useCallback(
    (value: ClubCourseManagementSortDirection | null) => {
      setSelectedSortDirection(value);
      setCurrentPage(1);
    },
    []
  );

  if (!clubId) {
    return (
      <div className="px-6 py-4">
        <EmptyState title={t("errors.resolveClub")} />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 py-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-greyscale-0">
          <IoFilterSharp />
          <p className="text-sm font-semibold">{t("filter")}</p>
        </div>

        <InlineFilterRow
          label={t("level.label")}
          selectedValue={selectedLevel}
          options={levelOptions}
          allLabel={t("level.all")}
          onChange={updateLevel}
        />

        <InlineFilterRow
          label={t("profitType.label")}
          selectedValue={selectedProfitType}
          options={profitTypeOptions}
          allLabel={t("profitType.all")}
          onChange={updateProfitType}
        />

        <InlineFilterRow
          label={t("sortBy.label")}
          selectedValue={selectedSortBy}
          options={sortByOptions}
          allLabel={t("sortBy.all")}
          onChange={updateSortBy}
        />

        <InlineFilterRow
          label={t("sortDirection.label")}
          selectedValue={selectedSortDirection}
          options={sortDirectionOptions}
          allLabel={t("sortDirection.all")}
          onChange={updateSortDirection}
        />
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
              error.response?.data?.message || error.message || t("errors.loadCourses")
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
                <ManagerMyCourseCard
                  key={course.courseVersionId}
                  course={course}
                  onClick={() => {
                    if (!clubSlug) return;
                    router.push(`/manager/${clubSlug}/${course.courseVersionId}`);
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
