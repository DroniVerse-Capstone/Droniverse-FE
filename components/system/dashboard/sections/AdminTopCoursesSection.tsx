"use client";

import React, { useMemo } from "react";
import { AdminRevenueByCourseData } from "@/validations/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  data?: AdminRevenueByCourseData;
  isLoading: boolean;
}

const COLORS = [
  "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#c084fc", "#818cf8",
];

const fmtVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-[#1e2130] border border-white/[0.08] rounded-xl px-3 py-2 text-[11px]">
      <p className="text-[#6a7080] mb-1">{d.name}</p>
      <p className="font-bold text-white">{fmtVND(Number(d.value) || 0)}</p>
    </div>
  );
}

interface CourseItem {
  courseId: string;
  courseNameVN: string;
  courseNameEN: string;
  imageUrl: string | null;
  revenue: number;
  sharePct: number;
  barPct: number;
}

export default function AdminTopCoursesSection({ data, isLoading }: Props) {
  const raw = data?.revenueByCourse;
  const rawTotal = raw && Array.isArray(raw)
    ? raw.reduce((s, item) => s + (Number(item.revenue) || 0), 0)
    : 0;

  const items: CourseItem[] = useMemo(() => {
    if (!raw || !Array.isArray(raw) || raw.length === 0) return [];

    const revenues = raw.map((item) => Number(item.revenue) || 0);
    const total = revenues.reduce((s, v) => s + v, 0);
    const maxRev = Math.max(...revenues, 1);

    return raw.slice(0, 6).map((item) => ({
      courseId: item.courseInfo?.courseId ?? "",
      courseNameVN: item.courseInfo?.courseNameVN ?? "",
      courseNameEN: item.courseInfo?.courseNameEN ?? "",
      imageUrl: item.courseInfo?.imageUrl ?? null,
      revenue: Number(item.revenue) || 0,
      sharePct: total > 0 ? ((Number(item.revenue) || 0) / total) * 100 : 0,
      barPct: ((Number(item.revenue) || 0) / maxRev) * 100,
    }));
  }, [raw]);

  const displayTotal = rawTotal > 0 ? rawTotal : items.reduce((s, d) => s + d.revenue, 0);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded bg-white/[0.04]" />
            <Skeleton className="h-9 w-9 rounded-lg bg-white/[0.04]" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-40 bg-white/[0.04]" />
              <Skeleton className="h-0.5 w-full bg-white/[0.04] rounded-full" />
            </div>
            <Skeleton className="h-4 w-28 bg-white/[0.04]" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <p className="text-[12px] text-[#6a7080] py-4">Chưa có dữ liệu khóa học</p>;
  }

  return (
    <div className="space-y-4">
      {/* Donut + Legend */}
      <div className="flex gap-5 items-center">
        <div className="relative w-24 h-24 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items.map((item) => ({ name: item.courseNameVN, value: item.revenue }))}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={44}
                paddingAngle={2}
                dataKey="value"
                animationDuration={1000}
              >
                {items.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[9px] text-[#6a7080]">Tổng</p>
            <p className="text-[11px] font-bold text-white leading-tight">
              {displayTotal >= 1_000_000
                ? `${(displayTotal / 1_000_000).toFixed(1)}M`
                : displayTotal >= 1_000
                  ? `${(displayTotal / 1_000).toFixed(0)}K`
                  : displayTotal.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5">
          {items.map((item, i) => (
            <div key={item.courseId} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-[11px] text-[#8a9099] flex-1 truncate font-medium">{item.courseNameVN}</span>
              <span className="text-[10px] text-[#5a6070] flex-shrink-0 font-medium">{item.sharePct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Course rows */}
      <div className="divide-y divide-white/[0.03]">
        {items.map((item, i) => {
          const color = COLORS[i % COLORS.length];
          return (
            <motion.div
              key={item.courseId}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="flex items-center gap-3 py-3 hover:bg-white/[0.02] rounded-lg transition-colors cursor-pointer"
            >
              <span className={cn("w-5 text-center text-[12px] font-bold flex-shrink-0", i === 0 ? "text-blue-400" : "text-[#6a7080]")}>
                {i + 1}
              </span>

              {/* Image */}
              <div className="w-9 h-9 rounded-lg border border-white/[0.07] overflow-hidden bg-[#1e2130] flex-shrink-0">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.courseNameVN}
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-[#232730] flex items-center justify-center">
                    <span className="text-[11px] font-bold text-[#6a7080]">{item.courseNameVN.charAt(0) || "?"}</span>
                  </div>
                )}
              </div>

              {/* Info + bar */}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-white truncate">{item.courseNameVN}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.barPct}%` }}
                      transition={{ duration: 0.8, delay: 0.1 + i * 0.06 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="text-right flex-shrink-0">
                <p className="text-[12px] font-bold text-white">{fmtVND(item.revenue)}</p>
                <p className="text-[10px] text-[#6a7080]">{item.sharePct.toFixed(1)}%</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
        <span className="text-[10px] text-[#6a7080]">{items.length} khóa học</span>
        <span className="text-[12px] font-bold text-white">{fmtVND(displayTotal)}</span>
      </div>
    </div>
  );
}
