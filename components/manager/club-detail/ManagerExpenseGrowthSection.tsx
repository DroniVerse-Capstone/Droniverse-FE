"use client";

import React, { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, BarChart3, Activity } from "lucide-react";
import { useTranslations, useLocale } from "@/providers/i18n-provider";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";

interface Props {
  growthChartData: { month: string; value: number }[];
  totalValue: number;
  growthRate: number;
  months: number | "custom";
  onMonthsChange: (months: number | "custom") => void;
  isLoading: boolean;
  fromDate?: string;
  toDate?: string;
  isCustom?: boolean;
}

const fmtVND = (v: number, locale: string) =>
  new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(v);

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  t: any;
  locale: string;
}

function ChartTooltip({ active, payload, label, t, locale }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const cur = payload[0]?.value ?? 0;
  const fullName = payload[0]?.payload?.fullName || label;
  return (
    <div className="bg-[#181b22] border border-white/[0.07] rounded-xl px-4 py-3 shadow-xl">
      <p className="text-[#6a7080] font-medium mb-2 text-[11px]">{fullName}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-8 items-center">
          <span className="text-[#6a7080] text-[11px] flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            {t("revenueTrend.revenue") || "Revenue"}
          </span>
          <span className="font-bold text-white text-[12px]">{fmtVND(cur, locale)}</span>
        </div>
      </div>
    </div>
  );
}

export default function ManagerExpenseGrowthSection({
  growthChartData,
  totalValue,
  growthRate,
  months,
  onMonthsChange,
  isLoading,
  fromDate,
  toDate,
  isCustom,
}: Props) {
  const t = useTranslations("ClubManagerDashboard");
  const locale = useLocale();
  const [mode, setMode] = useState<"area" | "bar">("area");

  const chartData = useMemo(() => {
    if (!growthChartData) return [];
    const dateLocale = locale === "en" ? enUS : vi;

    // Check if we have multiple points in the same month
    const monthCounts = new Map();
    growthChartData.forEach((item) => {
      const monthStr = format(new Date(item.month), "yyyy-MM");
      monthCounts.set(monthStr, (monthCounts.get(monthStr) || 0) + 1);
    });

    const hasHighGranularity = Array.from(monthCounts.values()).some((count) => count > 1);

    return growthChartData.map((item) => {
      const date = new Date(item.month);
      const name = hasHighGranularity
        ? format(date, locale === "en" ? "MMM d" : "d/M", { locale: dateLocale })
        : growthChartData.length > 12
        ? format(date, "MM/yy", { locale: dateLocale })
        : format(date, "MMM", { locale: dateLocale });

      return {
        name,
        fullName: format(date, locale === "en" ? "MMMM d, yyyy" : "d MMMM yyyy", { locale: dateLocale }),
        value: item.value,
      };
    });
  }, [growthChartData, locale]);

  const avg = useMemo(() => {
    if (!chartData.length) return 0;
    return chartData.reduce((s, d) => s + d.value, 0) / chartData.length;
  }, [chartData]);

  // Smart tick interval for long ranges
  const tickInterval = useMemo(() => {
    if (chartData.length > 20) return 3;
    if (chartData.length > 12) return 2;
    return 0;
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="border border-white/[0.04] rounded-xl p-5">
        <Skeleton className="h-[260px] w-full rounded-xl bg-white/[0.04]" />
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="h-[260px] flex items-center justify-center">
        <p className="text-[12px] text-[#5a5f6a]">
          {isCustom
            ? locale === "en"
              ? "No data in selected range"
              : "Không có dữ liệu trong khoảng thời gian này"
            : locale === "en"
            ? `No data in last ${months} months`
            : `Không có dữ liệu trong ${months} tháng qua`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[10px] text-[#6a7080] uppercase tracking-wider font-semibold">
              {t("kpi.totalRevenue")}
            </p>
            <p className="text-xl font-bold text-white mt-0.5">{fmtVND(totalValue, locale)}</p>
          </div>
          <div className="h-8 w-px bg-white/[0.06]" />
          <div>
            <p className="text-[10px] text-[#6a7080] uppercase tracking-wider font-semibold">
              {t("kpi.avgLabel")}
            </p>
            <p className="text-xl font-bold text-white mt-0.5">{fmtVND(avg, locale)}</p>
          </div>
        </div>

        {/* Mode Toggle & Growth */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#1e2130] border border-white/[0.07] rounded-xl p-1">
            <button
              onClick={() => setMode("area")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all",
                mode === "area"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-[#6a7080] hover:text-[#a0a8b8]"
              )}
            >
              <Activity size={12} />
              {t("revenueTrend.chartType.area") || "Area"}
            </button>
            <button
              onClick={() => setMode("bar")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all",
                mode === "bar"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-[#6a7080] hover:text-[#a0a8b8]"
              )}
            >
              <BarChart3 size={12} />
              {t("revenueTrend.chartType.bar") || "Bar"}
            </button>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
              growthRate >= 0
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            )}
          >
            {growthRate >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="text-xs font-bold">
              {growthRate >= 0 ? "+" : ""}
              {growthRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[260px] -mx-2">
        {mode === "area" ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gAreaClubV2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gAreaClubV2Stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#52525b", fontSize: 10 }}
                dy={10}
                interval={tickInterval}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#52525b", fontSize: 10 }}
                tickFormatter={(v) => {
                  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
                  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
                  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
                  return v;
                }}
                width={55}
              />
              <Tooltip
                content={<ChartTooltip t={t} locale={locale} />}
                cursor={{ stroke: "rgba(59,130,246,0.3)", strokeWidth: 1.5 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="url(#gAreaClubV2Stroke)"
                strokeWidth={2.5}
                fill="url(#gAreaClubV2)"
                dot={false}
                activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#181b22" }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} barSize={18}>
              <defs>
                <linearGradient id="gBarClubV2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#52525b", fontSize: 10 }}
                dy={10}
                interval={tickInterval}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#52525b", fontSize: 10 }}
                tickFormatter={(v) => {
                  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
                  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
                  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
                  return v;
                }}
                width={55}
              />
              <Tooltip content={<ChartTooltip t={t} locale={locale} />} cursor={{ fill: "rgba(59,130,246,0.08)" }} />
              <Bar dataKey="value" fill="url(#gBarClubV2)" radius={[6, 6, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
