"use client";

import React, { useMemo } from "react";
import { AdminCompetitionStats } from "@/validations/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useLocale, useTranslations } from "@/providers/i18n-provider";

interface Props {
  data?: AdminCompetitionStats;
  isLoading: boolean;
}

function CompetitionTag({ status, phase }: { status: string; phase: string | null }) {
  const t = useTranslations("SystemDashboard.competitionActivity.status");
  
  if (status === "RESULT_PUBLISHED") {
    return (
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        {t("resultPublished")}
      </span>
    );
  }
  
  if (status === "PUBLISHED") {
    if (phase === "FINISHED") {
      return (
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
          {t("awaiting")}
        </span>
      );
    }

    const PHASE_KEYS: Record<string, string> = {
      UPCOMING: "upcoming",
      COMING_SOON: "comingSoon",
      REGISTRATION_OPEN: "regOpen",
      REGISTRATION_CLOSED: "regClosed",
      ONGOING: "ongoing",
      FINISHED: "awaiting",
    };

    const PHASE_COLORS: Record<string, string> = {
      UPCOMING: "#64748b",
      COMING_SOON: "#eab308",
      REGISTRATION_OPEN: "#22c55e",
      REGISTRATION_CLOSED: "#ef4444",
      ONGOING: "#3b82f6",
      FINISHED: "#f59e0b",
    };

    const key = PHASE_KEYS[phase || ""] || "published";
    const color = PHASE_COLORS[phase || ""] || "#3b82f6";

    return (
      <span 
        className="text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm"
        style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}30` }}
      >
        {t(key as any)}
      </span>
    );
  }

  const STATUS_KEYS: Record<string, string> = {
    PUBLISHED: "published",
    RESULT_PUBLISHED: "resultPublished",
    DRAFT: "draft",
    CANCELLED: "cancelled",
    INVALID: "invalid",
  };

  const STATUS_COLORS: Record<string, string> = {
    PUBLISHED: "#3b82f6",
    RESULT_PUBLISHED: "#10b981",
    DRAFT: "#9ca3af",
    CANCELLED: "#ef4444",
    INVALID: "#f97316",
  };

  const key = STATUS_KEYS[status] || status;
  const color = STATUS_COLORS[status] || "#6a7080";

  return (
    <span
      className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
      style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}30` }}
    >
      {STATUS_KEYS[status] ? t(key as any) : status}
    </span>
  );
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-[#1e2130] border border-white/[0.08] rounded-xl px-3 py-2 text-[11px]">
      <p className="font-medium text-[#7a8090]">{d.name}</p>
      <p className="font-bold text-white">{d.value}</p>
    </div>
  );
}

export default function AdminCompetitionStatsSection({ data, isLoading }: Props) {
  const t = useTranslations("SystemDashboard.competitionActivity");
  const locale = useLocale();

  const pieData = useMemo(() => {
    if (!data?.overview || !data?.topByParticipants) return [];
    const { publishedCompetitions, completedCompetitions, draftCompetitions, cancelledCompetitions, invalidCompetitions } = data.overview;
    
    // Calculate breakdown from top list (approximation)
    const publishedInList = data.topByParticipants.filter(c => c.competitionStatus === "PUBLISHED");
    const awaitingInList = publishedInList.filter(c => c.competitionPhase === "FINISHED").length;
    
    // Use the count from the list directly if the total is small, otherwise approximate
    const awaitingValue = publishedInList.length > 0 && publishedInList.length === publishedCompetitions 
      ? awaitingInList 
      : publishedInList.length > 0 
        ? Math.round((awaitingInList / publishedInList.length) * publishedCompetitions) 
        : 0;
    const ongoingValue = publishedCompetitions - awaitingValue;

    return [
      { name: t("status.ongoing"), value: ongoingValue, color: "#3b82f6" },
      { name: t("status.awaiting"), value: awaitingValue, color: "#f59e0b" },
      { name: t("status.resultPublished"), value: completedCompetitions, color: "#10b981" },
      { name: t("status.draft"), value: draftCompetitions, color: "#6a7080" },
      { name: t("status.cancelled"), value: (cancelledCompetitions || 0) + (invalidCompetitions || 0), color: "#ef4444" },
    ].filter((d) => d.value > 0);
  }, [data, t]);

  const barData = useMemo(() => {
    if (!data?.topByParticipants) return [];
    return data.topByParticipants.slice(0, 6).map((c) => ({
      name: c.nameVN.length > 16 ? c.nameVN.substring(0, 16) + "..." : c.nameVN,
      participants: c.participantCount,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full bg-white/[0.03] rounded-xl" />
        <Skeleton className="h-32 w-full bg-white/[0.03] rounded-xl" />
      </div>
    );
  }

  const ov = data?.overview;

  return (
    <div className="space-y-4">
      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {[
          { label: t("summaryLabels.total"), value: ov?.totalCompetitions || 0, color: "text-white", bg: "bg-[#1e2130]" },
          { label: t("summaryLabels.deploying"), value: ov?.publishedCompetitions || 0, color: "text-blue-400", bg: "bg-blue-500/[0.06]" },
          { label: t("summaryLabels.completed"), value: ov?.completedCompetitions || 0, color: "text-emerald-400", bg: "bg-emerald-500/[0.06]" },
          { label: t("summaryLabels.invalid"), value: ov?.invalidCompetitions || 0, color: "text-purple-400", bg: "bg-purple-500/[0.06]" },
          { label: t("summaryLabels.participants"), value: (ov?.totalParticipants || 0).toLocaleString(locale === "en" ? "en-US" : "vi-VN"), color: "text-[#9ca3af]", bg: "bg-[#1e2130]" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
            className={cn("rounded-xl p-3 text-center border border-white/[0.05]", item.bg)}
          >
            <p className="text-[9px] text-[#6a7080] uppercase tracking-wider mb-1">{item.label}</p>
            <p className={cn("text-lg font-bold", item.color)}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Donut */}
        {pieData.length > 0 && (
          <div className="bg-[#1e2130] rounded-xl p-4 border border-white/[0.05]">
            <p className="text-[10px] text-[#6a7080] uppercase tracking-wider mb-3">{t("charts.allocation")}</p>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={22}
                      outerRadius={34}
                      paddingAngle={2}
                      dataKey="value"
                      animationDuration={800}
                    >
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 flex-1">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] text-[#8a9099] flex-1 font-medium">{item.name}</span>
                    <span className="text-[10px] font-semibold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bar */}
        {barData.length > 0 && (
          <div className="bg-[#1e2130] rounded-xl p-4 border border-white/[0.05]">
            <p className="text-[10px] text-[#6a7080] uppercase tracking-wider mb-3">{t("charts.topParticipants")}</p>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={10}>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#5a6070", fontSize: 8 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5a6070", fontSize: 8 }} width={20} />
                  <Tooltip
                    contentStyle={{ background: "#1e2130", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", fontSize: "11px" }}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="participants" fill="#6366f1" radius={[2, 2, 0, 0]} opacity={0.8} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {data?.topByParticipants && data.topByParticipants.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[450px]">
            <thead>
              <tr className="text-[10px] text-[#6a7080] uppercase tracking-wider border-b border-white/[0.05]">
                <th className="text-left py-2 px-2 font-semibold w-16">{t("table.id")}</th>
                <th className="text-left py-2 px-2 font-semibold">{t("table.competition")}</th>
                <th className="text-center py-2 px-2 font-semibold">{t("table.status")}</th>
                <th className="text-right py-2 px-2 font-semibold">{t("table.participants")}</th>
                <th className="text-center py-2 px-2 font-semibold">{t("table.time")}</th>
              </tr>
            </thead>
            <tbody>
              {data.topByParticipants.map((comp, i) => (
                <motion.tr
                  key={comp.competitionId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-2">
                    <span className="text-[10px] font-bold text-[#5a6070]">
                      #{i + 1}
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <p className="text-[11px] text-white font-medium truncate max-w-[180px]">{comp.nameVN}</p>
                    <p className="text-[9px] text-[#6a7080]">{comp.clubNameVN}</p>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <CompetitionTag status={comp.competitionStatus} phase={comp.competitionPhase} />
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <span className="text-[11px] font-semibold text-[#8a9099]">{comp.participantCount.toLocaleString(locale === "en" ? "en-US" : "vi-VN")}</span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-white font-medium">
                        {new Date(comp.startDate).toLocaleString(locale === "en" ? "en-US" : "vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-[1px] bg-[#333745]" />
                        <span className="text-[9px] text-[#6a7080]">
                          {new Date(comp.endDate).toLocaleString(locale === "en" ? "en-US" : "vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
