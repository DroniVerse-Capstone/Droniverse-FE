"use client";

import React from "react";
import Image from "next/image";
import { ClubTopBuyersData } from "@/validations/dashboard/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Crown, ShoppingBag, Medal, TrendingUp, User } from "lucide-react";

interface Props {
  data?: ClubTopBuyersData;
  isLoading: boolean;
}

const fmtVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

const RANK_COLORS = [
  { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  { bg: "bg-[#1e2130]", text: "text-[#d1d5db]", border: "border-white/[0.07]" },
  { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
] as const;

export default function ManagerClubTopBuyersSection({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#1e2130]">
            <Skeleton className="h-10 w-10 rounded-lg bg-white/[0.05]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 bg-white/[0.05]" />
              <Skeleton className="h-2 w-full bg-white/[0.05] rounded-full" />
            </div>
            <Skeleton className="h-5 w-24 bg-white/[0.05]" />
          </div>
        ))}
      </div>
    );
  }

  const buyers = data?.buyers || [];
  const totalRevenue = data?.totalSystemRevenue ?? 0;

  if (!buyers.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#1e2130] flex items-center justify-center mx-auto">
            <User size={24} className="text-[#5a6070]" />
          </div>
          <p className="text-[12px] text-[#6a7080]">Chưa có học viên mua khóa học</p>
        </div>
      </div>
    );
  }

  const maxSpent = Math.max(...buyers.map((b) => b.totalSpent), 1);

  return (
    <div className="space-y-1">
      {buyers.map((buyer, i) => {
        const name = buyer.userName || buyer.email.split("@")[0];
        const sharePct = totalRevenue > 0 ? (buyer.totalSpent / totalRevenue) * 100 : 0;
        const barPct = maxSpent > 0 ? (buyer.totalSpent / maxSpent) * 100 : 0;

        return (
          <motion.div
            key={buyer.userId}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="group flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-[#1e2130] transition-all duration-200 cursor-pointer"
          >
            {/* Rank Badge */}
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border",
              i < 3 ? `${RANK_COLORS[i].bg} ${RANK_COLORS[i].border}` : "bg-[#1e2130] border-white/[0.07]"
            )}>
              {i === 0 ? (
                <Crown size={16} className={RANK_COLORS[0].text} fill="currentColor" />
              ) : (
                <span className="text-[12px] font-bold text-[#6a7080]">{i + 1}</span>
              )}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl bg-[#1e2130] border border-white/[0.07] flex-shrink-0 flex items-center justify-center overflow-hidden">
              {buyer.imageUrl ? (
                <Image src={buyer.imageUrl} alt={name} width={40} height={40} className="object-cover w-full h-full" unoptimized />
              ) : (
                <span className="text-sm font-bold text-[#6a7080]">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[12px] font-semibold text-[#d1d5db] truncate group-hover:text-white transition-colors">{name}</p>
                {i === 0 && (
                  <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] font-bold rounded uppercase">Top</span>
                )}
              </div>
              <p className="text-[10px] text-[#5a6070] mt-0.5 flex items-center gap-1">
                <ShoppingBag size={10} />
                {buyer.purchaseCount.toLocaleString("vi-VN")} giao dịch
              </p>
              {/* Progress bar */}
              <div className="mt-2">
                <div className="h-1.5 bg-[#1e2130] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barPct}%` }}
                    transition={{ duration: 0.8, delay: 0.1 + i * 0.06 }}
                    className="h-full rounded-full bg-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Spend */}
            <div className="text-right flex-shrink-0 w-28">
              <div className="flex items-center justify-end gap-1">
                <TrendingUp size={10} className="text-emerald-400" />
                <p className="text-[12px] font-bold text-white">{fmtVND(buyer.totalSpent)}</p>
              </div>
              <p className="text-[10px] text-[#5a6070]">{sharePct.toFixed(1)}%</p>
            </div>
          </motion.div>
        );
      })}

      {/* Summary */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/[0.05]">
        <div className="flex items-center gap-2">
          <User size={12} className="text-[#5a6070]" />
          <span className="text-[10px] text-[#6a7080] font-medium">{buyers.length} học viên</span>
        </div>
        <div className="text-right">
          <p className="text-[14px] font-bold text-white">{fmtVND(totalRevenue)}</p>
          <p className="text-[10px] text-[#5a6070]">tổng doanh thu CLB</p>
        </div>
      </div>
    </div>
  );
}
