"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";

import AppPagination from "@/components/common/AppPagination";
import ClubCourseCard from "@/components/club/ClubCourseCard";
import InlineFilterRow, {
  InlineFilterOption,
} from "@/components/common/InlineFilterRow";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useGetClubCourses } from "@/hooks/club/useClubCourse";
import { COURSE_LEVELS } from "@/lib/constants/course";
import { useTranslations } from "@/providers/i18n-provider";
import {
  ClubCourseLevel,
  CourseOwner,
  ParticipationSort,
} from "@/validations/club/club-course";
import { IoFilterSharp } from "react-icons/io5";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function ManagerCourse() {
  const t = useTranslations("ManagerCourse");
  const router = useRouter();
  const params = useParams<{ clubSlug?: string }>();
  const clubSlug = params?.clubSlug;

  const clubId = React.useMemo(() => {
    if (!clubSlug) return undefined;

    const uuidMatch = clubSlug.match(UUID_SUFFIX_REGEX);
    return uuidMatch?.[0];
  }, [clubSlug]);

  const sortOptions: InlineFilterOption<ParticipationSort>[] = [
    { value: "MostPopular", label: t("sort.mostPopular") },
    { value: "LeastPopular", label: t("sort.leastPopular") },
  ];

  const ownerOptions: InlineFilterOption<CourseOwner>[] = [
    { value: "Owned", label: t("owner.owned") },
    { value: "NotOwned", label: t("owner.notOwned") },
  ];

  const [selectedLevel, setSelectedLevel] = React.useState<ClubCourseLevel | null>(
    null,
  );
  const [selectedSort, setSelectedSort] =
    React.useState<ParticipationSort | null>(null);
  const [selectedOwner, setSelectedOwner] = React.useState<CourseOwner | null>(
    null,
  );
  const [searchInput, setSearchInput] = React.useState("");
  const [searchKeyword, setSearchKeyword] = React.useState<string | undefined>(
    undefined,
  );
  const [currentPage, setCurrentPage] = React.useState(1);

  const { data, isLoading, isError, error, isFetching } = useGetClubCourses(clubId, {
    level: selectedLevel,
    participationSort: selectedSort,
    courseOwner: selectedOwner,
    courseName: searchKeyword,
    currentPage,
    pageSize: 12,
  });

  const courses = data?.data ?? [];

  const totalPages = data?.totalPages ?? 1;

  const levelOptions = React.useMemo<InlineFilterOption<ClubCourseLevel>[]>(
    () =>
      COURSE_LEVELS.filter((level) => level.value !== null).map((level) => ({
        value: level.value as ClubCourseLevel,
        label: t(`${level.label}`),
      })),
    [t],
  );

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

  const updateLevel = React.useCallback((value: ClubCourseLevel | null) => {
    setSelectedLevel(value);
    setCurrentPage(1);
  }, []);

  const updateSort = React.useCallback((value: ParticipationSort | null) => {
    setSelectedSort(value);
    setCurrentPage(1);
  }, []);

  const updateOwner = React.useCallback((value: CourseOwner | null) => {
    setSelectedOwner(value);
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
              label={t("level.label")}
              selectedValue={selectedLevel}
              options={levelOptions}
              onChange={updateLevel}
              allLabel={t("level.all")}
            />

            <InlineFilterRow
              label={t("sort.label")}
              selectedValue={selectedSort}
              options={sortOptions}
              allLabel={t("level.all")}
              onChange={updateSort}
            />

            <InlineFilterRow
              label={t("owner.label")}
              selectedValue={selectedOwner}
              options={ownerOptions}
              allLabel={t("level.all")}
              onChange={updateOwner}
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
            title={error.response?.data?.message || error.message || t("errors.loadCourses")}
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
                <ClubCourseCard
                  key={course.courseId}
                  course={course}
                  onClick={() => {
                    if (!clubSlug) return;
                    router.push(`/manager/${clubSlug}/${course.courseId}`);
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
