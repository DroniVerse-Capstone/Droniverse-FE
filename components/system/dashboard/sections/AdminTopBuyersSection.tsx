"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminTopBuyer } from "@/validations/dashboard/dashboard";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "@/providers/i18n-provider";

interface Props {
  data?: { buyers: AdminTopBuyer[]; totalSystemRevenue: number };
  isLoading: boolean;
}

const formatVND = (v: number, locale: string) => {
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
    maximumFractionDigits: 0,
  }).format(v);
  return locale === "en" ? `${formatted} VND` : `${formatted} ₫`;
};

const RANK_COLORS = [
  "text-blue-400 font-bold",
  "text-[#9ca3af] font-bold",
  "text-amber-400 font-bold",
  "text-[#6a7080]",
  "text-[#6a7080]",
] as const;

export default function AdminTopBuyersSection({ data, isLoading }: Props) {
  const t = useTranslations("SystemDashboard.vipStudents");
  const locale = useLocale();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/[0.03]" />)}
      </div>
    );
  }

  const buyers = data?.buyers || [];
  const totalRevenue = data?.totalSystemRevenue ?? 0;

  if (!buyers.length) {
    return <p className="text-[12px] text-[#6a7080] py-4">{t("empty")}</p>;
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
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
            className="flex items-center gap-3 py-3.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer rounded-lg"
          >
            {/* Rank */}
            <span className={cn("w-5 text-center text-[15px] flex-shrink-0", RANK_COLORS[i] ?? "text-[#5a5f6a] font-bold")}>
              {i + 1}
            </span>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-lg bg-[#1e2130] border border-white/[0.07] flex-shrink-0 flex items-center justify-center overflow-hidden">
              {buyer.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={buyer.imageUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[12px] font-bold text-[#6a7080]">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Info + bar */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{name}</p>
              <p className="text-[10px] text-[#6a7080] mt-0.5">
                {t("transactions", { count: buyer.purchaseCount.toLocaleString(locale === "en" ? "en-US" : "vi-VN") })}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-0.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barPct}%` }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                    className="h-full rounded-full bg-blue-500/70"
                  />
                </div>
              </div>
            </div>

            {/* Spend */}
            <div className="text-right flex-shrink-0 w-36">
              <p className="text-[12px] font-bold text-white">{formatVND(buyer.totalSpent, locale)}</p>
              <p className="text-[10px] text-[#6a7080]">{t("shareOfTotal", { percent: sharePct.toFixed(2) })}</p>
            </div>
          </motion.div>
        );
      })}

      {/* Summary */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.05] mt-2">
        <span className="text-[10px] text-[#6a7080]">{t("footerLabel", { count: buyers.length })}</span>
        <div className="text-right">
          <span className="text-[12px] font-bold text-white">{formatVND(totalRevenue, locale)}</span>
          <p className="text-[10px] text-[#6a7080]">{t("systemTotalLabel")}</p>
        </div>
      </div>
    </div>
  );
}
