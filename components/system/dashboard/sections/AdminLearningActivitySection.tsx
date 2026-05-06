"use client";

import React, { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { AdminLearningStatistics } from "@/validations/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useLocale, useTranslations } from "@/providers/i18n-provider";

interface Props {
  data?: AdminLearningStatistics["weeklyActivity"];
  isLoading: boolean;
}

interface TTProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: TTProps) {
  const t = useTranslations("SystemDashboard.learningStatistics.weeklyActivity");
  if (!active || !payload?.length) return null;
  const lessons = payload[0]?.value ?? 0;
  return (
    <div className="bg-[#1e2130] border border-white/[0.08] rounded-xl px-4 py-3 text-[11px]">
      <p className="text-[#7a8090] font-medium mb-2">{label}</p>
      <div className="flex justify-between gap-8">
        <span className="text-[#8a9099]">{t("lessons")}</span>
        <span className="font-bold text-white">{lessons}</span>
      </div>
    </div>
  );
}

export default function AdminLearningActivitySection({ data, isLoading }: Props) {
  const t = useTranslations("SystemDashboard.learningStatistics.weeklyActivity");
  const locale = useLocale();

  const chartData = useMemo(() => {
    if (!data) return [];
    const dateLocale = locale === "en" ? enUS : vi;
    return data.map((item) => ({
      name: format(new Date(item.date), "EEE dd/MM", { locale: dateLocale }),
      fullName: format(new Date(item.date), "PPPP", { locale: dateLocale }),
      lessons: item.lessonsCompleted,
    }));
  }, [data, locale]);

  if (isLoading) {
    return <Skeleton className="h-[260px] w-full rounded-xl bg-white/[0.03]" />;
  }

  if (!chartData.length) {
    return (
      <div className="h-[260px] flex items-center justify-center">
        <p className="text-[12px] text-[#5a5f6a]">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gLearning" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#5a6070", fontSize: 10 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5a6070", fontSize: 10 }} width={35} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(139, 92, 246, 0.3)", strokeWidth: 1 }} />
          <Area type="monotone" dataKey="lessons" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gLearning)" dot={false}
            activeDot={{ r: 5, fill: "#8b5cf6", strokeWidth: 2, stroke: "#111318" }} animationDuration={1500} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
