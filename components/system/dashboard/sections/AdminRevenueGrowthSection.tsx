"use client";

import React, { useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, BarChart, Bar,
} from "recharts";
import { AdminRevenueGrowthData } from "@/validations/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/providers/i18n-provider";

interface Props {
  data?: AdminRevenueGrowthData;
  isLoading: boolean;
  months: number;
}

const formatVND = (v: number, locale: string) => {
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0,
  }).format(v);
  return locale === "en" ? `${formatted} VND` : `${formatted} ₫`;
};

interface TTProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: TTProps) {
  const t = useTranslations("SystemDashboard.revenueTrend");
  const locale = useLocale();
  if (!active || !payload?.length) return null;
  const cur = payload[0]?.value ?? 0;
  const prev = payload[1]?.value ?? 0;
  const diff = cur - prev;
  const pct = prev > 0 ? ((diff / prev) * 100).toFixed(1) : "0";
  return (
    <div className="bg-[#1e2130] border border-white/[0.08] rounded-xl px-4 py-3 text-[11px]">
      <p className="text-[#7a8090] font-medium mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-8">
          <span className="text-[#8a9099]">{t("revenue")}</span>
          <span className="font-bold text-white">{formatVND(cur, locale)}</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="text-[#6a7080]">{t("prevPeriod")}</span>
          <span className="text-[#8a9099]">{formatVND(prev, locale)}</span>
        </div>
        <div className={cn(
          "flex justify-between gap-8 pt-1 border-t border-white/[0.06]",
          diff >= 0 ? "text-emerald-400" : "text-red-400"
        )}>
          <span className="font-medium">{diff >= 0 ? t("increase") : t("decrease")}</span>
          <span className="font-bold">{Math.abs(Number(pct))}%</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminRevenueGrowthSection({ data, isLoading, months }: Props) {
  const t = useTranslations("SystemDashboard.revenueTrend");
  const locale = useLocale();
  const [mode, setMode] = useState<"area" | "bar">("area");

  const chartData = useMemo(() => {
    if (!data?.revenueGrowth) return [];
    const dateLocale = locale === "en" ? enUS : vi;
    return data.revenueGrowth.map((item, idx) => ({
      name: format(new Date(item.month), "MMM", { locale: dateLocale }),
      fullName: format(new Date(item.month), "MMMM yyyy", { locale: dateLocale }),
      revenue: item.value,
      prev: idx > 0 ? data.revenueGrowth[idx - 1].value : item.value,
    }));
  }, [data, locale]);

  const avg = useMemo(() => {
    if (!chartData.length) return 0;
    return chartData.reduce((s, d) => s + d.revenue, 0) / chartData.length;
  }, [chartData]);

  if (isLoading) {
    return <Skeleton className="h-[260px] w-full rounded-xl bg-white/[0.03]" />;
  }

  if (!chartData.length) {
    return (
      <div className="h-[260px] flex items-center justify-center">
        <p className="text-[12px] text-[#5a5f6a]">{t("empty", { count: months })}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center gap-1 mb-4 bg-[#1e2130] border border-white/[0.06] rounded-xl p-1 w-fit">
        {(["area", "bar"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all",
              mode === m ? "bg-blue-500 text-white" : "text-[#7a8090] hover:text-[#a0a8b8]"
            )}
          >
            {t(`chartType.${m}` as any)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[260px]">
        {mode === "area" ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#5a6070", fontSize: 10 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5a6070", fontSize: 10 }} tickFormatter={(v) => {
                if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
                if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
                return v;
              }} width={55} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(59,130,246,0.3)", strokeWidth: 1 }} />
              <ReferenceLine y={avg} stroke="rgba(255,255,255,0.07)" strokeDasharray="4 3" label={undefined} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gArea)" dot={false}
                activeDot={{ r: 5, fill: "#3b82f6", strokeWidth: 2, stroke: "#111318" }} animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 0, left: -10, bottom: 0 }} barSize={16}>
              <defs>
                <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.25} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#5a6070", fontSize: 10 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5a6070", fontSize: 10 }} tickFormatter={(v) => {
                if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
                if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
                return v;
              }} width={55} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="revenue" fill="url(#gBar)" radius={[4, 4, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Growth strip */}
      <div className="flex items-center gap-3 mt-4">
        <span className={cn(
          "text-[12px] font-bold",
          (data?.growthRate ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
        )}>
          {(data?.growthRate ?? 0) >= 0 ? "+" : ""}{data?.growthRate ?? 0}%
        </span>
        <span className="text-[11px] text-[#6a7080]">{t("growthSummary", { count: months })}</span>
        <div className="flex-1 h-0.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", (data?.growthRate ?? 0) >= 0 ? "bg-emerald-500" : "bg-red-500")}
            style={{ width: `${Math.min(Math.abs(data?.growthRate ?? 0), 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
