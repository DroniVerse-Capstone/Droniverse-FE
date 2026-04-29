"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import type { ClubExpenseByCourseItem } from "@/validations/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import EmptyState from "@/components/common/EmptyState";
import { BookOpen, Flame, TrendingUp } from "lucide-react";

const TOP_OPTIONS = [5, 10, 15] as const;

type ManagerTopCoursesSectionProps = {
  byCourseSeries: ClubExpenseByCourseItem[];
  selectedTop: (typeof TOP_OPTIONS)[number];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
};

// Blue gradient colors
const COLORS = [
  { main: "#3b82f6", light: "#60a5fa" },
  { main: "#8b5cf6", light: "#a78bfa" },
  { main: "#06b6d4", light: "#22d3ee" },
  { main: "#10b981", light: "#34d399" },
  { main: "#f59e0b", light: "#fbbf24" },
  { main: "#ef4444", light: "#f87171" },
];

const fmtVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-[#181b22] border border-white/[0.07] rounded-xl px-3 py-2 text-[11px] shadow-xl">
      <p className="text-[#6a7080] mb-1 font-medium">{d.name}</p>
      <p className="font-bold text-white">{fmtVND(Number(d.value) || 0)}</p>
    </div>
  );
}

export default function ManagerTopCoursesSection({
  byCourseSeries,
  selectedTop,
  isLoading = false,
  isError = false,
  errorMessage,
}: ManagerTopCoursesSectionProps) {
  const items = useMemo(() => {
    if (!byCourseSeries || !Array.isArray(byCourseSeries) || byCourseSeries.length === 0) return [];

    const revenues = byCourseSeries.map((item) => Number(item.revenue) || 0);
    const total = revenues.reduce((s, v) => s + v, 0);
    const maxRev = Math.max(...revenues, 1);

    return byCourseSeries.slice(0, selectedTop).map((item, idx) => ({
      courseId: item.courseInfo?.courseId ?? "",
      courseNameVN: item.courseInfo?.courseNameVN ?? "",
      courseNameEN: item.courseInfo?.courseNameEN ?? "",
      imageUrl: item.courseInfo?.imageUrl ?? null,
      revenue: Number(item.revenue) || 0,
      sharePct: total > 0 ? ((Number(item.revenue) || 0) / total) * 100 : 0,
      barPct: ((Number(item.revenue) || 0) / maxRev) * 100,
      colorIdx: idx,
    }));
  }, [byCourseSeries, selectedTop]);

  const displayTotal = items.reduce((s, d) => s + d.revenue, 0);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded bg-white/[0.04]" />
            <Skeleton className="h-10 w-10 rounded-lg bg-white/[0.04]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40 bg-white/[0.04]" />
              <Skeleton className="h-1.5 w-full bg-white/[0.04] rounded-full" />
            </div>
            <Skeleton className="h-4 w-28 bg-white/[0.04]" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Không tải được dữ liệu khóa học"
        description={errorMessage || "Vui lòng thử lại sau."}
      />
    );
  }

  if (!items.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#1e2130] flex items-center justify-center mx-auto">
            <BookOpen size={24} className="text-[#5a6070]" />
          </div>
          <p className="text-[12px] text-[#6a7080]">Chưa có dữ liệu khóa học</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Donut + Stats */}
      <div className="flex gap-4 items-center">
        <div className="relative w-20 h-20 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items.map((item) => ({ name: item.courseNameVN, value: item.revenue }))}
                cx="50%"
                cy="50%"
                innerRadius={22}
                outerRadius={36}
                paddingAngle={3}
                dataKey="value"
                animationDuration={1000}
              >
                {items.map((item, i) => (
                  <Cell key={i} fill={COLORS[item.colorIdx % COLORS.length].main} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <Flame size={12} className="text-blue-400 mb-0.5" />
            <p className="text-[10px] font-bold text-white leading-tight">
              {items.length}
            </p>
          </div>
        </div>

        {/* Legend - Top 3 */}
        <div className="flex-1 space-y-1.5">
          {items.slice(0, 3).map((item) => {
            const color = COLORS[item.colorIdx % COLORS.length];
            return (
              <div key={item.courseId} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color.main }}
                />
                <span className="text-[11px] text-[#6a7080] flex-1 truncate font-medium">{item.courseNameVN}</span>
                <span className="text-[10px] text-[#5a6070] flex-shrink-0 font-medium">{item.sharePct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Course rows */}
      <div className="space-y-1">
        {items.map((item, i) => {
          const color = COLORS[item.colorIdx % COLORS.length];
          return (
            <motion.div
              key={item.courseId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="group flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-[#1e2130] transition-all duration-200 cursor-pointer"
            >
              {/* Rank Badge */}
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold",
                i === 0 && "bg-blue-500/20 text-blue-400",
                i === 1 && "bg-[#1e2130] text-[#6a7080] border border-white/[0.07]",
                i === 2 && "bg-purple-500/20 text-purple-400",
                i > 2 && "bg-[#1e2130] text-[#5a6070]"
              )}>
                {i + 1}
              </div>

              {/* Image */}
              <div className="w-10 h-10 rounded-xl bg-[#1e2130] border border-white/[0.07] overflow-hidden flex-shrink-0">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.courseNameVN}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={16} className="text-[#5a6070]" />
                  </div>
                )}
              </div>

              {/* Info + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-[#d1d5db] truncate group-hover:text-white transition-colors">{item.courseNameVN}</p>
                  <TrendingUp size={12} className="text-[#5a6070] group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
                </div>
                <div className="mt-1.5">
                  <div className="h-1.5 bg-[#1e2130] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.barPct}%` }}
                      transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(to right, ${color.main}, ${color.light})` }}
                    />
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="text-right flex-shrink-0 w-28">
                <p className="text-[12px] font-bold text-white">{fmtVND(item.revenue)}</p>
                <p className="text-[10px] text-[#5a6070]">{item.sharePct.toFixed(1)}%</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-2">
          <BookOpen size={12} className="text-[#5a6070]" />
          <span className="text-[10px] text-[#6a7080] font-medium">{items.length} khóa học</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-white">{fmtVND(displayTotal)}</span>
          <span className="text-[9px] text-[#5a6070] px-1.5 py-0.5 bg-[#1e2130] rounded">Tổng</span>
        </div>
      </div>
    </div>
  );
}
