"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ClubRevenueOverview } from "@/validations/dashboard/dashboard";

interface Props {
  data?: ClubRevenueOverview;
  isLoading: boolean;
}

const fmtVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(v);

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  diff?: number;
  isLoading: boolean;
  delay: number;
}

function KpiCard({ label, value, sub, trend, diff, isLoading, delay }: KpiCardProps) {
  const [m, setM] = React.useState(false);
  React.useEffect(() => { setM(true); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={m ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.35, delay: delay * 0.07 }}
      className="bg-[#181b22] rounded-2xl p-6 border border-white/[0.07]"
    >
      <p className="text-[11px] text-[#7a8090] font-medium mb-3 uppercase tracking-wide">{label}</p>
      {isLoading ? (
        <Skeleton className="h-9 w-48 bg-white/[0.06]" />
      ) : (
        <p className="text-3xl font-bold text-white tracking-tight leading-none">{value}</p>
      )}
      {sub && !isLoading && (
        <p className="text-[11px] text-[#5a6070] mt-2">{sub}</p>
      )}
      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        {trend !== undefined && !isLoading && (
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "text-[11px] font-bold",
              trend >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
            </span>
          </div>
        )}
        {diff !== undefined && !isLoading && (
          <span className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
            diff >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          )}>
            {diff >= 0 ? "+" : ""}{fmtVND(diff)}
          </span>
        )}
        {trend !== undefined && !isLoading && (
           <span className="text-[10px] text-[#4a5060]">so với kỳ trước</span>
        )}
      </div>
    </motion.div>
  );
}

export default function ManagerClubKpiCards({ data, isLoading }: Props) {
  const expenseDiff = (data?.expenseThisMonth ?? 0) - (data?.expenseLastMonth ?? 0);
  const expenseGrowth = data?.expenseLastMonth
    ? ((data.expenseThisMonth - data.expenseLastMonth) / data.expenseLastMonth) * 100
    : 100;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="Tổng chi phí đầu tư"
        value={fmtVND(data?.totalExpense || 0)}
        sub={`${fmtVND(data?.expenseThisMonth || 0)} tháng này`}
        trend={expenseGrowth}
        diff={expenseDiff}
        isLoading={isLoading}
        delay={0}
      />
      <KpiCard
        label="Chi phí tháng này"
        value={fmtVND(data?.expenseThisMonth || 0)}
        sub={`${(data?.transactionsThisMonth || 0)} giao dịch`}
        isLoading={isLoading}
        delay={1}
      />
      <KpiCard
        label="Tổng giao dịch"
        value={(data?.totalTransactions || 0).toLocaleString("vi-VN")}
        sub={`${(data?.transactionsThisMonth || 0).toLocaleString("vi-VN")} giao dịch tháng này`}
        isLoading={isLoading}
        delay={2}
      />
      <KpiCard
        label="Chi phí TB / giao dịch"
        value={fmtVND(
          (data?.transactionsThisMonth ?? 0) > 0
            ? (data?.expenseThisMonth ?? 0) / (data?.transactionsThisMonth ?? 1)
            : 0
        )}
        sub="Trung bình mỗi giao dịch"
        isLoading={isLoading}
        delay={3}
      />
    </div>
  );
}
