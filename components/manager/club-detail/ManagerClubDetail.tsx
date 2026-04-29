"use client";

import { FadeIn } from "@/components/animation/FadeIn";
import EmptyState from "@/components/common/EmptyState";
import ManagerExpenseGrowthSection from "@/components/manager/club-detail/ManagerExpenseGrowthSection";
import ManagerClubInfo from "@/components/manager/club-detail/ManagerClubInfo";
import ManagerClubKpiCards from "@/components/manager/club-detail/ManagerClubKpiCards";
import ManagerTopCoursesSection from "@/components/manager/club-detail/ManagerTopCoursesSection";
import ManagerClubCompetitionStatsSection from "@/components/manager/club-detail/ManagerClubCompetitionStatsSection";
import ManagerClubTopBuyersSection from "@/components/manager/club-detail/ManagerClubTopBuyersSection";
import { useGetMyClubs } from "@/hooks/club/useClub";
import {
  useGetClubExpenseByCourse,
  useGetClubExpenseGrowth,
  useGetClubRevenueOverview,
  useGetClubCompetitionStats,
  useGetClubTopBuyers,
} from "@/hooks/dashboard/useDashboard";
import { Spinner } from "@/components/ui/spinner";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { RefreshCcw, Trophy, BookOpen, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const UUID_SUFFIX_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function ManagerClubDetail() {
  const [selectedTop, setSelectedTop] = useState<5 | 10 | 15>(10);
  const [monthsGrowth, setMonthsGrowth] = useState(12);
  const [mounted, setMounted] = useState(false);
  const params = useParams<{ clubSlug?: string }>();
  const clubSlug = params?.clubSlug;
  const { data: myClubs = [] } = useGetMyClubs();

  useEffect(() => { setMounted(true); }, []);

  const clubId = React.useMemo(() => {
    if (!clubSlug) return undefined;
    const matchedClub = myClubs.find((club) => clubSlug.endsWith(`-${club.clubID}`));
    if (matchedClub) return matchedClub.clubID;
    const uuidMatch = clubSlug.match(UUID_SUFFIX_REGEX);
    if (uuidMatch) return uuidMatch[0];
    return undefined;
  }, [clubSlug, myClubs]);

  const overviewQuery = useGetClubRevenueOverview(clubId);
  const byCourseQuery = useGetClubExpenseByCourse(clubId, { top: selectedTop });
  const growthQuery = useGetClubExpenseGrowth(clubId, { months: monthsGrowth });
  const competitionQuery = useGetClubCompetitionStats(clubId, 10);
  const topBuyersQuery = useGetClubTopBuyers(clubId, 10);

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

  const isInitialLoading = overviewQuery.isLoading || growthQuery.isLoading;
  const hasError = overviewQuery.isError || growthQuery.isError;
  const today = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });

  const isRefetching = overviewQuery.isRefetching || growthQuery.isRefetching || byCourseQuery.isRefetching || competitionQuery.isRefetching || topBuyersQuery.isRefetching;

  return (
    <div className="min-h-screen bg-[#0f1014] text-[#9ca3af]">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0f1014]/95 backdrop-blur-xl border-b border-white/[0.07]">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            {/* <h1 className="text-base font-bold text-white">Quản lý Câu lạc bộ</h1> */}
            <p className="text-[11px] text-[#6a7080] mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] text-[#6a7080] font-medium">Cập nhật thời gian thực</span>
            </div>
            <button
              onClick={() => {
                overviewQuery.refetch();
                growthQuery.refetch();
                byCourseQuery.refetch();
                competitionQuery.refetch();
                topBuyersQuery.refetch();
              }}
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                "bg-[#1e2130] border border-white/[0.07] hover:border-white/[0.12] text-[#6a7080] hover:text-white",
                isRefetching && "animate-spin text-blue-400"
              )}
            >
              <RefreshCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6">

        {/* Club Info */}
        <FadeIn from="bottom" duration={0.6}>
          <ManagerClubInfo clubId={clubId} />
        </FadeIn>

        {isInitialLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Spinner className="h-10 w-10 text-blue-500" />
          </div>
        ) : hasError ? (
          <div className="bg-[#181b22] border border-white/[0.07] rounded-2xl p-12">
            <EmptyState
              title="Dữ liệu tạm thời gián đoạn"
              description="Hệ thống đang gặp khó khăn khi kết nối dữ liệu Dashboard. Vui lòng làm mới trang."
            />
          </div>
        ) : (
          <div className="space-y-6">

            {/* KPI Row */}
            <FadeIn from="bottom" duration={0.6} delay={0.1}>
              <ManagerClubKpiCards data={overviewQuery.data} isLoading={overviewQuery.isLoading} />
            </FadeIn>

            {/* Main Content */}
            <FadeIn from="bottom" duration={0.6} delay={0.2}>
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Left Column */}
                <div className="xl:col-span-8 space-y-6">
                  {/* Expense Growth Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={mounted ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.35, delay: 0.05 }}
                    className="bg-[#181b22] rounded-2xl p-6 border border-white/[0.07]"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-[13px] font-bold text-white">Xu hướng chi tiêu</h3>
                        <p className="text-[11px] text-[#5a5f6a] mt-0.5">
                          Phân tích chi phí đầu tư theo thời gian
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-[#1e2130] border border-white/[0.07] rounded-xl p-1">
                        {[{ v: 6, l: "6T" }, { v: 12, l: "12T" }, { v: 24, l: "24T" }].map((m) => (
                          <button
                            key={m.v}
                            onClick={() => setMonthsGrowth(m.v)}
                            className={cn(
                              "px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all",
                              monthsGrowth === m.v
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-[#6a7080] hover:text-[#a0a8b8]"
                            )}
                          >
                            {m.l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <ManagerExpenseGrowthSection
                      growthChartData={growthChartData}
                      totalValue={growthQuery.data?.totalValue ?? 0}
                      growthRate={growthQuery.data?.growthRate ?? 0}
                      months={monthsGrowth}
                      onMonthsChange={setMonthsGrowth}
                      isLoading={growthQuery.isLoading}
                    />
                  </motion.div>

                  {/* Competition Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={mounted ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.35, delay: 0.1 }}
                    className="bg-[#181b22] rounded-2xl p-6 border border-white/[0.07]"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-[13px] font-bold text-white">Hoạt động thi đấu</h3>
                        <p className="text-[11px] text-[#5a5f6a] mt-0.5">
                          {competitionQuery.data?.overview.ongoingCompetitions || 0} đang diễn ra ·{" "}
                          {competitionQuery.data?.overview.completedCompetitions || 0} đã kết thúc ·{" "}
                          {competitionQuery.data?.overview.totalCompetitions || 0} tổng cuộc thi
                        </p>
                      </div>
                    </div>
                    <ManagerClubCompetitionStatsSection
                      data={competitionQuery.data}
                      isLoading={competitionQuery.isLoading}
                    />
                  </motion.div>
                </div>

                {/* Right Column */}
                <div className="xl:col-span-4 space-y-6">

                  {/* Top Courses */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={mounted ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.35, delay: 0.07 }}
                    className="bg-[#181b22] rounded-2xl p-6 border border-white/[0.07]"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-[13px] font-bold text-white">Top khóa học</h3>
                      <select
                        value={selectedTop}
                        onChange={(e) => setSelectedTop(Number(e.target.value) as 5 | 10 | 15)}
                        className="bg-[#1e2130] border border-white/[0.07] text-[10px] font-medium text-[#6a7080] rounded-lg px-2 py-1 outline-none cursor-pointer"
                      >
                        <option value={5}>Top 5</option>
                        <option value={10}>Top 10</option>
                        <option value={15}>Top 15</option>
                      </select>
                    </div>
                    <p className="text-[11px] text-[#6a7080] mb-5">Top khóa học có chi phí cao nhất</p>
                    <ManagerTopCoursesSection
                      byCourseSeries={byCourseSeries}
                      selectedTop={selectedTop}
                      isLoading={byCourseQuery.isLoading || byCourseQuery.isFetching}
                      isError={byCourseQuery.isError}
                      errorMessage={byCourseQuery.error?.response?.data?.message || byCourseQuery.error?.message}
                    />
                  </motion.div>

                  {/* Top Buyers */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={mounted ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.35, delay: 0.12 }}
                    className="bg-[#181b22] rounded-2xl p-6 border border-white/[0.07]"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-[13px] font-bold text-white">Học viên VIP</h3>
                      {!topBuyersQuery.isLoading && topBuyersQuery.data && (
                        <div className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <span className="text-[10px] font-bold text-blue-400">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(topBuyersQuery.data.totalSystemRevenue)}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6a7080] mb-5">Top học viên đóng góp nhiều nhất</p>
                    <ManagerClubTopBuyersSection
                      data={topBuyersQuery.data}
                      isLoading={topBuyersQuery.isLoading}
                    />
                  </motion.div>
                </div>
              </div>
            </FadeIn>

          </div>
        )}
      </div>
    </div>
  );
}
