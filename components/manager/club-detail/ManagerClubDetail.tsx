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
import React, { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "@/providers/i18n-provider";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth } from "date-fns";

const UUID_SUFFIX_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function ManagerClubDetail() {
  const [selectedTop, setSelectedTop] = useState<5 | 10 | 15>(10);
  const [topComps, setTopComps] = useState(10);
  const [monthsGrowth, setMonthsGrowth] = useState<number | "custom">(12);
  const [fromDateGrowth, setFromDateGrowth] = useState<string>("");
  const [toDateGrowth, setToDateGrowth] = useState<string>("");
  const [displayStatus, setDisplayStatus] = useState<string>("ALL");
  const t = useTranslations("ClubManagerDashboard");
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const params = useParams<{ clubSlug?: string }>();
  const clubSlug = params?.clubSlug;
  const { data: myClubs = [] } = useGetMyClubs();

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const growthQuery = useGetClubExpenseGrowth(clubId, {
    months: monthsGrowth === "custom" ? undefined : monthsGrowth,
    fromDate: monthsGrowth === "custom" ? fromDateGrowth : undefined,
    toDate: monthsGrowth === "custom" ? toDateGrowth : undefined,
  });
  const compQueryParams = useMemo(() => {
    const params: any = { top: topComps };
    switch (displayStatus) {
      case "ONGOING":
        params.competitionStatus = "PUBLISHED";
        params.competitionPhase = "ONGOING";
        break;
      case "AWAITING":
        params.competitionStatus = "PUBLISHED";
        params.competitionPhase = "FINISHED";
        break;
      case "COMPLETED":
        params.competitionStatus = "RESULT_PUBLISHED";
        break;
      case "DRAFT":
        params.competitionStatus = "DRAFT";
        break;
      case "CANCELLED":
        params.competitionStatus = "CANCELLED";
        break;
    }
    return params;
  }, [topComps, displayStatus]);

  const competitionQuery = useGetClubCompetitionStats(clubId, compQueryParams);
  const topBuyersQuery = useGetClubTopBuyers(clubId, 10);

  const growthSeries = growthQuery.data?.revenueGrowth ?? [];
  const byCourseSeries = byCourseQuery.data?.revenueByCourse ?? [];

  const growthChartData = React.useMemo(() => {
    return growthSeries.map((item) => ({
      month: item.month,
      value: item.value,
    }));
  }, [growthSeries]);

  const isInitialLoading = overviewQuery.isLoading;
  const hasError = overviewQuery.isError;
  const today = new Date().toLocaleDateString(locale === "en" ? "en-US" : "vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const isRefetching =
    overviewQuery.isRefetching ||
    growthQuery.isRefetching ||
    byCourseQuery.isRefetching ||
    competitionQuery.isRefetching ||
    topBuyersQuery.isRefetching;

  const formatVND = (v: number) => {
    const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
      maximumFractionDigits: 0,
    }).format(v);
    return locale === "en" ? `${formatted} VND` : `${formatted} ₫`;
  };

  return (
    <div className="min-h-screen bg-[#0f1014] text-[#9ca3af]">
      {/* Header */}
      <div className="bg-[#0f1014]/95 backdrop-blur-xl border-b border-white/[0.07]">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#6a7080] mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] text-[#6a7080] font-medium">
                {locale === "en" ? "Real-time updates" : "Cập nhật thời gian thực"}
              </span>
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
              title={locale === "en" ? "Data temporarily interrupted" : "Dữ liệu tạm thời gián đoạn"}
              description={
                locale === "en"
                  ? "The system is having trouble connecting to the Dashboard data. Please refresh the page."
                  : "Hệ thống đang gặp khó khăn khi kết nối dữ liệu Dashboard. Vui lòng làm mới trang."
              }
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
                  {/* Revenue Growth Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={mounted ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.35, delay: 0.05 }}
                    className="bg-[#181b22] rounded-2xl p-6 border border-white/[0.07]"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-[13px] font-bold text-white">{t("revenueTrend.title")}</h3>
                        <p className="text-[11px] text-[#5a5f6a] mt-0.5">
                          {monthsGrowth === "custom"
                            ? locale === "en"
                              ? `Analysis from ${fromDateGrowth || "..."} to ${toDateGrowth || "..."}`
                              : `Phân tích từ ${fromDateGrowth || "..."} đến ${toDateGrowth || "..."}`
                            : t("revenueTrend.subtitle")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-[#1e2130] border border-white/[0.07] rounded-xl p-1">
                        {[
                          { v: 6, l: "6T" },
                          { v: 12, l: "12T" },
                          { v: 24, l: "24T" },
                        ].map((m) => (
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
                        <button
                          onClick={() => setMonthsGrowth("custom")}
                          className={cn(
                            "px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all",
                            monthsGrowth === "custom"
                              ? "bg-blue-500 text-white shadow-sm"
                              : "text-[#6a7080] hover:text-[#a0a8b8]"
                          )}
                        >
                          {locale === "en" ? "Custom" : "Tùy chỉnh"}
                        </button>
                      </div>
                    </div>

                    {monthsGrowth === "custom" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-6 mb-8 p-6 bg-white/[0.02] border border-white/[0.08] rounded-2xl backdrop-blur-md shadow-xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/40" />

                        {/* Inputs Row */}
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col gap-2.5 flex-1">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                              <Calendar size={12} />
                              <span>{locale === "en" ? "From Date" : "Từ ngày"}</span>
                            </div>
                            <div className="relative group/date">
                              <input
                                type="date"
                                value={fromDateGrowth}
                                onChange={(e) => setFromDateGrowth(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full [color-scheme:dark]"
                              />
                              <div className="bg-[#111318] border border-white/[0.1] group-hover/date:border-blue-500/30 group-hover/date:bg-[#161922] text-[12px] text-white rounded-xl px-4 py-3 flex justify-between items-center transition-all w-full shadow-inner relative z-10">
                                <span className={fromDateGrowth ? "text-white font-medium" : "text-[#5a6070]"}>
                                  {fromDateGrowth ? format(new Date(fromDateGrowth), "dd/MM/yyyy") : "DD/MM/YYYY"}
                                </span>
                                <Calendar
                                  size={14}
                                  className="text-[#5a6070] group-hover/date:text-blue-400 transition-colors"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-center pt-6 opacity-20">
                            <div className="w-6 h-[1px] bg-white" />
                          </div>

                          <div className="flex flex-col gap-2.5 flex-1">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                              <Calendar size={12} />
                              <span>{locale === "en" ? "To Date" : "Đến ngày"}</span>
                            </div>
                            <div className="relative group/date">
                              <input
                                type="date"
                                value={toDateGrowth}
                                onChange={(e) => setToDateGrowth(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full [color-scheme:dark]"
                              />
                              <div className="bg-[#111318] border border-white/[0.1] group-hover/date:border-blue-500/30 group-hover/date:bg-[#161922] text-[12px] text-white rounded-xl px-4 py-3 flex justify-between items-center transition-all w-full shadow-inner relative z-10">
                                <span className={toDateGrowth ? "text-white font-medium" : "text-[#5a6070]"}>
                                  {toDateGrowth ? format(new Date(toDateGrowth), "dd/MM/yyyy") : "DD/MM/YYYY"}
                                </span>
                                <Calendar
                                  size={14}
                                  className="text-[#5a6070] group-hover/date:text-blue-400 transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Filters Row */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.04]">
                          <span className="text-[10px] font-bold text-[#4a5060] uppercase mr-2 flex items-center gap-1.5">
                            <Clock size={12} />
                            {locale === "en" ? "Quick Select:" : "Chọn nhanh:"}
                          </span>
                          {[
                            {
                              label: locale === "en" ? "Today" : "Hôm nay",
                              range: [new Date(), new Date()],
                            },
                            {
                              label: locale === "en" ? "Yesterday" : "Hôm qua",
                              range: [subDays(new Date(), 1), subDays(new Date(), 1)],
                            },
                            {
                              label: locale === "en" ? "This Week" : "Tuần này",
                              range: [startOfWeek(new Date(), { weekStartsOn: 1 }), new Date()],
                            },
                            {
                              label: locale === "en" ? "Last Week" : "Tuần trước",
                              range: [
                                startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }),
                                endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }),
                              ],
                            },
                            {
                              label: locale === "en" ? "This Month" : "Tháng này",
                              range: [startOfMonth(new Date()), new Date()],
                            },
                          ].map((q) => (
                            <button
                              key={q.label}
                              onClick={() => {
                                setFromDateGrowth(format(q.range[0], "yyyy-MM-dd"));
                                setToDateGrowth(format(q.range[1], "yyyy-MM-dd"));
                              }}
                              className="px-3 py-1.5 text-[10px] font-medium bg-white/[0.04] border border-white/[0.06] text-[#8a9099] rounded-lg hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all active:scale-95"
                            >
                              {q.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <ManagerExpenseGrowthSection
                      growthChartData={growthChartData}
                      totalValue={growthQuery.data?.totalValue ?? 0}
                      growthRate={growthQuery.data?.growthRate ?? 0}
                      months={monthsGrowth}
                      onMonthsChange={setMonthsGrowth}
                      isLoading={growthQuery.isLoading}
                      fromDate={fromDateGrowth}
                      toDate={toDateGrowth}
                      isCustom={monthsGrowth === "custom"}
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
                        <h3 className="text-[13px] font-bold text-white">{t("competitionActivity.title")}</h3>
                        <p className="text-[11px] text-[#5a5f6a] mt-0.5">
                          {competitionQuery.data?.overview.publishedCompetitions || 0} {t("competitionActivity.ongoing")}{" "}
                          · {competitionQuery.data?.overview.completedCompetitions || 0}{" "}
                          {t("competitionActivity.completed")} ·{" "}
                          {competitionQuery.data?.overview.totalCompetitions || 0}{" "}
                          {t("competitionActivity.title").toLowerCase()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={displayStatus}
                          onChange={(e) => setDisplayStatus(e.target.value)}
                          className="bg-[#1e2130] border border-white/[0.07] text-[10px] font-medium text-[#6a7080] rounded-lg px-2 py-1 outline-none cursor-pointer"
                        >
                          <option value="ALL">{t("competitionActivity.statusFilter")}</option>
                          <option value="ONGOING">{t("competitionActivity.ongoing")}</option>
                          <option value="AWAITING">{t("competitionActivity.awaiting")}</option>
                          <option value="COMPLETED">{t("competitionActivity.completed")}</option>
                          <option value="DRAFT">{t("competitionActivity.draft")}</option>
                          <option value="CANCELLED">{t("competitionActivity.cancelled")}</option>
                        </select>
                        <select
                          value={topComps}
                          onChange={(e) => setTopComps(Number(e.target.value))}
                          className="bg-[#1e2130] border border-white/[0.07] text-[10px] font-medium text-[#6a7080] rounded-lg px-2 py-1 outline-none cursor-pointer"
                        >
                          <option value={5}>{t("competitionActivity.showCount", { count: 5 })}</option>
                          <option value={10}>{t("competitionActivity.showCount", { count: 10 })}</option>
                          <option value={20}>{t("competitionActivity.showCount", { count: 20 })}</option>
                          <option value={50}>{t("competitionActivity.showCount", { count: 50 })}</option>
                          <option value={100}>{t("competitionActivity.showCount", { count: 100 })}</option>
                        </select>
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
                      <h3 className="text-[13px] font-bold text-white">{t("topCourses.title")}</h3>
                      <select
                        value={selectedTop}
                        onChange={(e) => setSelectedTop(Number(e.target.value) as 5 | 10 | 15)}
                        className="bg-[#1e2130] border border-white/[0.07] text-[10px] font-medium text-[#6a7080] rounded-lg px-2 py-1 outline-none cursor-pointer"
                      >
                        <option value={5}>{t("topCourses.topCount", { count: 5 })}</option>
                        <option value={10}>{t("topCourses.topCount", { count: 10 })}</option>
                        <option value={15}>{t("topCourses.topCount", { count: 15 })}</option>
                      </select>
                    </div>
                    <p className="text-[11px] text-[#6a7080] mb-5">{t("topCourses.subtitle")}</p>
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
                      <h3 className="text-[13px] font-bold text-white">{t("vipStudents.title")}</h3>
                      {!topBuyersQuery.isLoading && topBuyersQuery.data && (
                        <div className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <span className="text-[10px] font-bold text-blue-400">
                            {formatVND(topBuyersQuery.data.totalSystemRevenue)}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6a7080] mb-5">{t("vipStudents.subtitle")}</p>
                    <ManagerClubTopBuyersSection data={topBuyersQuery.data} isLoading={topBuyersQuery.isLoading} />
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
