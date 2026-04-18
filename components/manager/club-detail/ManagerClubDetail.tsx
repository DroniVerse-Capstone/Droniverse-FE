"use client";

import { FadeIn } from "@/components/animation/FadeIn";
import EmptyState from "@/components/common/EmptyState";
import ManagerExpenseGrowthSection from "@/components/manager/club-detail/ManagerExpenseGrowthSection";
import ManagerClubInfo from "@/components/manager/club-detail/ManagerClubInfo";
import ManagerClubKpiCards from "@/components/manager/club-detail/ManagerClubKpiCards";
import ManagerTopCoursesSection from "@/components/manager/club-detail/ManagerTopCoursesSection";
import { useGetMyClubs } from "@/hooks/club/useClub";
import {
  useGetClubExpenseByCourse,
  useGetClubExpenseGrowth,
  useGetClubRevenueOverview,
} from "@/hooks/dashboard/useDashboard";
import { Spinner } from "@/components/ui/spinner";
import { useParams } from "next/navigation";
import React from "react";

const UUID_SUFFIX_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function ManagerClubDetail() {
  const [selectedTop, setSelectedTop] = React.useState<5 | 10 | 15>(10);

  const params = useParams<{ clubSlug?: string }>();
  const clubSlug = params?.clubSlug;
  const { data: myClubs = [] } = useGetMyClubs();

  const clubId = React.useMemo(() => {
    if (!clubSlug) return undefined;

    const matchedClub = myClubs.find((club) =>
      clubSlug.endsWith(`-${club.clubID}`),
    );
    if (matchedClub) return matchedClub.clubID;

    const uuidMatch = clubSlug.match(UUID_SUFFIX_REGEX);
    if (uuidMatch) return uuidMatch[0];

    return undefined;
  }, [clubSlug, myClubs]);

  const overviewQuery = useGetClubRevenueOverview(clubId);
  const byCourseQuery = useGetClubExpenseByCourse(clubId, { top: selectedTop });
  const growthQuery = useGetClubExpenseGrowth(clubId, { months: 12 });

  const formatVND = React.useCallback((value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const growthSeries = growthQuery.data?.revenueGrowth ?? [];
  const byCourseSeries = byCourseQuery.data?.revenueByCourse ?? [];

  const growthChartData = React.useMemo(() => {
    return growthSeries.map((item) => ({
      monthLabel: new Date(item.month).toLocaleDateString("vi-VN", {
        month: "2-digit",
        year: "2-digit",
      }),
      value: item.value,
    }));
  }, [growthSeries]);

  const isAnyLoading =
    overviewQuery.isLoading || growthQuery.isLoading || !overviewQuery.data || !growthQuery.data;
  const hasAnyError = overviewQuery.isError || growthQuery.isError;

  return (
    <div className="space-y-6">
      <FadeIn from="bottom" duration={0.8} delay={0.2}>
        <ManagerClubInfo clubId={clubId} />
      </FadeIn>

      <FadeIn from="bottom" duration={0.8} delay={0.3}>
        {isAnyLoading ? (
          <div className="flex min-h-[32vh] items-center justify-center rounded border border-greyscale-700 bg-greyscale-900/50">
            <Spinner className="h-6 w-6" />
          </div>
        ) : hasAnyError ? (
          <div className="rounded border border-greyscale-700 bg-greyscale-900/50 p-4">
            <EmptyState
              title="Không tải được dữ liệu dashboard"
              description={
                overviewQuery.error?.response?.data?.message ||
                byCourseQuery.error?.response?.data?.message ||
                growthQuery.error?.response?.data?.message ||
                overviewQuery.error?.message ||
                byCourseQuery.error?.message ||
                growthQuery.error?.message ||
                "Vui lòng thử lại sau."
              }
            />
          </div>
        ) : (
          <div className="space-y-6">
            <ManagerClubKpiCards overview={overviewQuery.data} />

            <ManagerExpenseGrowthSection
              growthChartData={growthChartData}
              totalValue={growthQuery.data?.totalValue ?? 0}
              growthRate={growthQuery.data?.growthRate ?? 0}
              formatVND={formatVND}
            />

            <ManagerTopCoursesSection
              byCourseSeries={byCourseSeries}
              formatVND={formatVND}
              selectedTop={selectedTop}
              onSelectTop={setSelectedTop}
              isLoading={byCourseQuery.isLoading || byCourseQuery.isFetching}
              isError={byCourseQuery.isError}
              errorMessage={
                byCourseQuery.error?.response?.data?.message ||
                byCourseQuery.error?.message
              }
            />
          </div>
        )}
      </FadeIn>
    </div>
  );
}
