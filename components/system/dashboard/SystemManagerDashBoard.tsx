"use client";

import React from "react";
import EmptyState from "@/components/common/EmptyState";
import SystemAdminClubRankingSection from "@/components/system/dashboard/SystemAdminClubRankingSection";
import SystemAdminKpiSection from "@/components/system/dashboard/SystemAdminKpiSection";
import SystemAdminRevenueGrowthSection from "@/components/system/dashboard/SystemAdminRevenueGrowthSection";
import SystemAdminTopCoursesSection from "@/components/system/dashboard/SystemAdminTopCoursesSection";
import { Spinner } from "@/components/ui/spinner";
import {
  useGetAdminClubRanking,
  useGetAdminRevenueByCourse,
  useGetAdminRevenueGrowth,
  useGetAdminRevenueOverview,
} from "@/hooks/dashboard/useDashboard";

const MONTH_OPTIONS = [6, 12, 24] as const;
const TOP_OPTIONS = [5, 10, 15] as const;

export default function SystemManagerDashBoard() {
  const [selectedMonths, setSelectedMonths] = React.useState<(typeof MONTH_OPTIONS)[number]>(12);
  const [selectedTopCourse, setSelectedTopCourse] = React.useState<(typeof TOP_OPTIONS)[number]>(10);
  const [selectedTopClub, setSelectedTopClub] = React.useState<(typeof TOP_OPTIONS)[number]>(10);

  const overviewQuery = useGetAdminRevenueOverview();
  const growthQuery = useGetAdminRevenueGrowth({ months: selectedMonths });
  const byCourseQuery = useGetAdminRevenueByCourse({ top: selectedTopCourse });
  const clubRankingQuery = useGetAdminClubRanking({ top: selectedTopClub });

  const formatVND = React.useCallback((value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const isMainLoading =
    overviewQuery.isLoading || growthQuery.isLoading || !overviewQuery.data || !growthQuery.data;
  const isMainError = overviewQuery.isError || growthQuery.isError;

  return (
    <div className="space-y-6 px-6 pb-6">
      {isMainLoading ? (
        <div className="flex min-h-[36vh] items-center justify-center rounded border border-greyscale-700 bg-greyscale-900/50">
          <Spinner className="h-6 w-6" />
        </div>
      ) : isMainError ? (
        <div className="rounded border border-greyscale-700 bg-greyscale-900/50 p-4">
          <EmptyState
            title="Không tải được dashboard hệ thống"
            description={
              overviewQuery.error?.response?.data?.message ||
              growthQuery.error?.response?.data?.message ||
              overviewQuery.error?.message ||
              growthQuery.error?.message ||
              "Vui lòng thử lại sau."
            }
          />
        </div>
      ) : (
        <>
          <SystemAdminKpiSection overview={overviewQuery.data} formatVND={formatVND} />

          <SystemAdminRevenueGrowthSection
            growthData={growthQuery.data}
            selectedMonths={selectedMonths}
            onSelectMonths={setSelectedMonths}
            isFetching={growthQuery.isFetching}
            formatVND={formatVND}
          />

          <SystemAdminTopCoursesSection
            byCourseData={byCourseQuery.data}
            selectedTop={selectedTopCourse}
            onSelectTop={setSelectedTopCourse}
            isLoading={byCourseQuery.isLoading}
            isFetching={byCourseQuery.isFetching}
            isError={byCourseQuery.isError}
            errorMessage={
              byCourseQuery.error?.response?.data?.message ||
              byCourseQuery.error?.message ||
              "Vui lòng thử lại sau."
            }
            formatVND={formatVND}
          />

          <SystemAdminClubRankingSection
            rankingData={clubRankingQuery.data}
            selectedTop={selectedTopClub}
            onSelectTop={setSelectedTopClub}
            isLoading={clubRankingQuery.isLoading}
            isFetching={clubRankingQuery.isFetching}
            isError={clubRankingQuery.isError}
            errorMessage={
              clubRankingQuery.error?.response?.data?.message ||
              clubRankingQuery.error?.message ||
              "Vui lòng thử lại sau."
            }
            formatVND={formatVND}
          />
        </>
      )}
    </div>
  );
}
