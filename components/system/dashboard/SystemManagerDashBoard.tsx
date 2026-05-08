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
  useGetAdminLearningStatistics,
  useGetAdminOrderStatistics,
  useGetAdminSystemSummary,
  AdminOrderStatisticsParams,
} from "@/hooks/dashboard/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth } from "date-fns";
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
import { BookOpen, GraduationCap, Trophy, Users, BarChart3, PieChart as PieChartIcon, ShoppingCart, Calendar, Clock } from "lucide-react";
import AdminOrderStatisticsSection from "./sections/AdminOrderStatisticsSection";

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
  const [monthsGrowth, setMonthsGrowth] = useState<number | "custom">(12);
  const [fromDateGrowth, setFromDateGrowth] = useState<string>("");
  const [toDateGrowth, setToDateGrowth] = useState<string>("");
  const [topClubs, setTopClubs] = useState(10);
  const [topBuyers, setTopBuyers] = useState(10);
  const [topComps, setTopComps] = useState(5);
  const [displayStatus, setDisplayStatus] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"finance" | "learning" | "orders" | "operations">("finance");
  const [orderPage, setOrderPage] = useState(1);
  const [orderFilters, setOrderFilters] = useState<AdminOrderStatisticsParams>({ currentPage: 1, pageSize: 10 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { data: overview, isLoading: isOverviewLoading, refetch: refetchOverview, isRefetching } = useGetAdminRevenueOverview();
  const { data: growth, isLoading: isGrowthLoading } = useGetAdminRevenueGrowth({
    months: monthsGrowth === "custom" ? undefined : monthsGrowth,
    fromDate: monthsGrowth === "custom" ? fromDateGrowth : undefined,
    toDate: monthsGrowth === "custom" ? toDateGrowth : undefined,
  });
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
  const { data: orderStats, isLoading: isOrdersLoading, refetch: refetchOrders } = useGetAdminOrderStatistics({
    ...orderFilters,
    currentPage: orderPage,
  });

  const [systemTimeline, setSystemTimeline] = useState<string>("month");
  const { data: systemSummary, isLoading: isSystemLoading } = useGetAdminSystemSummary(systemTimeline);

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
            <span>{t("tabs.finance")}</span>
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
            <span>{t("tabs.learning")}</span>
            {activeTab === "learning" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-[12px] font-bold transition-all relative",
              activeTab === "orders" ? "text-amber-400" : "text-[#5a6070] hover:text-[#a0a8b8]"
            )}
          >
            <ShoppingCart size={16} />
            <span>{t("tabs.orders")}</span>
            {activeTab === "orders" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
            )}
          </button>
          {/* <button
            onClick={() => setActiveTab("operations")}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-[12px] font-bold transition-all relative",
              activeTab === "operations" ? "text-emerald-400" : "text-[#5a6070] hover:text-[#a0a8b8]"
            )}
          >
            <RefreshCcw size={16} />
            <span>{t("tabs.operations")}</span>
            {activeTab === "operations" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button> */}
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
                        {monthsGrowth === "custom"
                          ? (locale === "en"
                            ? `Analysis from ${fromDateGrowth || '...'} to ${toDateGrowth || '...'}`
                            : `Phân tích từ ${fromDateGrowth || '...'} đến ${toDateGrowth || '...'}`)
                          : t("revenueTrend.summary", {
                            amount: formatVND(growth?.totalValue || 0, locale),
                            count: monthsGrowth,
                            rate: growth?.growthRate || 0,
                          })
                        }
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
                            <span>{t("revenueTrend.fromDate")}</span>
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
                              <Calendar size={14} className="text-[#5a6070] group-hover/date:text-blue-400 transition-colors" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center pt-6 opacity-20">
                          <div className="w-6 h-[1px] bg-white" />
                        </div>

                        <div className="flex flex-col gap-2.5 flex-1">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                            <Calendar size={12} />
                            <span>{t("revenueTrend.toDate")}</span>
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
                              <Calendar size={14} className="text-[#5a6070] group-hover/date:text-blue-400 transition-colors" />
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
                            range: [new Date(), new Date()]
                          },
                          {
                            label: locale === "en" ? "Yesterday" : "Hôm qua",
                            range: [subDays(new Date(), 1), subDays(new Date(), 1)]
                          },
                          {
                            label: locale === "en" ? "This Week" : "Tuần này",
                            range: [startOfWeek(new Date(), { weekStartsOn: 1 }), new Date()]
                          },
                          {
                            label: locale === "en" ? "Last Week" : "Tuần trước",
                            range: [startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }), endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 })]
                          },
                          {
                            label: locale === "en" ? "This Month" : "Tháng này",
                            range: [startOfMonth(new Date()), new Date()]
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
                  <AdminRevenueGrowthSection
                    data={growth}
                    isLoading={isGrowthLoading}
                    months={monthsGrowth === "custom" ? 0 : monthsGrowth}
                    isCustom={monthsGrowth === "custom"}
                    fromDate={fromDateGrowth}
                    toDate={toDateGrowth}
                  />
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
        ) : activeTab === "learning" ? (
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
        ) : activeTab === "orders" ? (
          <AdminOrderStatisticsSection
            filters={orderFilters}
            onFilterChange={(f) => {
              setOrderFilters(f);
              setOrderPage(1);
            }}
            data={orderStats}
            isLoading={isOrdersLoading}
            currentPage={orderPage}
            onPageChange={setOrderPage}
          />
        ) : activeTab === "operations" ? (
          <div className="space-y-6">
            {/* System KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <KpiCard
                label={t("opsOverview.totalUsers")}
                value={(systemSummary?.totalUsers || 0).toLocaleString(locale === "en" ? "en-US" : "vi-VN")}
                isLoading={isSystemLoading}
                delay={0}
                locale={locale}
              />
              <KpiCard
                label={t("opsOverview.newUsers")}
                value={(systemSummary?.newUsersThisMonth || 0).toLocaleString(locale === "en" ? "en-US" : "vi-VN")}
                sub={systemSummary?.filterTimeLines.find((f) => f.value === systemTimeline)?.label}
                isLoading={isSystemLoading}
                delay={1}
                locale={locale}
              />
              <KpiCard
                label={t("opsOverview.memberCount")}
                value={(systemSummary?.memberCount || 0).toLocaleString(locale === "en" ? "en-US" : "vi-VN")}
                isLoading={isSystemLoading}
                delay={2}
                locale={locale}
              />
              <KpiCard
                label={t("opsOverview.clubOwnerCount")}
                value={(systemSummary?.clubOwnerCount || 0).toLocaleString(locale === "en" ? "en-US" : "vi-VN")}
                isLoading={isSystemLoading}
                delay={3}
                locale={locale}
              />
              <KpiCard
                label={t("opsOverview.pendingApprovals")}
                value={(systemSummary?.pendingClubApprovals || 0).toLocaleString(locale === "en" ? "en-US" : "vi-VN")}
                isLoading={isSystemLoading}
                delay={4}
                locale={locale}
              />
            </div>

            {/* Timeline Filter */}
            <div className="flex items-center justify-between bg-[#181b22] p-4 rounded-2xl border border-white/[0.07]">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-emerald-400" size={18} />
                <h3 className="text-[13px] font-bold text-white">{t("opsOverview.timelineFilter")}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {systemSummary?.filterTimeLines.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSystemTimeline(opt.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                      systemTimeline === opt.value
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                        : "bg-white/[0.02] border-white/[0.05] text-[#5a6070] hover:text-[#a0a8b8] hover:border-white/[0.1]"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Placeholder for future operation charts/lists */}
              <div className="bg-[#181b22] rounded-2xl p-6 border border-white/[0.07] min-h-[300px] flex flex-col items-center justify-center text-center">
                <Users className="text-emerald-500/20 mb-4" size={48} />
                <h4 className="text-[14px] font-bold text-white mb-2">{t("opsOverview.userGrowthTitle")}</h4>
                <p className="text-[11px] text-[#6a7080] max-w-[280px]">{t("opsOverview.userGrowthDesc")}</p>
              </div>
              <div className="bg-[#181b22] rounded-2xl p-6 border border-white/[0.07] min-h-[300px] flex flex-col items-center justify-center text-center">
                <Trophy className="text-emerald-500/20 mb-4" size={48} />
                <h4 className="text-[14px] font-bold text-white mb-2">{t("opsOverview.clubActivityTitle")}</h4>
                <p className="text-[11px] text-[#6a7080] max-w-[280px]">{t("opsOverview.clubActivityDesc")}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
