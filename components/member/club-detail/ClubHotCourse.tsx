"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaChevronRight, FaFire } from "react-icons/fa";

import EmptyState from "@/components/common/EmptyState";
import ClubCourseCard from "@/components/club/ClubCourseCard";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetClubHotCourses } from "@/hooks/club/useClubCourse";
import { useTranslations } from "@/providers/i18n-provider";

type ClubHotCourseProps = {
  clubId?: string;
  clubSlug?: string;
};

export default function ClubHotCourse({
  clubId,
  clubSlug,
}: ClubHotCourseProps) {
  const router = useRouter();
  const t = useTranslations("ClubDetail.ClubHotCourse");
  const { data, isLoading, isError, error } = useGetClubHotCourses(clubId, {
    currentPage: 1,
    pageSize: 4,
  });

  const courses = data?.data ?? [];
  const viewAllHref = clubSlug ? `/member/${clubSlug}/courses` : "/member";

  if (!clubId) {
    return (
      <div className="rounded border border-greyscale-800 bg-greyscale-900/70 p-6">
        <EmptyState title={t("errors.resolveClub")} />
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-3xl font-semibold text-greyscale-0">
          <FaFire className="text-orange-600" />
          {t("title")}
        </h2>

        <Button variant={"secondary"} onClick={() => router.push(viewAllHref)}>
          {t("viewAll")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex min-h-72 items-center justify-center rounded border border-greyscale-800 bg-greyscale-900/60">
          <Spinner className="h-6 w-6" />
        </div>
      ) : null}

      {!isLoading && isError ? (
        <div className="rounded border border-greyscale-800 bg-greyscale-900/60 p-6">
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
        courses.length === 0 ? (
          <div className="rounded border border-greyscale-800 bg-greyscale-900/60 p-6">
            <EmptyState title={t("empty")} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {courses.map((course) => (
              <ClubCourseCard
                key={course.courseId}
                course={course}
                onClick={() => {
                  if (!clubSlug) return;
                  router.push(`/member/${clubSlug}/${course.courseId}`);
                }}
              />
            ))}
          </div>
        )
      ) : null}
    </section>
  );
}
