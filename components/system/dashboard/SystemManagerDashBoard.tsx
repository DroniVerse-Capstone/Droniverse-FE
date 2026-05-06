"use client";

import React, { useEffect, useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";
import {
  useGetAdminRevenueOverview,
  useGetAdminRevenueGrowth,
  useGetAdminClubRanking,
  useGetAdminRevenueByCourse,
  useGetAdminTopBuyers,
  useGetAdminCompetitionStats,
  useGetAdminLearningStatistics
} from "@/hooks/dashboard/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "@/providers/i18n-provider";
import AdminRevenueGrowthSection from "./sections/AdminRevenueGrowthSection";
import AdminClubRankingSection from "./sections/AdminClubRankingSection";
import AdminTopCoursesSection from "./sections/AdminTopCoursesSection";
import AdminTopBuyersSection from "./sections/AdminTopBuyersSection";
import AdminCompetitionStatsSection from "./sections/AdminCompetitionStatsSection";
import AdminLearningActivitySection from "./sections/AdminLearningActivitySection";
import AdminTopClubsLearningSection from "./sections/AdminTopClubsLearningSection";
import AdminCourseLearningSection from "./sections/AdminCourseLearningSection";
import { BookOpen, GraduationCap, Trophy, Users, BarChart3, PieChart as PieChartIcon } from "lucide-react";

// === FORMAT ===
const formatVND = (v: number, locale: string) => {
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0,
  }).format(v);
  return locale === "en" ? `${formatted} VND` : `${formatted} ₫`;
};

// === KPI CARD ===
interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  subLabel?: string;
  trend?: number;
  diff?: number;
  isLoading: boolean;
  delay: number;
}

function KpiCard({ label, value, sub, subLabel, trend, diff, isLoading, delay, locale }: KpiCardProps & { locale: string }) {
  const [m, setM] = useState(false);
  useEffect(() => { setM(true); }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={m ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.35, delay: delay * 0.07 }}
      className="bg-[#181b22] rounded-2xl p-6 border border-white/[0.07]"
    >
      <p className="text-[11px] text-[#7a8090] font-medium mb-3 uppercase tracking-wide">{label}</p>
      {isLoading ? (
        <Skeleton className="h-9 w-48 bg-white/[0.06]" />
      ) : (
        <p className="text-3xl font-bold text-white tracking-tight leading-none">{value}</p>
      )}
      {sub && !isLoading && (
        <p className="text-[11px] text-[#5a6070] mt-2">{sub}</p>
      )}
      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        {trend !== undefined && !isLoading && (
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "text-[11px] font-bold",
              trend >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
            </span>
          </div>
        )}
        {diff !== undefined && !isLoading && (
          <span className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
            diff >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          )}>
            {diff >= 0 ? "+" : ""}{formatVND(diff, locale)}
          </span>
        )}
        {trend !== undefined && !isLoading && (
          <span className="text-[10px] text-[#4a5060]">{subLabel || (locale === "en" ? "vs last period" : "so với kỳ trước")}</span>
        )}
      </div>
    </motion.div>
  );
}

// === MAIN ===
export default function SystemManagerDashBoard() {
  const t = useTranslations("SystemDashboard");
  const locale = useLocale();
  const [monthsGrowth, setMonthsGrowth] = useState(12);
  const [topClubs, setTopClubs] = useState(10);
  const [topBuyers, setTopBuyers] = useState(10);
  const [topComps, setTopComps] = useState(5);
  const [displayStatus, setDisplayStatus] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"finance" | "learning">("finance");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { data: overview, isLoading: isOverviewLoading, refetch: refetchOverview, isRefetching } = useGetAdminRevenueOverview();
  const { data: growth, isLoading: isGrowthLoading } = useGetAdminRevenueGrowth({ months: monthsGrowth });
  const { data: rankings, isLoading: isRankingsLoading } = useGetAdminClubRanking({ top: topClubs });
  const { data: courseRevenue, isLoading: isCourseLoading } = useGetAdminRevenueByCourse({ top: 6 });
  const { data: topBuyersData, isLoading: isBuyersLoading } = useGetAdminTopBuyers(topBuyers);
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

  const { data: compStats, isLoading: isCompLoading } = useGetAdminCompetitionStats(compQueryParams);
  const { data: learningStats, isLoading: isLearningLoading } = useGetAdminLearningStatistics();

  const revenueDiff = (overview?.revenueThisMonth ?? 0) - (overview?.revenueLastMonth ?? 0);
  const profitDiff = (overview?.profitThisMonth ?? 0) - (overview?.profitLastMonth ?? 0);

  const today = new Date().toLocaleDateString(locale === "en" ? "en-US" : "vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0f1014] text-[#9ca3af]">
      {/* HEADER */}
      <div className=" top-0 z-30 bg-[#0f1014]/95 backdrop-blur-xl border-b border-white/[0.07]">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white">{t("title")}</h1>
            <p className="text-[11px] text-[#6a7080] mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-[#6a7080] font-medium">{t("realtimeUpdate")}</span>
            </div>
            <button
              onClick={() => refetchOverview()}
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

      {/* TABS */}
      <div className="bg-[#0f1014]/50 backdrop-blur-md border-b border-white/[0.07] ">
        <div className="max-w-[1600px] mx-auto px-8 py-2 flex items-center gap-6">
          <button
            onClick={() => setActiveTab("finance")}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-[12px] font-bold transition-all relative",
              activeTab === "finance" ? "text-blue-400" : "text-[#5a6070] hover:text-[#a0a8b8]"
            )}
          >
            <BarChart3 size={14} />
            <span>{locale === "en" ? "Financial Report" : "Báo cáo Tài chính"}</span>
            {activeTab === "finance" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("learning")}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-[12px] font-bold transition-all relative",
              activeTab === "learning" ? "text-purple-400" : "text-[#5a6070] hover:text-[#a0a8b8]"
            )}
          >
            <GraduationCap size={16} />
            <span>{locale === "en" ? "Learning Analytics" : "Phân tích Học tập"}</span>
            {activeTab === "learning" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6">
        {activeTab === "finance" ? (
          <>
            {/* === KPI - Tổng quan hệ thống === */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label={t("kpi.totalRevenue")}
                value={formatVND(overview?.totalRevenue || 0, locale)}
                sub={t("kpi.thisMonth", { amount: formatVND(overview?.revenueThisMonth || 0, locale) })}
                subLabel={t("kpi.comparedToLastPeriod")}
                trend={overview?.revenueGrowthRate}
                diff={revenueDiff}
                isLoading={isOverviewLoading}
                delay={0}
                locale={locale}
              />
              <KpiCard
                label={t("kpi.netProfit")}
                value={formatVND(overview?.netProfit || 0, locale)}
                sub={t("kpi.thisMonth", { amount: formatVND(overview?.profitThisMonth || 0, locale) })}
                subLabel={t("kpi.comparedToLastPeriod")}
                trend={overview?.profitGrowthRate}
                diff={profitDiff}
                isLoading={isOverviewLoading}
                delay={1}
                locale={locale}
              />
              <KpiCard
                label={t("kpi.totalTransactions")}
                value={(overview?.totalTransactions || 0).toLocaleString(locale === "en" ? "en-US" : "vi-VN")}
                sub={t("kpi.transactionsThisMonth", { count: (overview?.transactionsThisMonth || 0).toLocaleString(locale === "en" ? "en-US" : "vi-VN") })}
                isLoading={isOverviewLoading}
                delay={2}
                locale={locale}
              />
              <KpiCard
                label={t("kpi.totalParticipants")}
                value={(compStats?.overview.totalParticipants || 0).toLocaleString(locale === "en" ? "en-US" : "vi-VN")}
                sub={t("kpi.competitionsDeploying", { count: compStats?.overview.publishedCompetitions || 0 })}
                isLoading={isCompLoading}
                delay={3}
                locale={locale}
              />
            </div>

            {/* === MAIN GRID === */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

              {/* LEFT */}
              <div className="xl:col-span-8 space-y-6">

                {/* Revenue Chart */}
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
                        {t("revenueTrend.summary", {
                          amount: formatVND(growth?.totalValue || 0, locale),
                          count: monthsGrowth,
                          rate: growth?.growthRate || 0,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-[#1e2130] border border-white/[0.07] rounded-xl p-1">
                      {[6, 12, 24].map((m) => (
                        <button
                          key={m}
                          onClick={() => setMonthsGrowth(m)}
                          className={cn(
                            "px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all",
                            monthsGrowth === m
                              ? "bg-blue-500 text-white shadow-sm"
                              : "text-[#6a7080] hover:text-[#a0a8b8]"
                          )}
                        >
                          {t("revenueTrend.months", { count: m })}
                        </button>
                      ))}
                    </div>
                  </div>
                  <AdminRevenueGrowthSection data={growth} isLoading={isGrowthLoading} months={monthsGrowth} />
                </motion.div>

                {/* Competition */}
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
                        {t("competitionActivity.summary", {
                          deploying: compStats?.overview.publishedCompetitions || 0,
                          completed: compStats?.overview.completedCompetitions || 0,
                          total: compStats?.overview.totalCompetitions || 0,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={displayStatus}
                        onChange={(e) => setDisplayStatus(e.target.value)}
                        className="bg-[#1e2130] border border-white/[0.07] text-[11px] font-medium text-[#8a9099] rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                      >
                        <option value="ALL">{t("competitionActivity.statusFilter.all")}</option>
                        <option value="ONGOING">{t("competitionActivity.statusFilter.ongoing")}</option>
                        <option value="AWAITING">{t("competitionActivity.statusFilter.awaiting")}</option>
                        <option value="COMPLETED">{t("competitionActivity.statusFilter.completed")}</option>
                        <option value="DRAFT">{t("competitionActivity.statusFilter.draft")}</option>
                        <option value="CANCELLED">{t("competitionActivity.statusFilter.cancelled")}</option>
                      </select>
                      <select
                        value={topComps}
                        onChange={(e) => setTopComps(Number(e.target.value))}
                        className="bg-[#1e2130] border border-white/[0.07] text-[11px] font-medium text-[#8a9099] rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                      >
                        {[5, 10, 20, 50, 100].map((n) => (
                          <option key={n} value={n}>
                            {t("competitionActivity.showCount", { count: n })}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <AdminCompetitionStatsSection data={compStats} isLoading={isCompLoading} />
                </motion.div>
              </div>

              {/* RIGHT */}
              <div className="xl:col-span-4 space-y-6">

                {/* Top Courses */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={mounted ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.07 }}
                  className="bg-[#181b22] rounded-2xl p-6 border border-white/[0.07]"
                >
                  <h3 className="text-[13px] font-bold text-white mb-0.5">{t("topCourses.title")}</h3>
                  <p className="text-[11px] text-[#6a7080] mb-5">{t("topCourses.subtitle")}</p>
                  <AdminTopCoursesSection data={courseRevenue} isLoading={isCourseLoading} />
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
                    <select
                      value={topBuyers}
                      onChange={(e) => setTopBuyers(Number(e.target.value))}
                      className="bg-[#1e2130] border border-white/[0.07] text-[10px] font-medium text-[#6a7080] rounded-lg px-2 py-1 outline-none cursor-pointer"
                    >
                      {[5, 10].map((n) => (
                        <option key={n} value={n}>
                          {t("vipStudents.topCount", { count: n })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-[#6a7080] mb-5">{t("vipStudents.subtitle")}</p>
                  <AdminTopBuyersSection data={topBuyersData} isLoading={isBuyersLoading} />
                </motion.div>
              </div>
            </div>

            {/* CLUB RANKING */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="bg-[#181b22] rounded-2xl p-6 border border-white/[0.07]"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[13px] font-bold text-white">{t("clubRanking.title")}</h3>
                  <p className="text-[11px] text-[#6a7080] mt-0.5">{t("clubRanking.subtitle")}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[5, 10, 20].map((n) => (
                    <button
                      key={n}
                      onClick={() => setTopClubs(n)}
                      className={cn(
                        "px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all",
                        topClubs === n
                          ? "bg-blue-500 text-white"
                          : "bg-[#1e2130] border border-white/[0.07] text-[#6a7080]"
                      )}
                    >
                      {t("clubRanking.topCount", { count: n })}
                    </button>
                  ))}
                </div>
              </div>
              <AdminClubRankingSection data={rankings} isLoading={isRankingsLoading} />
            </motion.div>
          </>
        ) : (
          <div className="space-y-6">
            {/* LEARNING KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label={t("learningStatistics.summary.totalEnrollments")}
                value={(learningStats?.summary.totalEnrollments || 0).toLocaleString()}
                isLoading={isLearningLoading}
                delay={0}
                locale={locale}
              />
              <KpiCard
                label={t("learningStatistics.summary.avgGlobalProgress")}
                value={`${(learningStats?.summary.avgGlobalProgress || 0).toFixed(1)}%`}
                isLoading={isLearningLoading}
                delay={1}
                locale={locale}
              />
              <KpiCard
                label={t("learningStatistics.summary.totalCertificates")}
                value={(learningStats?.summary.totalCertificates || 0).toLocaleString()}
                isLoading={isLearningLoading}
                delay={2}
                locale={locale}
              />
              <KpiCard
                label={t("learningStatistics.summary.activeLearners")}
                value={(learningStats?.summary.activeLearners30Days || 0).toLocaleString()}
                isLoading={isLearningLoading}
                delay={3}
                locale={locale}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* LEFT: Activity Chart */}
              <div className="xl:col-span-8 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={mounted ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className="bg-[#181b22] rounded-2xl p-6 border border-white/[0.07]"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-[13px] font-bold text-white">{t("learningStatistics.weeklyActivity.title")}</h3>
                      <p className="text-[11px] text-[#5a5f6a] mt-0.5">
                        {locale === "en" ? "System-wide lesson completion trend" : "Xu hướng hoàn thành bài học trên toàn hệ thống"}
                      </p>
                    </div>
                  </div>
                  <AdminLearningActivitySection data={learningStats?.weeklyActivity} isLoading={isLearningLoading} />
                </motion.div>

                {/* Course Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={mounted ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.15 }}
                  className="bg-[#181b22] rounded-2xl p-6 border border-white/[0.07]"
                >
                  <div>
                    <h3 className="text-[13px] font-bold text-white">{t("learningStatistics.courseStats.title")}</h3>
                    <p className="text-[11px] text-[#6a7080] mt-0.5 mb-6">{t("learningStatistics.courseStats.subtitle")}</p>
                  </div>
                  <AdminCourseLearningSection data={learningStats?.courseStats} isLoading={isLearningLoading} />
                </motion.div>
              </div>

              {/* RIGHT: Top Clubs */}
              <div className="xl:col-span-4 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={mounted ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  className="bg-[#181b22] rounded-2xl p-6 border border-white/[0.07]"
                >
                  <h3 className="text-[13px] font-bold text-white mb-0.5">{t("learningStatistics.topClubs.title")}</h3>
                  <p className="text-[11px] text-[#6a7080] mb-6">{t("learningStatistics.topClubs.subtitle")}</p>
                  <AdminTopClubsLearningSection data={learningStats?.topClubs} isLoading={isLearningLoading} />
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
