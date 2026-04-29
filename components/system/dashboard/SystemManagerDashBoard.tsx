"use client";

import React, { useEffect, useState } from "react";
import { RefreshCcw } from "lucide-react";
import {
  useGetAdminRevenueOverview,
  useGetAdminRevenueGrowth,
  useGetAdminClubRanking,
  useGetAdminRevenueByCourse,
  useGetAdminTopBuyers,
  useGetAdminCompetitionStats,
} from "@/hooks/dashboard/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import AdminRevenueGrowthSection from "./sections/AdminRevenueGrowthSection";
import AdminClubRankingSection from "./sections/AdminClubRankingSection";
import AdminTopCoursesSection from "./sections/AdminTopCoursesSection";
import AdminTopBuyersSection from "./sections/AdminTopBuyersSection";
import AdminCompetitionStatsSection from "./sections/AdminCompetitionStatsSection";

// === FORMAT ===
const fmtVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

// === KPI CARD ===
interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  diff?: number;
  isLoading: boolean;
  delay: number;
}

function KpiCard({ label, value, sub, trend, diff, isLoading, delay }: KpiCardProps) {
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
            {diff >= 0 ? "+" : ""}{fmtVND(diff)}
          </span>
        )}
        {trend !== undefined && !isLoading && (
           <span className="text-[10px] text-[#4a5060]">so với kỳ trước</span>
        )}
      </div>
    </motion.div>
  );
}

// === MAIN ===
export default function SystemManagerDashBoard() {
  const [monthsGrowth, setMonthsGrowth] = useState(12);
  const [topClubs, setTopClubs] = useState(10);
  const [topBuyers, setTopBuyers] = useState(10);
  const [topComps, setTopComps] = useState(5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { data: overview, isLoading: isOverviewLoading, refetch: refetchOverview, isRefetching } = useGetAdminRevenueOverview();
  const { data: growth, isLoading: isGrowthLoading } = useGetAdminRevenueGrowth({ months: monthsGrowth });
  const { data: rankings, isLoading: isRankingsLoading } = useGetAdminClubRanking({ top: topClubs });
  const { data: courseRevenue, isLoading: isCourseLoading } = useGetAdminRevenueByCourse({ top: 6 });
  const { data: topBuyersData, isLoading: isBuyersLoading } = useGetAdminTopBuyers(topBuyers);
  const { data: compStats, isLoading: isCompLoading } = useGetAdminCompetitionStats(topComps);

  const revenueDiff = (overview?.revenueThisMonth ?? 0) - (overview?.revenueLastMonth ?? 0);
  const profitDiff = (overview?.profitThisMonth ?? 0) - (overview?.profitLastMonth ?? 0);

  const today = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#0f1014] text-[#9ca3af]">
      {/* HEADER */}
      <div className=" top-0 z-30 bg-[#0f1014]/95 backdrop-blur-xl border-b border-white/[0.07]">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white">Trung tâm Điều hành</h1>
            <p className="text-[11px] text-[#6a7080] mt-0.5">{today}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-[#6a7080] font-medium">Cập nhật thời gian thực</span>
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

      <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6">

        {/* === KPI - Tổng quan hệ thống === */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Tổng doanh thu"
            value={fmtVND(overview?.totalRevenue || 0)}
            sub={`${fmtVND(overview?.revenueThisMonth || 0)} tháng này`}
            trend={overview?.revenueGrowthRate}
            diff={revenueDiff}
            isLoading={isOverviewLoading}
            delay={0}
          />
          <KpiCard
            label="Lợi nhuận ròng"
            value={fmtVND(overview?.netProfit || 0)}
            sub={`${fmtVND(overview?.profitThisMonth || 0)} tháng này`}
            trend={overview?.profitGrowthRate}
            diff={profitDiff}
            isLoading={isOverviewLoading}
            delay={1}
          />
          <KpiCard
            label="Tổng giao dịch"
            value={(overview?.totalTransactions || 0).toLocaleString("vi-VN")}
            sub={`${(overview?.transactionsThisMonth || 0).toLocaleString("vi-VN")} giao dịch tháng này`}
            isLoading={isOverviewLoading}
            delay={2}
          />
          <KpiCard
            label="Tổng thí sinh"
            value={(compStats?.overview.totalParticipants || 0).toLocaleString("vi-VN")}
            sub={`${compStats?.overview.ongoingCompetitions || 0} cuộc thi đang diễn ra`}
            isLoading={isCompLoading}
            delay={3}
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
                  <h3 className="text-[13px] font-bold text-white">Xu hướng doanh thu</h3>
                  <p className="text-[11px] text-[#5a5f6a] mt-0.5">
                    {fmtVND(growth?.totalValue || 0)} trong {monthsGrowth} tháng ·{" "}
                    <span className={cn(
                      "font-semibold",
                      (growth?.growthRate || 0) >= 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {growth?.growthRate || 0}% tăng trưởng
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-[#1e2130] border border-white/[0.07] rounded-xl p-1">
                  {[{ v: 6, l: "6 tháng" }, { v: 12, l: "12 tháng" }, { v: 24, l: "24 tháng" }].map((m) => (
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
                  <h3 className="text-[13px] font-bold text-white">Hoạt động cuộc thi</h3>
                  <p className="text-[11px] text-[#5a5f6a] mt-0.5">
                    {compStats?.overview.ongoingCompetitions || 0} đang diễn ra ·{" "}
                    {compStats?.overview.completedCompetitions || 0} đã kết thúc ·{" "}
                    {compStats?.overview.totalCompetitions || 0} tổng cuộc thi
                  </p>
                </div>
                <select
                  value={topComps}
                  onChange={(e) => setTopComps(Number(e.target.value))}
                  className="bg-[#1e2130] border border-white/[0.07] text-[11px] font-medium text-[#8a9099] rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                >
                  <option value={5}>Hiện 5 cuộc thi</option>
                  <option value={10}>Hiện 10 cuộc thi</option>
                </select>
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
              <h3 className="text-[13px] font-bold text-white mb-0.5">Top khóa học</h3>
              <p className="text-[11px] text-[#6a7080] mb-5">Doanh thu theo khóa học</p>
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
                <h3 className="text-[13px] font-bold text-white">Học viên VIP</h3>
                <select
                  value={topBuyers}
                  onChange={(e) => setTopBuyers(Number(e.target.value))}
                  className="bg-[#1e2130] border border-white/[0.07] text-[10px] font-medium text-[#6a7080] rounded-lg px-2 py-1 outline-none cursor-pointer"
                >
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                </select>
              </div>
              <p className="text-[11px] text-[#6a7080] mb-5">Người chi tiêu nhiều nhất hệ thống</p>
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
              <h3 className="text-[13px] font-bold text-white">Xếp hạng câu lạc bộ</h3>
              <p className="text-[11px] text-[#6a7080] mt-0.5">Top câu lạc bộ theo tổng chi tiêu trên hệ thống</p>
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
                  Top {n}
                </button>
              ))}
            </div>
          </div>
          <AdminClubRankingSection data={rankings} isLoading={isRankingsLoading} />
        </motion.div>
      </div>
    </div>
  );
}
