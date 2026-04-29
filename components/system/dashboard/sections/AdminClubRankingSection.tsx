"use client";

import React from "react";
import { AdminClubRankingData } from "@/validations/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
  data?: AdminClubRankingData;
  isLoading: boolean;
}

const fmtVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

const RANK_COLORS = [
  "text-blue-400 font-bold",
  "text-[#9ca3af] font-bold",
  "text-amber-400 font-bold",
  "text-[#6a7080]",
  "text-[#6a7080]",
] as const;

const BAR_COLORS = [
  "bg-blue-500",
  "bg-[#7a8090]",
  "bg-amber-500",
  "bg-[#5a6070]",
  "bg-[#5a6070]",
] as const;

export default function AdminClubRankingSection({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/[0.03]" />)}
      </div>
    );
  }

  const clubs = data?.clubs || [];
  const totalAllSpent = clubs.reduce((sum, c) => sum + c.totalSpent, 0);

  if (!clubs.length) {
    return (
      <div className="py-10 text-center">
        <p className="text-[12px] text-[#6a7080]">Chưa có dữ liệu câu lạc bộ</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px]">
        <thead>
          <tr className="text-[10px] text-[#6a7080] uppercase tracking-wider border-b border-white/[0.05]">
            <th className="text-left py-3 px-4 font-semibold">#</th>
            <th className="text-left py-3 px-4 font-semibold">Câu lạc bộ</th>
            <th className="text-left py-3 px-4 font-semibold">Mã CLB</th>
            <th className="text-right py-3 px-4 font-semibold">Giao dịch</th>
            <th className="text-right py-3 px-4 font-semibold">Tổng chi tiêu</th>
            <th className="text-center py-3 px-4 font-semibold w-44">Chiếm</th>
          </tr>
        </thead>
        <tbody>
          {clubs.map((club, i) => {
            const sharePct = totalAllSpent > 0 ? (club.totalSpent / totalAllSpent) * 100 : 0;
            const barPct = clubs[0]?.totalSpent > 0 ? (club.totalSpent / clubs[0].totalSpent) * 100 : 0;

            return (
              <motion.tr
                key={club.clubID}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <td className="py-4 px-4">
                  <span className={cn("text-[15px]", RANK_COLORS[i] ?? "text-[#5a5f6a] font-bold")}>
                    {i + 1}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg border border-white/[0.07] overflow-hidden bg-[#1e2130] flex-shrink-0">
                      {club.imageUrl ? (
                        <Image src={club.imageUrl} alt={club.nameVN} width={36} height={36} className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full bg-[#232730] flex items-center justify-center">
                          <span className="text-[11px] font-bold text-[#6a7080]">{club.nameVN.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">{club.nameVN}</p>
                      {club.nameEN && <p className="text-[10px] text-[#6a7080]">{club.nameEN}</p>}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-[10px] font-mono text-[#7a8090] bg-[#1e2130] border border-white/[0.06] px-2.5 py-1 rounded-lg">
                    {club.clubCode}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-[13px] text-[#9ca3af]">{club.transactionCount.toLocaleString("vi-VN")}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-[14px] font-bold text-white">{fmtVND(club.totalSpent)}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", BAR_COLORS[i] ?? "bg-[#4a4f5a]")}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#5a6070] w-12 text-right font-medium">{sharePct.toFixed(1)}%</span>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-white/[0.07] bg-[#1e2130]/50">
            <td className="py-4 px-4" colSpan={4}>
              <span className="text-[10px] text-[#6a7080] font-medium">{clubs.length} câu lạc bộ</span>
            </td>
            <td className="py-4 px-4 text-right">
              <span className="text-[14px] font-bold text-white">{fmtVND(totalAllSpent)}</span>
            </td>
            <td className="py-4 px-4 text-right">
              <span className="text-[10px] text-[#6a7080]">100%</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
