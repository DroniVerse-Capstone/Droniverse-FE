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

interface Props {
  data?: AdminCompetitionStats;
  isLoading: boolean;
}

const STATUS: Record<string, { label: string; color: string }> = {
  PUBLISHED: { label: "Đang bay", color: "#3b82f6" },
  RESULT_PUBLISHED: { label: "Đã kết thúc", color: "#10b981" },
  DRAFT: { label: "Bản nháp", color: "#6a7080" },
  CANCELLED: { label: "Đã hủy", color: "#ef4444" },
  PENDING: { label: "Chờ duyệt", color: "#f59e0b" },
};

function StatusTag({ status }: { status: string }) {
  const s = STATUS[status] || { label: status, color: "#6a7080" };
  return (
    <span
      className="text-[9px] font-semibold px-2 py-0.5 rounded-md"
      style={{ backgroundColor: `${s.color}18`, color: s.color }}
    >
      {s.label}
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
  const pieData = useMemo(() => {
    if (!data?.overview) return [];
    const { totalCompetitions, ongoingCompetitions, completedCompetitions, draftCompetitions, cancelledCompetitions } = data.overview;
    return [
      { name: "Đang bay", value: ongoingCompetitions, color: "#3b82f6" },
      { name: "Đã kết thúc", value: completedCompetitions, color: "#10b981" },
      { name: "Bản nháp", value: draftCompetitions, color: "#6a7080" },
      { name: "Đã hủy", value: cancelledCompetitions, color: "#ef4444" },
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
        <Skeleton className="h-16 w-full bg-white/[0.03] rounded-xl" />
        <Skeleton className="h-32 w-full bg-white/[0.03] rounded-xl" />
      </div>
    );
  }

  const ov = data?.overview;

  return (
    <div className="space-y-4">
      {/* Stat row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Tổng cuộc thi", value: ov?.totalCompetitions || 0, color: "text-white", bg: "bg-[#1e2130]" },
          { label: "Đang bay", value: ov?.ongoingCompetitions || 0, color: "text-blue-400", bg: "bg-blue-500/[0.06]" },
          { label: "Đã kết thúc", value: ov?.completedCompetitions || 0, color: "text-emerald-400", bg: "bg-emerald-500/[0.06]" },
          { label: "Tổng thí sinh", value: (ov?.totalParticipants || 0).toLocaleString("vi-VN"), color: "text-[#9ca3af]", bg: "bg-[#1e2130]" },
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
            <p className="text-[10px] text-[#6a7080] uppercase tracking-wider mb-3">Phân bổ trạng thái</p>
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
            <p className="text-[10px] text-[#6a7080] uppercase tracking-wider mb-3">Top thí sinh theo cuộc thi</p>
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
                <th className="text-left py-2 px-2 font-semibold">Cuộc thi</th>
                <th className="text-center py-2 px-2 font-semibold">Trạng thái</th>
                <th className="text-right py-2 px-2 font-semibold">Thí sinh</th>
                <th className="text-center py-2 px-2 font-semibold">Ngày bắt đầu</th>
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
                    <p className="text-[11px] text-white font-medium truncate">{comp.nameVN}</p>
                    <p className="text-[9px] text-[#6a7080]">{comp.clubNameVN}</p>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <StatusTag status={comp.status} />
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <span className="text-[11px] font-semibold text-[#8a9099]">{comp.participantCount.toLocaleString("vi-VN")}</span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="text-[10px] text-[#6a7080]">
                      {new Date(comp.startDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                    </span>
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
