"use client";

import React, { useMemo } from "react";
import { ClubCompetitionStats } from "@/validations/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Trophy, Timer, CheckCircle, Users, Star, TrendingUp, Clock } from "lucide-react";

interface Props {
  data?: ClubCompetitionStats;
  isLoading: boolean;
}

const STATUS: Record<string, { label: string; color: string }> = {
  PUBLISHED: { label: "Đang công khai", color: "#3b82f6" },
  RESULT_PUBLISHED: { label: "Đã hoàn tất", color: "#10b981" },
  DRAFT: { label: "Bản nháp", color: "#9ca3af" },
  CANCELLED: { label: "Đã hủy", color: "#ef4444" },
  INVALID: { label: "Không hợp lệ", color: "#f97316" },
};

const PHASE: Record<string, { label: string; color: string }> = {
  UPCOMING: { label: "Sắp tới", color: "#64748b" },
  COMING_SOON: { label: "Sắp diễn ra", color: "#eab308" },
  REGISTRATION_OPEN: { label: "Mở đăng ký", color: "#22c55e" },
  REGISTRATION_CLOSED: { label: "Đóng đăng ký", color: "#ef4444" },
  ONGOING: { label: "Đang diễn ra", color: "#3b82f6" },
  FINISHED: { label: "Chờ công bố", color: "#f59e0b" },
};

function CompetitionTag({ status, phase }: { status: string; phase: string | null }) {
  if (status === "RESULT_PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <CheckCircle size={10} />
        Đã hoàn tất
      </span>
    );
  }
  
  if (status === "PUBLISHED") {
    if (phase === "FINISHED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <Clock size={10} />
          Chờ công bố
        </span>
      );
    }
    const p = PHASE[phase || ""] || { label: "Đang công khai", color: "#3b82f6" };
    return (
      <span 
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold"
        style={{ backgroundColor: `${p.color}15`, color: p.color, border: `1px solid ${p.color}30` }}
      >
        <Timer size={10} />
        {p.label}
      </span>
    );
  }

  const s = STATUS[status] || { label: status, color: "#6a7080" };
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold"
      style={{ backgroundColor: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}
    >
      {s.label}
    </span>
  );
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-[#181b22] border border-white/[0.07] rounded-xl px-3 py-2 text-[11px] shadow-xl">
      <p className="font-medium text-[#6a7080]">{d.name}</p>
      <p className="font-bold text-white">{d.value}</p>
    </div>
  );
}

export default function ManagerClubCompetitionStatsSection({ data, isLoading }: Props) {
  const pieData = useMemo(() => {
    if (!data?.overview || !data?.topByParticipants) return [];
    const { publishedCompetitions, completedCompetitions, draftCompetitions, cancelledCompetitions, invalidCompetitions } = data.overview;
    
    const publishedInList = data.topByParticipants.filter(c => c.competitionStatus === "PUBLISHED");
    const awaitingInList = publishedInList.filter(c => c.competitionPhase === "FINISHED").length;
    
    const awaitingValue = publishedInList.length > 0 && publishedInList.length === publishedCompetitions 
      ? awaitingInList 
      : publishedInList.length > 0 
        ? Math.round((awaitingInList / publishedInList.length) * publishedCompetitions) 
        : 0;
    const ongoingValue = publishedCompetitions - awaitingValue;

    return [
      { name: "Đang diễn ra", value: ongoingValue, color: "#3b82f6" },
      { name: "Chờ công bố", value: awaitingValue, color: "#f59e0b" },
      { name: "Đã hoàn tất", value: completedCompetitions, color: "#10b981" },
      { name: "Bản nháp", value: draftCompetitions, color: "#6a7080" },
      { name: "Khác", value: (cancelledCompetitions || 0) + (invalidCompetitions || 0), color: "#ef4444" },
    ].filter((d) => d.value > 0);
  }, [data]);

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
        <Skeleton className="h-20 w-full bg-white/[0.04] rounded-xl" />
        <Skeleton className="h-32 w-full bg-white/[0.04] rounded-xl" />
      </div>
    );
  }

  const ov = data?.overview;

  return (
    <div className="space-y-4">
      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          {
            label: "Tổng cuộc thi",
            value: ov?.totalCompetitions || 0,
            icon: Trophy,
            color: "text-white",
            bg: "bg-[#1e2130]",
            borderColor: "border-white/[0.07]"
          },
          {
            label: "Đang triển khai",
            value: ov?.publishedCompetitions || 0,
            icon: Timer,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            borderColor: "border-blue-500/20"
          },
          {
            label: "Đã hoàn tất",
            value: ov?.completedCompetitions || 0,
            icon: CheckCircle,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            borderColor: "border-emerald-500/20"
          },
          {
            label: "Không hợp lệ",
            value: ov?.invalidCompetitions || 0,
            icon: Star,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            borderColor: "border-purple-500/20"
          },
          {
            label: "Tổng thí sinh",
            value: (ov?.totalParticipants || 0).toLocaleString("vi-VN"),
            icon: Users,
            color: "text-[#9ca3af]",
            bg: "bg-[#1e2130]",
            borderColor: "border-white/[0.07]"
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className={cn("rounded-xl p-4 border transition-all hover:scale-[1.02]", item.bg, item.borderColor)}
          >
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <item.icon size={12} className={item.color} />
              <p className="text-[9px] text-[#6a7080] uppercase tracking-widest font-bold">{item.label}</p>
            </div>
            <p className={cn("text-xl font-bold text-center", item.color)}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut */}
        {pieData.length > 0 && (
          <div className="bg-[#1e2130] rounded-xl p-4 border border-white/[0.07]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-[#6a7080] uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Star size={10} className="text-blue-400" />
                Phân bổ trạng thái
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={24}
                      outerRadius={36}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={800}
                    >
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] text-[#6a7080] flex-1 font-medium">{item.name}</span>
                    <span className="text-[11px] font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bar */}
        {barData.length > 0 && (
          <div className="bg-[#1e2130] rounded-xl p-4 border border-white/[0.07]">
            <p className="text-[10px] text-[#6a7080] uppercase tracking-widest mb-3 font-bold flex items-center gap-1.5">
              <TrendingUp size={10} className="text-blue-400" />
              Top thí sinh
            </p>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={14}>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#52525b", fontSize: 8 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#52525b", fontSize: 8 }} width={20} />
                  <Tooltip
                    contentStyle={{ background: "#181b22", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", fontSize: "11px" }}
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  />
                  <Bar dataKey="participants" fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.8} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {data?.topByParticipants && data.topByParticipants.length > 0 && (
        <div className="bg-[#1e2130] rounded-xl border border-white/[0.07] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-[9px] text-[#5a6070] uppercase tracking-widest font-bold border-b border-white/[0.05]">
                <th className="text-left py-3 px-4 w-12">#</th>
                <th className="text-left py-3 px-4">Cuộc thi</th>
                <th className="text-center py-3 px-4">Trạng thái</th>
                <th className="text-right py-3 px-4">Thí sinh</th>
                <th className="text-center py-3 px-4">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {data.topByParticipants.slice(0, 5).map((comp, i) => (
                <motion.tr
                  key={comp.competitionId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold text-[#5a6070]">#{i + 1}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-[12px] font-semibold text-[#d1d5db] truncate max-w-[200px]">{comp.nameVN}</p>
                    <p className="text-[9px] text-[#5a6070]">{comp.nameEN}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CompetitionTag status={comp.competitionStatus} phase={comp.competitionPhase} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Users size={10} className="text-purple-400" />
                      <span className="text-[12px] font-bold text-[#d1d5db]">{comp.participantCount.toLocaleString("vi-VN")}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-white font-medium">
                        {new Date(comp.startDate).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-[9px] text-[#5a6070]">
                        đến {new Date(comp.endDate).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
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
